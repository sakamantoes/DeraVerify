import mongoose from "mongoose";

const companyWalletSchema = new mongoose.Schema(
  {
    totalProfit: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalProviderCost: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("CompanyWallet", companyWalletSchema);
