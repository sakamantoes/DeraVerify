import mongoose from "mongoose";
import Log from "../model/Logs.js";
import User from "../model/User.js";
import PurchaseReceipt from "../model/PurchaseReceipt.js";
import { maskEmail, maskPassword } from "../utils/maskDate.js";
import recieptNumberGenerator from "../utils/recieptNo.generator.js";

// create log
const createLog = async (req, res, next) => {
  try {
    // ✅ FIX: Added category to destructuring
    const { email, password, price, country, category } = req.body;

    // ✅ FIX: Validate required fields
    if (!email || !password || !price || !country || !category) {
      res.statusCode = 400;
      throw new Error(
        "All fields (email, password, price, country, category) are required",
      );
    }

    const log = await Log.create({
      email,
      password,
      price,
      country,
      category, // ✅ Now category is defined
    });

    res.status(201).json({
      success: true,
      message: "Log uploaded successfully",
      log,
    });
  } catch (error) {
    next(error);
  }
};

// get all logs
const getLogs = async (req, res, next) => {
  try {
    const logs = await Log.find({ sold: false });

    const maskedLogs = logs.map((log) => ({
      _id: log._id,
      email: maskEmail(log.email),
      password: maskPassword(log.password),
      price: log.price,
      country: log.country,
      category: log.category, // ✅ Added category to response
      sold: log.sold,
      createdAt: log.createdAt,
    }));

    res.status(200).json({
      success: true,
      logs: maskedLogs,
    });
  } catch (error) {
    next(error);
  }
};

// buy log
const buyLog = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user;
  const session = await mongoose.startSession();
  const recieptNo = recieptNumberGenerator();
  try {
    let finalResult = null;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    await session.withTransaction(async () => {
      const log = await Log.findById({ _id: id }).session(session);

      if (!log) {
        res.statusCode = 400;
        throw new Error("Log not found");
      }

      if (log.sold) {
        res.statusCode = 400;
        throw new Error("Log already sold");
      }

      const isUser = await User.findOneAndUpdate(
        {
          _id: userId._id,
          walletBalance: { $gte: Number(log.price) },
        },
        {
          $inc: { walletBalance: Number(-log.price) },
        },
        {
          session,
          new: true,
        },
      );

      if (!isUser) {
        res.statusCode = 401;
        throw new Error("UnAuthorized Access");
      }

      const [receipt] = await PurchaseReceipt.create(
        [
          {
            userId: isUser._id,
            purchaseType: "LOG",
            itemId: log._id,
            itemModel: "Log",
            receiptNo: recieptNo,
            amount: log.price,
            description: "User log purchase",
            balanceBefore: Number(isUser.walletBalance + log.price),
            balanceAfter: Number(isUser.walletBalance),
          },
        ],
        {
          session,
        },
      );

      await Log.findOneAndUpdate(
        {
          _id: log._id,
        },
        {
          $set: {
            sold: true,
            soldTo: isUser._id,
            purchasedAt: new Date(),
          },
        },
        {
          session,
        },
      );
      console.log("log purchase was successful ");
      finalResult = { receipt };
    });

    res.status(200).json({
      success: true,
      message: "Log purchased successfully",
      data: finalResult,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

// update log
const updateLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ FIX: Added category to destructuring
    const { email, password, price, country, category } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const log = await Log.findById(id);

    if (!log) {
      res.statusCode = 400;
      throw new Error("Log not found");
    }

    if (log.sold) {
      res.statusCode = 400;
      throw new Error("you cannot delete sold logs");
    }

    // ✅ FIX: Update all fields including category
    log.email = email || log.email;
    log.password = password || log.password;
    log.price = price || log.price;
    log.country = country || log.country;
    log.category = category || log.category; // ✅ Added category update

    await log.save();

    res.status(200).json({
      success: true,
      message: "Log updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// delete log
const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const log = await Log.findById(id);

    if (!log) {
      res.statusCode = 400;
      throw new Error("Log not found");
    }

    if (log.sold) {
      res.statusCode = 400;
      throw new Error("you cannot delete sold logs");
    }

    await log.deleteOne();

    res.status(200).json({
      status: 200,
      success: true,
      message: "Log deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// get my purchased logs
const myPurchasedLogs = async (req, res, next) => {
  try {
    const logs = await Log.find({
      soldTo: req.user._id,
    });

    res.status(200).json({
      status: 200,
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// get log by id
const getLogById = async (req, res, next) => {
  const user = req.user;
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const log = await Log.findById(id);

    if (!log) {
      res.statusCode = 404;
      throw new Error("Log not found");
    }

    if (!log.sold && user.role === "admin") {
      return res.status(200).json({
        success: true,
        data: {
          _id: log._id,
          email: log.email,
          password: log.password,
          price: log.price,
          country: log.country,
          category: log.category,
          sold: log.sold,
          soldTo: log.soldTo,
          purchasedAt: log.purchasedAt,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt,
        },
      });
    }

    if (log.sold && String(log.soldTo) === String(user._id)) {
      return res.status(200).json({
        success: true,
        data: {
          _id: log._id,
          email: log.email,
          password: log.password,
          price: log.price,
          country: log.country,
          category: log.category,
          sold: log.sold,
          soldTo: log.soldTo,
          purchasedAt: log.purchasedAt,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt,
        },
      });
    }

    // Return the full log details (unmasked for admin/view)
    res.status(200).json({
      success: true,
      data: {
        _id: log._id,
        email: maskEmail(log.email),
        password: maskPassword(log.password),
        price: log.price,
        country: log.country,
        category: log.category,
        sold: log.sold,
        soldTo: log.soldTo,
        purchasedAt: log.purchasedAt,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  createLog,
  getLogs,
  buyLog,
  updateLog,
  deleteLog,
  myPurchasedLogs,
  getLogById,
};