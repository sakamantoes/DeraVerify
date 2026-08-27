import express from "express";

const router = express.Router();

import {
  createLog,
  getLogs,
  buyLog,
  updateLog,
  deleteLog,
  myPurchasedLogs,
  getLogById,
} from "../controller/logs.js";

import { logSchema } from "../validator/auth.validator.js";

import { validateData } from "../validator/validator.js";

import authMiddleware, {
  validateAdminRole,
  validateUserRole,
} from "../middleware/authMiddleware.js";

// CREATE LOG
router.post(
  "/create",
  authMiddleware,
  validateAdminRole,
  logSchema,
  validateData,
  createLog,
);

// GET ALL LOGS
router.get("/", authMiddleware, getLogs);

// BUY LOG
router.post("/buy/:id", authMiddleware, buyLog);

// UPDATE LOG
router.put(
  "/update/:id",
  logSchema,
  validateData,
  authMiddleware,
  validateAdminRole,
  updateLog,
);

// DELETE LOG
router.delete("/delete/:id", authMiddleware, validateAdminRole, deleteLog);

// USER PURCHASE HISTORY
router.get("/my-logs", authMiddleware, myPurchasedLogs);
router.get("/:id",authMiddleware, getLogById);

export default router;
