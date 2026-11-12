import axios from "axios";
import { env } from "../../config/constant.js";
import smspool_api from "../../utils/smspool.js";

const normalizeSmsBowerStatus = (response) => {
  let otpCode = null;
  let otpMessage =
    typeof response === "string" ? response : JSON.stringify(response);
  let status = "WAITING_FOR_SMS";

  if (typeof response === "string") {
    if (response.startsWith("STATUS_OK")) {
      const parts = response.split(":");
      otpCode = parts[parts.length - 1];
      status = "OTP_RECEIVED";
    }

    if (response === "STATUS_CANCEL") {
      status = "CANCELLED";
    }

    if (
      response === "STATUS_WAIT_CODE" ||
      response.startsWith("STATUS_WAIT_RETRY")
    ) {
      status = "WAITING_FOR_SMS";
    }
  } else if (response && typeof response === "object") {
    otpMessage =
      response.text ||
      response.smsText ||
      response.message ||
      JSON.stringify(response);
    otpCode = response.code || response.smsCode || null;

    if (otpCode) {
      status = "OTP_RECEIVED";
    }
  }

  return {
    provider: "smsbower",
    status,
    otpCode,
    otpMessage,
    raw: response,
  };
};

const normalizeSmsPoolStatus = (response) => {
  const providerStatus = Number(response?.status);
  const smsText = response?.full_sms || response?.sms || response?.message;
  let status = "WAITING_FOR_SMS";

  if (providerStatus === 1) {
    status = "WAITING_FOR_SMS";
  }

  if (providerStatus === 3) {
    status = "OTP_RECEIVED";
  }

  if (providerStatus === 2) {
    status = "FAILED";
  }

  if (providerStatus === 5 || providerStatus === 6) {
    status = "CANCELLED";
  }

  console.log("unfildwwt", response);

  return {
    provider: "smspool",
    status,
    otpCode: response?.sms || null,
    otpMessage: smsText ? String(smsText) : JSON.stringify(response),
    raw: response,
  };
};

export const requestUserOtp = async (payload) => {
  switch (payload.provider) {
    case "smsbower": {
      const response = await axios.get(
        "https://smsbower.page/stubs/handler_api.php",
        {
          params: {
            api_key: env.sms_bower_api_key,
            action: "getStatus",
            id: payload.activationId,
          },
        },
      );

      return normalizeSmsBowerStatus(response.data);
    }

    case "smspool": {
      const response = await smspool_api.post("/sms/check", {
        orderid: payload.activationId,
        key: env.sms_pool_api_key,
      });

      console.log("smspool status check: ", response.data);
      return normalizeSmsPoolStatus(response.data);
    }

    case "daisy": {
      try {
        const response = await axios.get(
          "https://daisysms.io/stubs/handler_api.php",
          {
            params: {
              api_key: env.daisy_api_key,
              action: "getStatus",
              id: payload.activationId,
              text: 1,
            },
          },
        );
        const raw = String(response.data || "").trim();
        const codeMatch = raw.match(/^STATUS_OK:(.+)$/);
        console.log("[checkNumber.js][DaisySMS] getStatus response", {
          activationId: payload.activationId,
          response: codeMatch ? "STATUS_OK:<code omitted>" : raw,
          hasMessageText: Boolean(response.headers?.["x-text"]),
        });
        let status = "WAITING_FOR_SMS";
        if (codeMatch) status = "OTP_RECEIVED";
        else if (raw === "STATUS_CANCEL") status = "CANCELLED";
        else if (raw === "NO_ACTIVATION") status = "FAILED";

        if (codeMatch && !payload.canGetAnotherSms) {
          try {
            const completionResponse = await axios.get(
              "https://daisysms.io/stubs/handler_api.php",
              {
                params: {
                  api_key: env.daisy_api_key,
                  action: "setStatus",
                  id: payload.activationId,
                  status: 6,
                },
              },
            );
            console.log("[checkNumber.js][DaisySMS] setStatus response", {
              activationId: payload.activationId,
              response: completionResponse.data,
            });
          } catch (error) {
            console.error("[checkNumber.js][DaisySMS] setStatus request failed", {
              activationId: payload.activationId,
              message: error.message,
              httpStatus: error.response?.status,
              providerResponse: error.response?.data,
            });
          }
        }

        return {
          provider: "daisy",
          status,
          otpCode: codeMatch?.[1] || null,
          otpMessage: response.headers?.["x-text"] || raw,
          raw: response.data,
        };
      } catch (error) {
        console.error("[checkNumber.js][DaisySMS] getStatus request failed", {
          activationId: payload.activationId,
          message: error.message,
          httpStatus: error.response?.status,
          providerResponse: error.response?.data,
        });
        throw error;
      }
    }

    default:
      throw new Error("invalid provider");
  }
};
