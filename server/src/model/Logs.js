import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },

    sold: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      required: true,
    },

    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    purchasedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);

export default Log;