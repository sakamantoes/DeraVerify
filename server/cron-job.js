import mongoose from "mongoose";
import { env } from "./src/config/constant.js";
import axios from "axios";
import { countries, services } from "./src/utils/neededCountries.js";
import AvailableService from "./src/model/ServicesAvailable.js";
import { formatServiceName } from "./src/utils/serviceCode.js";

const MAX_ALLOWED_PRICE = 5;
const REQUEST_TIMEOUT_MS = 15000;
const BULK_WRITE_CHUNK_SIZE = 500;
const REQUEST_CONCURRENCY = 5;
let isRunning = false;

const countryById = new Map(
  countries.map((country) => [country.countryId, country]),
);

const writeInChunks = async (operations) => {
  for (let index = 0; index < operations.length; index += BULK_WRITE_CHUNK_SIZE) {
    await AvailableService.bulkWrite(
      operations.slice(index, index + BULK_WRITE_CHUNK_SIZE),
      { ordered: false },
    );
  }
};

const CronJob = async () => {
  if (isRunning) {
    console.log("SMSBOWER cron job is already running");
    return { skipped: true, reason: "already_running" };
  }

  isRunning = true;
  console.log("Starting up SMSBOWER-CRON-JOB");
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("connecting to mongoDb.....");
      await mongoose.connect(env.mongodb_url);
      console.log("MongoDB connected successfully");
    }

    await AvailableService.updateMany(
      { provider: "smsbower" },
      { $set: { stock: 0 } },
    );

    console.log("fetching data...");

    let preparedCount = 0;
    const fetchedAt = new Date();

    const fetchAndSaveService = async (item) => {
      const response = await axios.get(
        `https://smsbower.page/stubs/handler_api.php?api_key=${env.sms_bower_api_key}&action=getPricesV3&service=${item.service}&country=${item.countryId}`,
        { timeout: REQUEST_TIMEOUT_MS },
      );

      const operations = [];

      for (const countryId in response.data) {
        const services = response.data[countryId];
        const matchedCountry = countryById.get(Number(countryId));

        if (!matchedCountry) {
          continue;
        }

        for (const serviceCode in services) {
          const providers = services[serviceCode];
          const mappedService = formatServiceName(serviceCode);

          if (!mappedService) {
            continue;
          }

          for (const providerKey in providers) {
            const details = providers[providerKey];

            // special rule for US numbers
            // global rule for others
            if (Number(details.price) > MAX_ALLOWED_PRICE) {
              continue;
            }

            if (Number(details.count) < 100 || !details.count) {
              continue;
            }

            operations.push({
              updateOne: {
                filter: {
                  providerService: serviceCode,
                  providerCountry: countryId,
                  provider: "smsbower",
                  providerId: String(providerKey),
                },

                update: {
                  $set: {
                    providerPrice: details.price,
                    stock: details.count,
                    internalService: mappedService,
                    internalCountry: matchedCountry?.country,
                    lastFetchedAt: fetchedAt,
                  },
                },

                upsert: true,
              },
            });
          }
        }
      }

      await writeInChunks(operations);
      preparedCount += operations.length;
    };

    for (let index = 0; index < services.length; index += REQUEST_CONCURRENCY) {
      await Promise.all(
        services
          .slice(index, index + REQUEST_CONCURRENCY)
          .map(fetchAndSaveService),
      );
    }

    console.log("data saved successfully");

    console.log(
      `SMSBOWER cron job ran successfully and Prepared ${preparedCount} operations`,
    );
    return { preparedCount };
  } catch (err) {
    console.error("SMSBOWER CRON JOB ERROR ", err);
    return { error: err.message };
  } finally {
    isRunning = false;
  }
};

export default CronJob;
