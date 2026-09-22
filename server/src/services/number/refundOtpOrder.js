import User from "../../model/User.js";
import PurchaseReceipt from "../../model/PurchaseReceipt.js";
import OtpOrder from "../../model/OtpOrder.js";
import recieptNumberGenerator from "../../utils/recieptNo.generator.js";

const refundOtpOrder = async ({
  order,
  userId,
  reason,
  status,
  session = null,
}) => {
  const otpOrder = await OtpOrder.findById(order._id).session(session);

  if (!otpOrder) {
    throw new Error("otp order not found");
  }

  if (["CANCELLED", "FAILED"].includes(otpOrder.status)) {
    return {
      order: otpOrder,
      receipt: null,
      refundIssued: false,
    };
  }

  const updatedOrder = await OtpOrder.findByIdAndUpdate(
    otpOrder._id,
    {
      $set: {
        status,
        cancelReason: reason,
      },
    },
    {
      session,
      new: true,
    },
  );

  if (!updatedOrder) {
    throw new Error("failed to update otp order");
  }

  const userSaved = await User.findByIdAndUpdate(
    userId,
    {
      $inc: {
        walletBalance: Number(otpOrder.sellingPrice),
      },
    },
    {
      session,
      new: true,
    },
  );

  if (!userSaved) {
    throw new Error("user not found");
  }

  const balanceAfter = Number(userSaved.walletBalance);
  const balanceBefore = balanceAfter - Number(otpOrder.sellingPrice);
  const receiptNo = recieptNumberGenerator();

  const [receipt] = await PurchaseReceipt.create(
    [
      {
        userId,
        amount: otpOrder.sellingPrice,
        itemModel: "OtpOrder",
        itemId: otpOrder._id,
        receiptNo,
        purchaseType: "OTP_REFUND",
        description: reason,
        balanceAfter,
        balanceBefore,
      },
    ],
    { session },
  );

  if (!receipt) {
    throw new Error("failed to create refund receipt");
  }

  return {
    order: updatedOrder,
    receipt,
    refundIssued: true,
  };
};

export default refundOtpOrder;
