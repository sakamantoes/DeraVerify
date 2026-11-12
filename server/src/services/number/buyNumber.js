import axios from "axios";
import { env } from "../../config/constant.js";
import smspool_api from "../../utils/smspool.js";

export const buyNumberOption = async (payload) => {
  switch (payload.provider) {
    case "smsbower": {
      const params = new URLSearchParams({
        api_key: env.sms_bower_api_key,
        action: "getNumberV2",
        service: payload.providerService,
        country: payload.providerCountry,
        maxPrice: String(payload.providerPrice ?? ""),
        minPrice: "0.0001",
        userID: String(env.sms_bower_user_id || ""),
      });

      if (payload.providerId) params.append("providerIds", String(payload.providerId));


      const resBower = await axios.get(
        `https://smsbower.page/stubs/handler_api.php?${params.toString()}`,
      );

      const data = resBower.data;
      console.log("smsbower data:", data);

      if (typeof data === "string") {
        console.error("smsbower error: ", {
          ...payload,
          response: data,
        });
        throw new Error(`SMSBower purchase failed: ${data}`);
      }

      if (!data.activationId || !data.phoneNumber) {
        throw new Error(`SMSBower purchase returned invalid data`);
      }

      return {
        provider: "smsbower",
        activationId: data.activationId,
        phoneNumber: data.phoneNumber,
        canGetAnotherSms: data.canGetAnotherSms,
        activationOperator: data.activationOperator,
        activationTime: data.activationTime,
        activationCost: data.activationCost,
        raw: data,
      };
    };
    case "daisy": {
      try {
        const response = await axios.get(
          "https://daisysms.io/stubs/handler_api.php",
          {
            params: {
              api_key: env.daisy_api_key,
              action: "getNumber",
              service: payload.providerService,
              country: payload.providerCountry,
              max_price: payload.providerPrice,
            },
          },
        );

        const raw = String(response.data || "").trim();
        const match = raw.match(/^ACCESS_NUMBER:([^:]+):(.+)$/);
        if (!match) {
          console.error("[buyNumber.js][DaisySMS] getNumber returned an error", {
            service: payload.providerService,
            country: payload.providerCountry,
            response: raw || "empty response",
          });
          throw new Error(`DaisySMS purchase failed: ${raw || "empty response"}`);
        }

        console.log("[buyNumber.js][DaisySMS] getNumber succeeded", {
          activationId: match[1],
          service: payload.providerService,
          country: payload.providerCountry,
          response: "ACCESS_NUMBER:<activationId>:<phone number omitted>",
        });
        return {
          provider: "daisy",
          activationId: match[1],
          phoneNumber: match[2],
          canGetAnotherSms: Boolean(payload.canGetAnotherSms),
          activationTime: new Date(),
          activationCost: Number(response.headers?.["x-price"] || payload.providerPrice),
          raw: response.data,
        };
      } catch (error) {
        if (!error.message.startsWith("DaisySMS purchase failed:")) {
          console.error("[buyNumber.js][DaisySMS] getNumber request failed", {
            service: payload.providerService,
            country: payload.providerCountry,
            message: error.message,
            httpStatus: error.response?.status,
            providerResponse: error.response?.data,
          });
        }
        throw error;
      }
    }
    case "smspool":
      const res = await smspool_api.post("/purchase/sms", {
        country: payload.providerCountry,
        service: payload.providerService,
        pool: Number(payload.providerId),
        max_price: payload.providerPrice + 0.5,
        pricing_option: 1,
      });

      const dataPool = res.data;

      if (dataPool.success === 0) {
        console.error("smspool error: ", dataPool);
        throw new Error(
          `SMSPOOL purchase failed: ${dataPool.message || "Unknown error"}`,
        );
      }

      if (!dataPool.order_id || !dataPool.number) {
        console.error("smspool error: ", dataPool);
        throw new Error(
          dataPool.message || "SMSPOOL purchase returned invalid data",
        );
      }

      console.log(dataPool);

      return {
        provider: "smspool",
        activationId: dataPool.order_id,
        phoneNumber: dataPool.number,
        activationTime: new Date(Number(dataPool.expiration) * 1000),
        canGetAnotherSms: true,
        activationCost: dataPool.cost,
        raw: dataPool,
      };

    default:
      throw new Error("invalid provider");
  }
};
