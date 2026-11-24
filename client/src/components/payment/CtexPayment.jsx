import { ArrowLeft, ArrowRight, Landmark } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../service/api.js";
import { formatCurrency } from "../../utils/transaction.js";

export default function CtexPayment({ amount, onBack }) {
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    setLoading(true);
    try {
      const res = await api.post("/api/payment/ctex/initialize-deposit", {
        amount: Number(amount),
        paymentMethod: "CTEX",
      });

      const checkoutUrl = res.data?.data;
      if (!checkoutUrl) {
        throw new Error("No checkout URL returned");
      }

      // Remember our reference so the status page can look the payment up
      if (res.data?.reference) {
        sessionStorage.setItem("ctexReference", res.data.reference);
      }

      window.location.href = checkoutUrl; // CTEX hosted checkout
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not start payment");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gold-light/10 bg-panel shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-light/30 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">
                Pay with CTEX PAY
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Pay by bank transfer on a secure checkout page.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-center gap-3 rounded-xl border border-gold-light/40 bg-gold-light/10 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold-light to-gold-dark text-white">
              <Landmark size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs leading-5 text-gray-400">
                Amount to pay
              </span>
              <span className="block text-lg font-bold text-white">
                {formatCurrency(Number(amount))}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={startPayment}
            disabled={loading || !Number(amount)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold-dark px-4 text-sm font-bold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
          >
            {loading ? "Starting payment..." : "Continue to payment"}
            {!loading && <ArrowRight size={17} />}
          </button>
        </div>
      </div>

    </div>
  );
}
