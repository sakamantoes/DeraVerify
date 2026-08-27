// controllers/otpController.js

import OtpOrder from "../model/OtpOrder.js";
import CompanyWallet from "../model/CompanyWallet.js";
import smsBowerApi from "../utils/smsBowerApi.js";
import { env } from "../config/constant.js";


// ==================== COUNTRY MAPPING ====================
const countryMap = {
  0: "RU", 1: "UA", 2: "KZ", 3: "US", 4: "GB", 5: "DE", 6: "FR", 7: "IT",
  8: "ES", 9: "NL", 10: "PL", 11: "BR", 12: "MX", 13: "AR", 14: "AU",
  15: "JP", 16: "ID", 17: "TH", 18: "VN", 19: "NG", 20: "NO", 21: "DK",
  22: "CZ", 23: "PT", 24: "RO", 25: "IE",
  usa: "US", us: "US", "united states": "US", uk: "GB", "united kingdom": "GB",
  canada: "CA", ca: "CA", indonesia: "ID", id: "ID", colombia: "CO", co: "CO",
  vietnam: "VN", vn: "VN", "south africa": "ZA", za: "ZA", brazil: "BR", br: "BR",
  philippines: "PH", ph: "PH", malaysia: "MY", my: "MY", australia: "AU", au: "AU",
  netherlands: "NL", nl: "NL", germany: "DE", de: "DE", nigeria: "NG", ng: "NG",
};

const preferredCountries = {
  whatsapp: ["US", "CA", "GB", "NG", "DE", "FR", "ES", "IT", "NL", "BR", "MX", "AR", "AU", "JP", "ID", "TH", "VN"],
  google: ["US", "CA", "GB", "NG", "DE", "FR", "ES", "IT", "NL", "BR", "MX", "AR", "AU", "JP", "ID", "TH", "VN"],
  gmail: ["US", "CA", "GB", "NG", "DE", "FR", "ES", "IT", "NL", "BR", "MX", "AR", "AU", "JP", "ID", "TH", "VN"],
  youtube: ["US", "CA", "GB", "NG", "DE", "FR", "ES", "IT", "NL", "BR", "MX", "AR", "AU", "JP", "ID", "TH", "VN"],
  walmart: ["US", "CA", "GB"],
  instagram: ["US", "CA", "GB", "NG", "DE", "FR", "ES", "IT", "NL", "BR", "MX", "AR", "AU"],
};

const getCountryCode = (countryInput) => {
  const normalized = countryInput?.toString().toLowerCase().trim();
  const mapped = countryMap[normalized];
  if (mapped) return mapped;
  const upperCountry = countryInput?.toString().toUpperCase();
  const validCountries = ["US", "CA", "GB", "RU", "UA", "KZ", "DE", "FR", "IT", "ES", "NL", "PL", "BR", "MX", "AR", "AU", "JP", "ID", "TH", "VN", "NG", "NO", "DK", "CZ", "PT", "RO", "IE", "CO", "ZA", "MY", "CL", "SE", "CM", "AT", "MA", "KE", "HR", "FI", "EG", "GH", "CG", "UY", "GR", "NZ", "BG", "CH"];
  if (validCountries.includes(upperCountry)) return upperCountry;
  throw new Error(`Invalid country: ${countryInput}`);
};

const serviceMap = {
  tg: "telegram", go: "google", fb: "facebook", wa: "whatsapp", ig: "instagram",
  tw: "twitter", ap: "apple", ms: "microsoft", dc: "discord", sn: "snapchat",
  tk: "tiktok", am: "amazon", gp: "gmail", yt: "youtube", li: "linkedin",
  zl: "zoom", ub: "uber", lv: "line", vk: "vkontakte", pf: "paypal",
  sp: "spotify", nt: "netflix", wm: "walmart",
  telegram: "telegram", google: "google", facebook: "facebook", whatsapp: "whatsapp",
  instagram: "instagram", twitter: "twitter", gmail: "gmail", youtube: "youtube",
};

const getServiceName = (serviceInput) => {
  const normalized = serviceInput?.toString().toLowerCase();
  const mapped = serviceMap[normalized];
  if (!mapped) throw new Error(`Invalid service: ${serviceInput}`);
  return mapped;
};


// GET COMPANY STATS
export const getCompanyStats = async (req, res) => {
  try {
    const companyWallet = await CompanyWallet.findOne();
    const totalOrders = await OtpOrder.countDocuments();
    const completedOrders = await OtpOrder.countDocuments({ status: "OTP_RECEIVED" });
    const cancelledOrders = await OtpOrder.countDocuments({ status: "CANCELLED" });
    return res.json({ success: true, data: { wallet: companyWallet || { totalProfit: 0, totalRevenue: 0, totalProviderCost: 0 }, stats: { totalOrders, completedOrders, cancelledOrders, pendingOrders: totalOrders - completedOrders - cancelledOrders } } });
  } catch (error) {
    console.error("GET COMPANY STATS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE MARKUP
export const updateMarkup = async (req, res) => {
  try {
    const { profitMarkup } = req.body;
    if (profitMarkup === undefined || isNaN(profitMarkup) || profitMarkup < 0) return res.status(400).json({ success: false, message: "Valid profitMarkup required (>=0)" });
    let settings = await systemSettingsModel.findOne();
    if (!settings) settings = await systemSettingsModel.create({ profitMarkup: Number(profitMarkup) });
    else settings.profitMarkup = Number(profitMarkup);
    await settings.save();
    return res.json({ success: true, message: "Profit markup updated", data: { profitMarkup: settings.profitMarkup } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ORDER HISTORY
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const orders = await OtpOrder.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, data: orders.map(order => ({ _id: order._id, provider: order.provider, phone: order.phone, service: order.service, country: order.country, status: order.status, cost: order.cost, otpCode: order.otpCode, createdAt: order.createdAt })) });
  } catch (error) {
    console.error("GET ORDER HISTORY ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET ORDER DETAILS
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;
    const order = await OtpOrder.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.userId.toString() !== userId) return res.status(403).json({ success: false, message: "Unauthorized" });
    return res.json({ success: true, data: order });
  } catch (error) {
    console.error("GET ORDER DETAILS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET PREFERRED COUNTRIES
export const getPreferredCountries = async (req, res) => {
  try {
    const { service } = req.params;
    const serviceName = service?.toLowerCase();
    let countries = [];
    if (serviceName === "whatsapp") countries = preferredCountries.whatsapp;
    else if (serviceName === "google" || serviceName === "gmail" || serviceName === "youtube") countries = preferredCountries.google;
    else if (serviceName === "walmart") countries = preferredCountries.walmart;
    else if (serviceName === "instagram") countries = preferredCountries.instagram;
    else countries = Object.keys(countryMap).filter(c => c.length === 2 && c === c.toUpperCase());
    return res.json({ success: true, service: serviceName, countries });
  } catch (error) {
    console.error("GET PREFERRED COUNTRIES ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET AVAILABLE SERVICES
export const getAvailableServices = async (req, res) => {
  const API_KEY = env.smsBowerApiKey
  try {
    const response = await smsBowerApi.get("/stubs/handler_api.php", {
      params: { api_key: API_KEY, action: "getServicesList" },
    });
    return res.json({ success: true, services: response.data });
  } catch (error) {
    console.error("Get services error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET SMSBOWER BALANCE
export const getSmsBowerBalance = async (req, res) => {
  const API_KEY = env.sms_bower_api_key;
  try {
    const response = await smsBowerApi.get("/stubs/handler_api.php", {
      params: { api_key: API_KEY, action: "getBalance" },
    });
    return res.json({ success: true, balance: response.data });
  } catch (error) {
    console.error("Get SMSBower balance error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET SMSACTIVATE BALANCE
export const getSmsActivateBalance = async (req, res) => {
  try {
    const response = await smsActivateApi.get("/sms.php", {
      params: { api_key: process.env.SMS_ACTIVATE_API_KEY, action: "get_balance" },
    });
    return res.json({ success: true, balance: response.data });
  } catch (error) {
    console.error("Get SMSActivate balance error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET SMSBOWER COUNTRIES
export const getSmsBowerCountries = async (req, res) => {
  try {
    const API_KEY = env.smsBowerApiKey;

    console.log("🌍 Fetching SMSBower countries...");
    console.log(`🔑 API Key exists: ${!!API_KEY}`);

    const response = await smsBowerApi.get("/stubs/handler_api.php", {
      params: {
        api_key: API_KEY,
        action: "getCountries",
      },
      timeout: 30000,
    });

    const countries = response.data;

    if (!countries) {
      return res.status(500).json({
        success: false,
        message: "No countries returned from SMSBower",
      });
    }

    // Return ALL country fields
    const formattedCountries = Array.isArray(countries)
      ? countries.map((country) => ({
          ...country,
        }))
      : Object.values(countries).map((country) => ({
          ...country,
        }));

    return res.status(200).json({
      success: true,
      total: formattedCountries.length,
      countries: formattedCountries,
    });
  } catch (error) {
    console.error("❌ GET SMSBOWER COUNTRIES ERROR:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch countries from SMSBower",
      error: error.message,
    });
  }
};

// WEBHOOKS
export const smsBowerWebhook = async (req, res) => {
  try {
    console.log("📩 SMSBOWER WEBHOOK:", req.body);
    const { activation_id, sms_code, status } = req.body;
    if (!activation_id) return res.status(400).json({ success: false, message: "Activation ID missing" });
    const order = await OtpOrder.findOne({ orderId: activation_id.toString(), provider: "smsbower" });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (sms_code) { order.otpCode = sms_code; order.status = "OTP_RECEIVED"; order.completedAt = new Date(); await order.save(); console.log(`✅ OTP: ${sms_code}`); }
    if (status === "CANCELLED") { order.status = "CANCELLED"; await order.save(); }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SMSBOWER WEBHOOK ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const smsActivateWebhook = async (req, res) => {
  try {
    console.log("📩 SMSACTIVATE WEBHOOK:", req.body);
    const { activationid, sms_code } = req.body;
    if (!activationid) return res.status(400).json({ success: false, message: "Activation ID missing" });
    const order = await OtpOrder.findOne({ orderId: activationid.toString(), provider: "smsactivate" });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (sms_code) { order.otpCode = sms_code; order.status = "OTP_RECEIVED"; order.completedAt = new Date(); await order.save(); console.log(`✅ OTP: ${sms_code}`); }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("SMSACTIVATE WEBHOOK ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const nodeOtpWebhook = async (req, res) => {
  try {
    console.log("📩 NODEOTP WEBHOOK:", req.body);
    const { success, event, data } = req.body;
    if (!success || !data) return res.status(400).json({ success: false, message: "Invalid payload" });
    const order = await OtpOrder.findOne({ orderId: data.orderId.toString(), provider: "nodeotp" });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (event === "otp_received") { order.otpCode = data.code; order.status = "OTP_RECEIVED"; order.completedAt = new Date(); await order.save(); console.log(`✅ OTP: ${data.code}`); }
    if (event === "order_cancelled") order.status = "CANCELLED";
    if (event === "order_expired") order.status = "EXPIRED";
    await order.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("NODEOTP WEBHOOK ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};