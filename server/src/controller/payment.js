import axios from "axios";
import { env } from "../config/constant.js";
import WalletTransaction from "../model/WalletTransactions.js";
import User from "../model/User.js";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  sendDepositSuccessNotification,
  sendDepositFailedNotification,
  sendPaymentReceivedNotification,
} from "./notificationController.js";

const ctex = axios.create({
  baseURL: env.ctex_base_url,
  headers: { Authorization: `Bearer ${env.ctex_api_key}` },
  timeout: 30000,
});

const normalizeSquadStatus = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "success" || normalizedStatus === "successful") {
    return "SUCCESS";
  }

  if (normalizedStatus === "failed" || normalizedStatus === "failure") {
    return "FAILED";
  }

  return "PENDING";
};

const initialiseDeposit = async (req, res, next) => {
  const { amount } = req.body;
  const user = req.user;

  try {
    const data = {
      email: user.email,
      amount: Number(amount * 100),
      currency: "NGN",
      initiate_type: "inline",
      callback_url: "https://www.smswinners.online/payment/status",
    };

    const squad = await axios.post(
      "https://api-d.squadco.com/transaction/initiate",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${env.squad_api_secret}`,
        },
      },
    );

    if (!squad || squad.data.success === false || !squad.data.data) {
      res.statusCode = 400;
      throw new Error(squad.data.message || "Failed to initiate deposit");
    }

    const value = squad.data.data;

    await WalletTransaction.create({
      userId: user._id,
      amount: value.transaction_amount / 100,
      type: "DEPOSIT",
      referenceId: value.transaction_ref,
      paymentMethod: "SQUAD",
      depositorName: user.username,
    });

    res.status(201).json({
      success: true,
      message: "Deposit initiated, you will be notified once it's processed",
      data: value.checkout_url,
    });
  } catch (error) {
    console.log(error.response?.data);
    console.log(error.response?.status);
    next(error);
  }
};

const callbackUrlHandler = async (req, res, next) => {
  const { referenceId } = req.body;

  try {
    // Match our reference, or the provider's own reference (CTEX stores it in orderId)
    const transaction = await WalletTransaction.findOne({
      $or: [{ referenceId }, { orderId: referenceId }],
    });

    if (!transaction) {
      res.statusCode = 404;
      throw new Error("Transaction not found");
    }

    res.status(200).json({
      success: true,
      message: "Transaction callback received",
      data: transaction.status,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentStatus = async (req, res, next) => {
  const { referenceId } = req.body;

  try {
    // Match our reference, or the provider's own reference (CTEX stores it in orderId)
    const transaction = await WalletTransaction.findOne({
      $or: [{ referenceId }, { orderId: referenceId }],
    });

    if (!transaction) {
      res.statusCode = 404;
      throw new Error("Transaction not found");
    }

    res.status(200).json({
      success: true,
      message: "Payment status fetched",
      data: {
        referenceId: transaction.referenceId,
        status: transaction.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const webhookHandler = async (req, res, next) => {
  const event = req.body;
  const session = await mongoose.startSession();

  try {
    const hash = crypto
      .createHmac("sha512", env.squad_api_secret)
      .update(JSON.stringify(event))
      .digest("hex")
      .toUpperCase();

    if (hash !== req.headers["x-squad-encrypted-body"]) return;

    res.sendStatus(200);

    const referenceId = event.TransactionRef || event.Body?.transaction_ref;

    if (!referenceId) {
      throw new Error("Transaction reference is required");
    }

    const verifyPayment = await axios.get(
      `https://api-d.squadco.com/transaction/verify/${referenceId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${env.squad_api_secret}`,
        },
      },
    );

    const response = verifyPayment.data;
    if (response.status !== 200) {
      throw new Error(
        response.message || "something went wrong verifying payment",
      );
    }
    const gatewayStatus = normalizeSquadStatus(
      response.data.transaction_status,
    );

    let webhookResult = {
      referenceId: response.data.transaction_ref,
      status: gatewayStatus,
      credited: false,
    };

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOne({
        referenceId,
      }).session(session);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status === "SUCCESS") {
        webhookResult = {
          referenceId,
          status: transaction.status,
          credited: false,
          message: "Transaction already processed",
        };
        return;
      }

      if (gatewayStatus !== "SUCCESS") {
        transaction.status = gatewayStatus;
        await transaction.save({ session });

        // Send failure notification
        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          event.Body?.failure_reason || "Payment processing failed",
        );

        webhookResult = {
          referenceId,
          status: transaction.status,
          credited: false,
        };
        return;
      }

      const amountToCredit = transaction.amount;
      const webhookAmount = Number(response.data.transaction_amount / 100);

      if (Number.isFinite(webhookAmount) && webhookAmount !== amountToCredit) {
        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          event.Body?.failure_reason ||
            "Payment processing failed because amount does not match transaction amount. contact support.. if payment went through",
        );
        throw new Error("Webhook amount does not match transaction amount");
      }

      const wallet = await User.findOneAndUpdate(
        { _id: transaction.userId },
        {
          $setOnInsert: { _id: transaction.userId },
          $inc: { walletBalance: amountToCredit },
        },
        {
          new: true,
          upsert: true,
          session,
        },
      );

      transaction.status = "SUCCESS";
      transaction.orderId = response.data.gateway_transaction_ref;
      transaction.balanceAfter = wallet.walletBalance;
      transaction.balanceBefore = wallet.walletBalance - amountToCredit;

      await transaction.save({ session });

      // Send success notification
      await sendDepositSuccessNotification(
        transaction.userId,
        amountToCredit,
        referenceId,
        wallet.walletBalance,
      );

      webhookResult = {
        referenceId,
        status: transaction.status,
        credited: true,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
      };
    });
  } catch (error) {
    console.log("quest webhook: ", error.message);
    next(error);
  } finally {
    await session.endSession();
  }
};

// manual payment
const initializeManualPayment = async (req, res, next) => {
  const { amount, transactionId, depositorName } = req.body;
  const user = req.user;
  try {
    const transaction = await WalletTransaction.create({
      userId: user._id,
      amount: Number(amount),
      type: "DEPOSIT",
      referenceId: transactionId,
      paymentMethod: "MANUAL_TRANSFER",
      depositorName,
    });

    // Send notification for manual payment received
    await sendPaymentReceivedNotification(
      user._id,
      Number(amount),
      transactionId,
      depositorName,
    );

    if (!transaction) {
      res.statusCode = 400;
      throw new Error("an error occured while updating payment");
    }

    res.status(201).json({
      status: 200,
      success: true,
      message:
        "your payment has been recieved, once payment is confirmed it will reflect in your balance",
      data: transaction,
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.statusCode = 400;
      return next(
        new Error("This transaction reference has already been submitted"),
      );
    }

    next(error);
  }
};

// quest payment
const initializeQuestPayment = async (req, res, next) => {
  const { amount } = req.body;
  const user = req.user;
  const randomCode = crypto.randomBytes(6).toString("hex").toUpperCase();
  const reference = `waveverify-${user._id}-${randomCode}`;
  try {
    const data = {
      email: user.email,
      description: "wallet topup",
      reference,
      amount: Number(amount),
      metadata: { userId: user._id },
      return_url: "https://www.waveverify.com/payment/status",
    };

    const response = await axios.post(
      "https://payments-api.questlabs.cc/api/v1/checkout/initialize",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.quest_api_secret}`,
        },
      },
    );

    const value = response.data;

    if (!response.data) {
      res.statusCode = 400;
      throw new Error(response.data.message || "Failed to initiate deposit");
    }

    await WalletTransaction.create({
      userId: user._id,
      amount: value.data.amount,
      type: "DEPOSIT",
      referenceId: value.data.reference,
      paymentMethod: "QUEST",
      depositorName: user.username,
    });

    res.status(201).json({
      status: 201,
      success: true,
      message:
        "Payment initialized, redirect to the provided URL to complete payment",
      data: value.data.checkout_url,
    });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// CTEX PAY
// ---------------------------------------------------------------------------
const getCtexMerchantOwnerPhone = async () => {
  const { data } = await ctex.get("/merchants/me/owner-phone");
  const phone = String(data?.data?.ownerPhone || "").trim();
  const digits = phone.replace(/\D/g, "");
  const localPhone =
    digits.startsWith("234") && digits.length === 13
      ? `0${digits.slice(3)}`
      : digits.length === 10 && /^[789]/.test(digits)
        ? `0${digits}`
        : digits;

  if (!/^0[789]\d{9}$/.test(localPhone)) {
    const error = new Error(
      "Add a valid Nigerian phone number to the CTEX merchant owner account",
    );
    error.statusCode = 400;
    throw error;
  }

  return localPhone;
};

const ensureCtexCustomer = async (user, ownerPhone) => {
  if (user.ctexCustomerId) {
    try {
      await ctex.patch(`/customers/${encodeURIComponent(user.ctexCustomerId)}`, {
        phone: ownerPhone,
      });
      return user.ctexCustomerId;
    } catch (error) {
      if (error.response?.status !== 404) throw error;
      await User.updateOne(
        { _id: user._id },
        { $unset: { ctexCustomerId: 1 } },
      );
    }
  }

  const [first = "User", ...rest] = String(user.username || "User")
    .trim()
    .split(/\s+/);
  const customerDetails = {
    firstName: first.slice(0, 100).padEnd(2, "_"),
    lastName: (rest.join(" ") || "User").slice(0, 100).padEnd(2, "_"),
    email: user.email,
    phone: ownerPhone,
    metadata: { userId: String(user._id) },
  };
  let customerId;

  try {
    const { data } = await ctex.post("/customers", customerDetails);
    customerId = data?.data?.customer?.id;
  } catch (error) {
    if (error.response?.status !== 409) throw error;

    const { data } = await ctex.get("/customers", {
      params: { search: user.email, limit: 100 },
    });
    const existingCustomer = data?.data?.customers?.find(
      (customer) => customer.email?.toLowerCase() === user.email.toLowerCase(),
    );

    if (!existingCustomer?.id) {
      const conflict = new Error("Could not find the existing CTEX customer");
      conflict.statusCode = 409;
      throw conflict;
    }

    await ctex.patch(
      `/customers/${encodeURIComponent(existingCustomer.id)}`,
      { phone: ownerPhone },
    );
    customerId = existingCustomer.id;
  }

  if (!customerId) {
    throw new Error("CTEX did not return a customer ID");
  }

  await User.updateOne({ _id: user._id }, { ctexCustomerId: customerId });
  return customerId;
};

const initializeCtexPayment = async (req, res, next) => {
  const amount = Number(req.body.amount);
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const amountInKobo = Math.round(amount * 100);
    if (
      !Number.isFinite(amount) ||
      !Number.isInteger(amount * 100) ||
      amountInKobo < 50 ||
      amountInKobo > 1_000_000_000
    ) {
      return res.status(400).json({
        success: false,
        message: "CTEX payment amount must be between NGN 0.50 and NGN 10,000,000",
      });
    }

    const ownerPhone = await getCtexMerchantOwnerPhone();
    const customerId = await ensureCtexCustomer(user, ownerPhone);
    const reference = `waveverify-${user._id}-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    const { data } = await ctex.post(
      "/payments",
      {
        amount: amountInKobo,
        currency: "NGN",
        customerId,
        reference,
        description: "wallet topup",
        paymentMethod: "ACCOUNT_TRANSFER",
        metadata: { userId: String(user._id) },
        ...(env.ctex_return_url && { returnUrl: env.ctex_return_url }),
      },
      { headers: { "Idempotency-Key": reference } },
    );

    const payment = data.data;
    if (!payment?.checkoutUrl) {
      throw new Error("CTEX did not return a checkout URL");
    }

    await WalletTransaction.create({
      userId: user._id,
      amount: amountInKobo / 100,
      type: "DEPOSIT",
      referenceId: reference,
      paymentMethod: "CTEX",
      depositorName: user.username,
    });

    res.status(201).json({
      success: true,
      message: "Payment initialized, redirect to complete payment",
      data: payment.checkoutUrl,
      reference,
    });
  } catch (error) {
    console.log("ctex init:", error.response?.data || error.message);
    if (error.statusCode) {
      res.statusCode = error.statusCode;
    } else if (error.response) {
      res.statusCode = 502;
      return res.status(502).json({
        success: false,
        message:
          error.response.status === 401 || error.response.status === 403
            ? "CTEX API key is invalid or lacks a required permission"
            : "CTEX could not initialize this payment. Please try again.",
      });
    }
    next(error);
  }
};

const validCtexSignature = (rawBody, header, secret) => {
  if (
    !rawBody ||
    !secret ||
    typeof header !== "string" ||
    !header.startsWith("sha256=")
  )
    return false;
  const supplied = header.slice(7);
  if (!/^[0-9a-f]{64}$/.test(supplied)) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(supplied, "hex");
  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

const ctexWebhook = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    if (
      !validCtexSignature(
        req.rawBody,
        req.headers["x-c-tex-signature"],
        env.ctex_webhook_secret,
      )
    ) {
      return res.sendStatus(401);
    }

    const event = req.body;
    if (event.type !== "payment.success") return res.sendStatus(200);

    const paymentReference =
      event.data?.paymentReference || event.data?.payment?.paymentReference;
    if (!paymentReference) {
      console.log("ctex webhook: unexpected payload", JSON.stringify(event));
      return res.sendStatus(200);
    }

    // Never trust the body: confirm with CTEX using our API key
    const verify = await ctex.post(`/payments/${paymentReference}/verify`);
    const payment = verify.data?.data;
    if (payment?.status !== "SUCCESS") return res.sendStatus(200);

    const referenceId = payment.merchantReference;

    // An undefined filter value can match the first document, so never query without it
    if (!referenceId) {
      console.log("ctex webhook: payment has no merchantReference", paymentReference);
      return res.sendStatus(200);
    }

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOne({
        referenceId,
      }).session(session);
      if (!transaction) throw new Error("Transaction not found");
      if (transaction.status === "SUCCESS") return; // already credited

      const amountToCredit = transaction.amount;

      if (
        Number(payment.amount) !== Math.round(amountToCredit * 100) ||
        (payment.currency || "NGN") !== "NGN"
      ) {
        await sendDepositFailedNotification(
          transaction.userId,
          amountToCredit,
          referenceId,
          "Payment amount does not match the transaction amount. Contact support if payment went through.",
        );
        return;
      }

      const wallet = await User.findOneAndUpdate(
        { _id: transaction.userId },
        { $inc: { walletBalance: amountToCredit } },
        { new: true, session },
      );

      transaction.status = "SUCCESS";
      transaction.orderId = payment.paymentReference;
      transaction.balanceAfter = wallet.walletBalance;
      transaction.balanceBefore = wallet.walletBalance - amountToCredit;
      await transaction.save({ session });

      await sendDepositSuccessNotification(
        transaction.userId,
        amountToCredit,
        referenceId,
        wallet.walletBalance,
      );
    });

    res.sendStatus(200);
  } catch (error) {
    console.log("ctex webhook:", error.response?.data || error.message);
    next(error);
  } finally {
    await session.endSession();
  }
};

// quest webhook
const questWebhook = async (req, res, next) => {
  const signature = req.headers["x-questpay-signature"];
  const payload = JSON.stringify(req.body);
  const session = await mongoose.startSession();

  try {
    const calculatedSignature = crypto
      .createHmac("sha256", env.quest_api_secret)
      .update(payload)
      .digest("hex");

    if (calculatedSignature !== signature) return;

    res.sendStatus(200);

    const event = req.body;

    if (event.event !== "payment.received") return;

    const referenceId = event.data?.reference;
    if (!referenceId) {
      throw new Error("Transaction reference is required");
    }

    const gatewayStatus = normalizeSquadStatus(event.data.status);

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOne({
        referenceId,
      }).session(session);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status === "SUCCESS") {
        return;
      }

      if (gatewayStatus !== "SUCCESS") {
        transaction.status = gatewayStatus;
        await transaction.save({ session });

        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          "Payment processing failed",
        );
        return;
      }

      const amountToCredit = transaction.amount;
      const webhookAmount = Number(event.data.payment?.amountPaid);

      if (Number.isFinite(webhookAmount) && webhookAmount !== amountToCredit) {
        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          "Payment processing failed because amount does not match transaction amount. Contact support if payment went through.",
        );
        throw new Error("Webhook amount does not match transaction amount");
      }

      const wallet = await User.findOneAndUpdate(
        { _id: transaction.userId },
        {
          $setOnInsert: { _id: transaction.userId },
          $inc: { walletBalance: amountToCredit },
        },
        { new: true, upsert: true, session },
      );

      transaction.status = "SUCCESS";
      transaction.orderId = event.data.payment?.providerTransactionId;
      transaction.balanceAfter = wallet.walletBalance;
      transaction.balanceBefore = wallet.walletBalance - amountToCredit;
      await transaction.save({ session });

      await sendDepositSuccessNotification(
        transaction.userId,
        amountToCredit,
        referenceId,
        wallet.walletBalance,
      );
    });
  } catch (error) {
    console.log("quest webhook: ", error.message);
    next(error);
  } finally {
    await session.endSession();
  }
};

export {
  initialiseDeposit,
  webhookHandler,
  callbackUrlHandler,
  getPaymentStatus,
  initializeManualPayment,
  initializeQuestPayment,
  ctexWebhook,
  initializeCtexPayment,
  questWebhook,
};
