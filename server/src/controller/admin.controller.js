import WalletTransaction from "../model/WalletTransactions.js";
import mongoose from "mongoose";
import User from "../model/User.js";
import PriceSetting from "../model/PriceSetting.js";
import otporder from "../model/OtpOrder.js";
import AvailableService from "../model/ServicesAvailable.js";
import calculateSellingPrice from "../utils/calculateSellingPrice.js";
import PricingSetting from "../model/PriceSetting.js";
import smspool_api from "../utils/smspool.js";

const getPlatformDeposits = async (req, res, next) => {
  try {
    const deposits = await WalletTransaction.find({});

    if (!deposits) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "your deposits was successfull",
        data: [],
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "your deposits was successfull",
      data: deposits,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepositsStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const session = await mongoose.startSession();

  let finalResult = null;

  try {
    if (!mongoose.Types.ObjectId.isValid(id) || id === undefined) {
      res.statusCode = 400;
      throw new Error("Invalid transaction ID");
    }

    if (!status) {
      res.statusCode = 400;
      throw new Error("missing status");
    }

    const statusValue = status.toUpperCase();

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOneAndUpdate(
        {
          _id: id,
          status: { $in: ["PENDING", "FAILED"] },
        },
        {
          $set: {
            status: statusValue,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!transaction) {
        res.statusCode = 400;

        throw new Error("you can only update pending or failed transaction");
      }

      if (statusValue !== "SUCCESS") {
        finalResult = transaction;
        return;
      }

      const user = await User.findOneAndUpdate(
        {
          _id: transaction.userId,
        },
        {
          $inc: {
            walletBalance: transaction.amount,
          },
        },
        {
          session,
          new: true,
        },
      );

      transaction.balanceBefore = user.walletBalance - transaction.amount;

      transaction.balanceAfter = user.walletBalance;

      await transaction.save({ session });

      finalResult = { receipt: transaction, user };
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "your request is successful",
      data: finalResult,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const priceSettingController = async (req, res, next) => {
  const { nairaRate, markupType, markupValue } = req.body;
  try {
    const priceSetting = await PriceSetting.findOneAndUpdate(
      {},
      {
        usdToNgnRate: nairaRate,
        globalMarkupType: markupType,
        globalMarkupValue: markupValue,
      },
      {
        new: true,
        upsert: true,
      },
    );

    res.status(200).json({
      status: 200,
      success: true,
      message: "you have successfully updated product price",
      data: priceSetting,
    });
  } catch (error) {
    next(error);
  }
};

const getUserWaitingForOtp = async (req, res, next) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 5, 1), 20);

    const otpOrders = await otporder
      .find({
        status: "WAITING_FOR_SMS",
      })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .lean();

    const total = await otporder.countDocuments({ status: "WAITING_FOR_SMS" });

    res.status(200).json({
      status: 200,
      success: true,
      message: "success",
      data: { otpOrders, total },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminServices = async (req, res, next) => {
  const { page = 1, limit = 25, service = "", search = "" } = req.query;

  try {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 25, 1), 100);
    const priceSetting = await PricingSetting.findOne({});

    if (!priceSetting) {
      res.statusCode = 400;

      throw new Error("error fetching price");
    }

    const query = {};
    const normalizedService = String(service).trim();
    const normalizedSearch = String(search).trim();

    if (normalizedService) {
      query.internalService = normalizedService;
    }

    if (normalizedSearch) {
      const searchRegex = new RegExp(normalizedSearch, "i");
      query.$or = [
        { internalCountry: searchRegex },
        { internalService: searchRegex },
        { provider: searchRegex },
      ];
    }

    const [availableServices, total] = await Promise.all([
      AvailableService.find(query)
        .sort({ internalService: 1, internalCountry: 1, providerPrice: 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      AvailableService.countDocuments(query),
    ]);

    const services = availableServices.map((item) => {
      return {
        ...item,
        costPrice: Number(item.providerPrice * priceSetting.usdToNgnRate),
        sellingPrice: calculateSellingPrice(item, priceSetting),
      };
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "services has been fetched",
      data: services,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.max(Math.ceil(total / limitNumber), 1),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getServicesAvailableName = async (req, res, next) => {
  try {
    const servicesName = await AvailableService.aggregate([
      {
        $group: {
          _id: "$internalService",
          totalCountries: { $addToSet: "$internalCountry" },
          totalStock: { $sum: "$stock" },
          activeCount: {
            $sum: {
              $cond: ["$active", 1, 0],
            },
          },
          totalListings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          internalService: "$_id",
          totalCountries: { $size: "$totalCountries" },
          totalStock: 1,
          activeCount: 1,
          totalListings: 1,
          active: {
            $eq: ["$activeCount", "$totalListings"],
          },
        },
      },
      {
        $sort: {
          service: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 200,
      success: true,
      message: "successfull",
      data: servicesName,
    });
  } catch (error) {
    next(error);
  }
};

const updateServiceActiveStatus = async (req, res, next) => {
  const { service } = req.params;
  const { active } = req.body;

  try {
    if (!service) {
      res.statusCode = 400;
      throw new Error("service is required");
    }

    if (typeof active !== "boolean") {
      res.statusCode = 400;
      throw new Error("active should be true or false");
    }

    const result = await AvailableService.updateMany(
      {
        internalService: service,
      },
      {
        $set: {
          active,
        },
      },
    );

    if (result.matchedCount === 0) {
      res.statusCode = 404;
      throw new Error("service not found");
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "service status updated successfully",
      data: {
        service,
        active,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateServiceCustomPrice = async (req, res, next) => {
  const { id } = req.params;
  const { customPrice } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("Invalid service ID");
    }

    const priceValue =
      customPrice === null || customPrice === "" ? null : Number(customPrice);

    if (priceValue !== null && (Number.isNaN(priceValue) || priceValue < 0)) {
      res.statusCode = 400;
      throw new Error("customPrice should be a valid amount");
    }

    const service = await AvailableService.findByIdAndUpdate(
      id,
      {
        $set: {
          customPrice: priceValue,
        },
      },
      {
        new: true,
      },
    );

    if (!service) {
      res.statusCode = 404;
      throw new Error("service not found");
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "custom price updated successfully",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

const getSmsPoolBalance = async (req, res, next) => {
  try {
    const response = await smspool_api.get("/request/balance");

    const balance = response.data;

    if (!balance || balance.success === 0) {
      res.statusCode = 400;
      throw new Error(balance?.message || "error fetching SMSPool balance");
    }

    const balanceValue =
      typeof balance === "object" ? balance.balance : balance;

    res.status(200).json({
      status: 200,
      success: true,
      message: "fetched SMSPool balance successfully",
      data: {
        balance: Number(balanceValue || 0),
        currency: balance.currency || "USD",
        raw: balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getPlatformDeposits,
  updateDepositsStatus,
  priceSettingController,
  getUserWaitingForOtp,
  getAdminServices,
  getServicesAvailableName,
  updateServiceActiveStatus,
  updateServiceCustomPrice,
  getSmsPoolBalance,
};
