import axios from "axios";
import mongoose from "mongoose";
import AvailableService from "./src/model/ServicesAvailable.js";
import { env } from "./src/config/constant.js";
import { provider2CountryServices } from "./src/utils/serviceCode.js";

const MAX_ALLOWED_PRICE = 10;

const SMSPOOLCRON = async () => {
  console.log("starting up SMSPOOL-CRON-JOB");
  try {
    console.log("connecting to mongoDb.....");
    await mongoose.connect(env.mongodb_url);
    console.log("MongoDB connected successfully");

    let arr = [];
    const data = { max_price: 10, key: env.sms_pool_api_key };

    await AvailableService.updateMany(
      { provider: "smspool" },
      { $set: { availability: false } },
    );

    console.log("fetching data...");

    const response = await axios.post(
      "https://api.smspool.net/request/pricing",
      data,
    );

    for (const item of response.data) {
      const service_name = provider2CountryServices.find(
        (it) =>
          it.service.toLowerCase() === item.service_name.toLowerCase() &&
          it.country.toLowerCase() === item.country_name.toLowerCase(),
      );

      if (!service_name) continue;

      if (Number(item.price) > MAX_ALLOWED_PRICE) continue;

      arr.push({
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
              providerId: String(item.pool),
              availability: true,
              lastFetchedAt: new Date(),
            },
          },
          upsert: true,
        },
      });
    }

    console.log("saving data....");

    await AvailableService.bulkWrite(arr);
    console.log("data saved successfully");

    console.log(
      `SMSPOOL cron job ran successfully and Prepared ${arr.length} operations`,
    );
  } catch (error) {
    console.log("SMSPOOL CRON JOB ERROR: ", error.message);
  }
};

export default SMSPOOLCRON;