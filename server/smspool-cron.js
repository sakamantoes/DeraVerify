// @ts-nocheck
import axios from "axios";
import mongoose from "mongoose";
import AvailableService from "./src/model/ServicesAvailable.js";
import { env } from "./src/config/constant.js";
import { provider2CountryServices } from "./src/utils/serviceCode.js";

const REQUEST_TIMEOUT_MS = 15000;
const BULK_WRITE_CHUNK_SIZE = 500;
let isRunning = false;

const serviceCountryMap = new Map(
  provider2CountryServices.map((it) => [
    `${it.service.toLowerCase()}|${it.country.toLowerCase()}`,
    it,
  ]),
);

const SMSPOOLCRON = async () => {
  if (isRunning) {
    console.log("SMSPOOL cron job is already running");
    return { skipped: true, reason: "already_running" };
  }

  isRunning = true;
  console.log("starting up SMSPOOL-CRON-JOB");
  const data = { max_price: 10, key: env.sms_pool_api_key };
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("connecting to mongoDb.....");
      await mongoose.connect(env.mongodb_url);
      console.log("MongoDB connected successfully");
    }

    const response = await axios.post(
      "https://api.smspool.net/request/pricing",
      data,
      { timeout: REQUEST_TIMEOUT_MS },
    );

    if (!Array.isArray(response.data)) {
      console.log("SMSPOOL: unexpected response shape", response.data);
      return [];
    }

    await AvailableService.updateMany(
      { provider: "smspool" },
      { $set: { availability: false } },
    );

    let preparedCount = 0;
    let operations = [];
    const fetchedAt = new Date();

    const flushOperations = async () => {
      if (operations.length === 0) return;
      const chunk = operations;
      operations = [];
      await AvailableService.bulkWrite(chunk, { ordered: false });
    };

    for (const item of response.data) {
      if (!item.service_name || !item.country_name) continue;

      const service_name = serviceCountryMap.get(
        `${item.service_name.toLowerCase()}|${item.country_name.toLowerCase()}`,
      );

      if (!service_name) continue;

      operations.push({
        updateOne: {
          filter: {
            providerCountry: item.country,
            providerService: item.service,
            providerId: String(item.pool),
            provider: "smspool",
          },
          update: {
            $set: {
              internalService:
                service_name.service === "TikTok/Douyin"
                  ? "TikTok"
                  : service_name.service,
              internalCountry: service_name.country,
              providerPrice: item.price,
              availability: true,
              lastFetchedAt: fetchedAt,
            },
          },
          upsert: true,
        },
      });
      preparedCount++;

      if (operations.length >= BULK_WRITE_CHUNK_SIZE) {
        await flushOperations();
      }
    }

    await flushOperations();

    if (preparedCount === 0) {
      console.log("SMSPOOL: no valid operations to write");
      return [];
    }
    console.log("data saved successfully");
    console.log(
      `smspool cron job ran successfully and Prepared ${preparedCount} operations`,
    );
    return { preparedCount };
  } catch (error) {
    console.log("smspool CRON JOB ERROR: ", error.message);
    return { error: error.message };
  } finally {
    isRunning = false;
  }
};

export default SMSPOOLCRON;
