// routes/otpRoutes.js (Testing version - remove in production)
import express from "express";
import {
  getCompanyStats,
  nodeOtpWebhook,
  smsActivateWebhook,
  getSmsBowerBalance,
} from "../controller/otpController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateAdminRole } from "../middleware/authMiddleware.js";

const router = express.Router();


// admin routes
router.get("/company-stats", authMiddleware, validateAdminRole, getCompanyStats);
router.get("/sms-balance", authMiddleware, validateAdminRole, getSmsBowerBalance);

//webhook route
router.post("/webhook/nodeotp", nodeOtpWebhook);
router.post("/webhook/smsactivate", smsActivateWebhook);

export default router;