import { ArrowLeft, ArrowRight, Landmark, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { initializeSquadPayment } from "../../service/payment.js";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-red-light/60";

export default function SquadPayment({ amount = "", onBack }) {
  const [formData, setFormData] = useState({
    amount,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const squadData = {
      amount: Number(formData.amount),
      paymentMethod: "SQUAD",
    };

    // Call the API to initialize Squad payment
    setLoading(true);

    try {
      const response = await initializeSquadPayment(squadData);
      window.location.href = response.data;
    } catch (error) {
      console.error("Error initializing Squad payment: ", error);
      toast.error(
        error.message || "Failed to initiate Squad payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center  overflow-y-auto justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-red-light/20 bg-[#111] shadow-2xl">
        <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to payment methods"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-red-light/40 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-red-light">
              <Landmark size={17} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Squad
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-white">
              Pay with Squad
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Continue with card, transfer, or USSD through Squad.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* <label className="block">
            <span className="text-sm font-semibold text-gray-300">Email</span>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-300">
              Phone number
            </span>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="08000000000"
              required
              className={inputClass}
            />
          </label> */}

          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Amount</span>
            <input
              name="amount"
              type="number"
              min="100"
              value={formData.amount}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-dark px-4 text-sm font-bold text-white transition-colors hover:bg-red disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
          >
            <span>Proceed with Squad</span>
            {loading ? (
              <Loader size={16} className="animate-spin text-white" />
            ) : (
              <ArrowRight size={17} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
