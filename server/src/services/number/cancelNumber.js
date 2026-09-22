import axios from "axios";
import { env } from "../../config/constant.js";
import smspool_api from "../../utils/smspool.js";

const normalizeCancelResult = (provider, response) => {
  const raw = response?.data ?? response;

  if (!raw) {
    return {
      success: false,
      provider,
      raw,
      normalizedStatus: "FAILED",
    };
  }

  if (typeof raw === "string") {
    const value = raw.trim();
    const upper = value.toUpperCase();

    return {
      success:
        upper.includes("ACCESS_CANCEL") ||
        upper.includes("CANCELLED") ||
        upper.includes("SUCCESS"),
      provider,
      raw,
      normalizedStatus:
        upper.includes("ACCESS_CANCEL") ||
        upper.includes("CANCELLED") ||
        upper.includes("SUCCESS")
          ? "CANCELLED"
          : "FAILED",
    };
  }

  const successValue = raw.success ?? raw.status ?? raw.result;
  const numericSuccess = Number(successValue);

  return {
    success:
      successValue === true ||
      successValue === 1 ||
      numericSuccess === 1 ||
      String(raw.message || "")
        .toUpperCase()
        .includes("CANCEL") ||
      String(raw.status || "")
        .toUpperCase()
        .includes("SUCCESS") ||
      String(raw.result || "")
        .toUpperCase()
        .includes("SUCCESS"),
    provider,
    raw,
    normalizedStatus:
      successValue === true || successValue === 1 || numericSuccess === 1
        ? "CANCELLED"
        : "FAILED",
  };
};

export const cancelNumberServices = async (payload) => {
  switch (payload.provider) {
    case "smsbower": {
      const resBower = await axios.get(
        `https://smsbower.page/stubs/handler_api.php?api_key=${env.sms_bower_api_key}&action=setStatus&status=8&id=${payload.activationId}`,
      );

      const normalized = normalizeCancelResult("smsbower", resBower.data);
      console.log("cancelling smsbower: ", normalized);
      return normalized;
    }
    case "smspool": {
      const res = await smspool_api.post("/sms/cancel", {
        orderid: payload.activationId,
      });

      const normalized = normalizeCancelResult("smspool", res.data);
      console.log("cancelling smspool: ", normalized);
      return normalized;
    }
    default:
      return {
        success: false,
        provider: payload?.provider,
        raw: payload,
        normalizedStatus: "FAILED",
      };
  }
};
