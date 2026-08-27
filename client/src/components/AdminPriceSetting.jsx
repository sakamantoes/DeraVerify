// components/admin/PricingSettings.jsx
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { updatePricingSettings } from "../service/admin.js";
import { toast } from "react-toastify";

const AdminPriceSetting = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nariaRate: "",
    markupType: "percentage",
    markupValue: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "markupValue" || name === "nariaRate"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePricingSettings(formData);
      toast.success("Pricing settings updated successfully.");
    } catch (error) {
      const message =
        error?.message ||
        error?.error ||
        error?.msg ||
        "Failed to update pricing settings.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-dark/40 via-black to-black p-6 text-white shadow-md sm:p-8">
      <h2 className="text-xl font-bold">Global Price Control</h2>
      <p className="text-sm leading-6 text-gray-400">
        Configure USD to NGN conversion rates and global markup settings for all
        products.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="grid mt-2 gap-4 md:grid-cols-3">
          {/* USD to NGN Rate */}

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              USD to NGN Rate
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                ₦
              </span>
              <input
                type="number"
                name="nariaRate"
                value={formData.nariaRate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-white/10 bg-black/40 px-8 py-2 text-white placeholder:text-gray-500 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                placeholder="Enter Naira rate"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Example: 1500 means 1 USD = 1500 NGN
            </p>
          </div>

          {/* Markup Type */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Markup Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="markupType"
                  value="percentage"
                  onChange={handleChange}
                  checked={formData.markupType === "percentage"}
                  className={`text-red-500 focus:ring-red-500 ${formData.markupType === "percentage" && "border-green-600 border"}`}
                />
                <span className="text-white">Percentage (%)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="markupType"
                  value="fixed"
                  checked={formData.markupType === "fixed"}
                  onChange={handleChange}
                  className="text-red-500 focus:ring-red-500"
                />
                <span className="text-white">Fixed (USD)</span>
              </label>
            </div>
          </div>

          {/* markup Value */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Markup Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {formData.markupType === "percentage" ? "%" : "$"}
              </span>
              <input
                type="number"
                value={formData.markupValue}
                onChange={handleChange}
                name="markupValue"
                className="w-full rounded-lg border border-white/10 bg-black/40 px-8 py-2 text-white placeholder:text-gray-500 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                placeholder={`Enter markup ${formData.markupType === "percentage" ? "percentage" : "amount"}`}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.markupType === "percentage"
                ? "Percentage added to the base price"
                : "Fixed USD amount added to the base price"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center mx-auto mt-4 w-full md:w-auto gap-3 rounded-xl border border-white/60 py-2 px-8 text-left transition-all bg-gradient-to-br to-red-dark/40 via-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="text-white w-5 h-5" />
          ) : (
            <p className="text-white text-sm">Update Price</p>
          )}
        </button>
      </form>
    </section>
  );
};

export default AdminPriceSetting;
