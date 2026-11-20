import { Router } from "express";
import { validateData } from "../validator/validator.js";
import {
  initialiseDeposit,
  callbackUrlHandler,
  getPaymentStatus,
  initializeManualPayment,
  webhookHandler,
  initializeQuestPayment,
  questWebhook,
  ctexWebhook,
  initializeCtexPayment,
} from "../controller/payment.js";
import {
  initialiseDepositValidator,
  callbackUrlValidator,
  paymentStatusValidator,
  manualPaymentValidator,
} from "../validator/payment.validator.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { validateUserRole } from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/squad/initialize-deposit",
  authMiddleware,
  validateUserRole,
  initialiseDepositValidator,
  validateData,
  initialiseDeposit,
);

router.post(
  "/manual/initialize-deposit",
  authMiddleware,
  validateUserRole,
  manualPaymentValidator,
  validateData,
  initializeManualPayment,
);

router.post(
  "/quest/initialize-deposit",
  authMiddleware,
  validateUserRole,
  initialiseDepositValidator,
  validateData,
  initializeQuestPayment,
);

router.post(
  "/callback",
  callbackUrlValidator,
  validateData,
  callbackUrlHandler,
);

router.post("/status", paymentStatusValidator, validateData, getPaymentStatus);
router.post(
  "/ctex/initialize-deposit",
  authMiddleware,
  validateUserRole,
  initialiseDepositValidator,
  validateData,
  initializeCtexPayment,
);
router.post("/ctex/webhook", ctexWebhook);

router.post("/webhook", webhookHandler);
router.post("/quest/webhook", questWebhook);

export default router;
