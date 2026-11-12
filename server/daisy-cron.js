import axios from "axios";
import mongoose from "mongoose";
import AvailableService from "./src/model/ServicesAvailable.js";
import { env } from "./src/config/constant.js";
import { countries } from "./src/utils/neededCountries.js";
import {
  filteredCountries,
  serviceNames,
} from "./src/utils/serviceCode.js";

const REQUEST_TIMEOUT_MS = 30000;
const BULK_WRITE_CHUNK_SIZE = 500;
let isRunning = false;

const countryAliases = {
  USA: "United States",
  "Russian Federation": "Russia",
  "Viet nam": "Vietnam",
  "Lao People`s": "Laos",
  Argentinas: "Argentina",
};

const internalCountries = new Set(filteredCountries);
const countryById = new Map(
  countries.map(({ country, countryId }) => [
    String(countryId),
    countryAliases[country] || country,
  ]),
);
const DEFAULT_DAISY_COUNTRY_ID = "187";
const normalizedServiceNames = new Map(
  Object.values(serviceNames).map((name) => [
    String(name).toLowerCase().replace(/[^a-z0-9]/g, ""),
    name,
  ]),
);
const daisyServiceAliases = {
  google: "Google/Gmail",
  instagram: "Instagram / Threads",
  tiktok: "TikTok",
  twitter: "Twitter / X",
  chatgpt: "OpenAI / ChatGPT",
  openai: "OpenAI / ChatGPT",
  googlechat: "Google Chat",
  googlevoice: "Google Voice",
};

const getInternalService = (serviceCode) => {
  const normalizedCode = String(serviceCode).toLowerCase();
  return (
    serviceNames[normalizedCode] ||
    daisyServiceAliases[normalizedCode] ||
    normalizedServiceNames.get(normalizedCode.replace(/[^a-z0-9]/g, "")) ||
    normalizedCode
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase())
  );
};

const isPriceDetails = (value) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  (value.cost !== undefined || value.price !== undefined) &&
  value.count !== undefined;

const parseMultiSms = (details) => {
  const value = details?.multi ?? details?.canGetAnotherSms;
  return [true, 1, "1", "true"].includes(
    typeof value === "string" ? value.toLowerCase() : value,
  );
};

const flushOperations = async (operations) => {
  for (
    let index = 0;
    index < operations.length;
    index += BULK_WRITE_CHUNK_SIZE
  ) {
    await AvailableService.bulkWrite(
      operations.slice(index, index + BULK_WRITE_CHUNK_SIZE),
      { ordered: false },
    );
  }
};

const DaisyCron = async () => {
  if (isRunning) {
    console.log("[daisy-cron.js] DaisySMS cron job is already running");
    return { skipped: true, reason: "already_running" };
  }

  isRunning = true;
  try {
    if (!env.daisy_api_key) throw new Error("DAISY_API_KEY is not configured");

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(env.mongodb_url);
    }

    const response = await axios.get(
      "https://daisysms.io/stubs/handler_api.php",
      {
        params: {
          api_key: env.daisy_api_key,
          action: "getPricesVerification",
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
    );

    const priceList = response.data;

    console.log("[daisy-cron.js] DaisySMS prices received", {
      httpStatus: response.status,
      topLevelEntries: Object.keys(priceList || {}).length,
      sampleKeys: Object.keys(priceList || {}).slice(0, 5),
    });
    if (
      !priceList ||
      typeof priceList !== "object" ||
      Array.isArray(priceList)
    ) {
      throw new Error(
        `Unexpected DaisySMS price response: ${String(priceList)}`,
      );
    }

    const operations = [];
    const skipped = { country: 0, invalidPriceOrStock: 0 };
    const fetchedAt = new Date();
    const addService = (serviceCode, countryId, details) => {
      const internalCountry = countryById.get(String(countryId));
      const price = Number(details?.cost ?? details?.price);
      const stock = Number(details?.count);
      if (!internalCountry || !internalCountries.has(internalCountry)) {
        skipped.country++;
        return;
      }
      if (
        !Number.isFinite(price) ||
        price <= 0 ||
        !Number.isFinite(stock) ||
        stock <= 0
      ) {
        skipped.invalidPriceOrStock++;
        return;
      }

      operations.push({
        updateOne: {
          filter: {
            providerService: serviceCode,
            providerCountry: String(countryId),
            provider: "daisy",
            providerId: "default",
          },
          update: {
            $set: {
              providerPrice: price,
              stock: Math.min(stock, 100),
              canGetAnotherSms: parseMultiSms(details),
              internalService: getInternalService(serviceCode),
              internalCountry,
              availability: true,
              lastFetchedAt: fetchedAt,
            },
            $setOnInsert: {
              active: false,
              isVisible: false,
            },
          },
          upsert: true,
        },
      });
    };

    for (const [firstKey, firstValue] of Object.entries(priceList)) {
      if (isPriceDetails(firstValue)) {
        // The observed Daisy response is a flat service -> details object.
        // Daisy's documented country code 187 is the USA.
        addService(firstKey, DEFAULT_DAISY_COUNTRY_ID, firstValue);
        continue;
      }
      if (!firstValue || typeof firstValue !== "object") continue;

      const firstKeyIsCountry = countryById.has(String(firstKey));
      for (const [secondKey, secondValue] of Object.entries(firstValue)) {
        if (!isPriceDetails(secondValue)) continue;

        if (firstKeyIsCountry) {
          // country -> service -> details (getPrices)
          addService(secondKey, firstKey, secondValue);
        } else {
          // service -> country -> details (getPricesVerification)
          addService(firstKey, secondKey, secondValue);
        }
      }
    }

    if (operations.length === 0) {
      throw new Error(
        `Daisy price response yielded no database rows; skipped countries=${skipped.country}, invalid price/stock=${skipped.invalidPriceOrStock}`,
      );
    }

    // Only expire old rows after a valid price response was received.
    await AvailableService.updateMany(
      { provider: "daisy" },
      { $set: { availability: false, stock: 0 } },
    );
    await flushOperations(operations);

    console.log(
      `[daisy-cron.js] DaisySMS cron completed; saved ${operations.length} services`,
    );
    return { preparedCount: operations.length };
  } catch (error) {
    console.error("[daisy-cron.js] DaisySMS cron failed", {
      message: error.message,
      httpStatus: error.response?.status,
      providerResponse: error.response?.data,
    });
    return { error: error.message };
  } finally {
    isRunning = false;
  }
};

export default DaisyCron;

DaisyCron();
