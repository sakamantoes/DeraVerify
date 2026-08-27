import { ArrowLeft, ArrowRight, CreditCard, Loader } from "lucide-react";
import { useState } from "react";
import { initializeQuestPayment } from "../../service/payment";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-red-light/60";

export default function AlatPayment({ amount = "", onBack }) {
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
    setLoading(true);
    const questData = {
      amount: Number(formData.amount),
      paymentMethod: "QUEST",
    };
    try {
      const response = await initializeQuestPayment(questData);
      console.log("quest data: ", response.data)
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
    <div className="fixed inset-0 z-50 flex  overflow-y-auto items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
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
              <CreditCard size={17} />
              <span className="text-xs font-bold uppercase tracking-widest">
                QUEST
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-white">
              Pay with QUEST
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Enter your details to continue with QUESTPay.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="w-full">
            <label className="block">
              <span className="text-sm font-semibold text-gray-300">
                Amount (NGN)
              </span>
              <input
                name="amount"
                type="tel"
                value={formData.amount}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-dark px-4 text-sm font-bold text-white transition-colors hover:bg-red"
          >
            Proceed with QUEST
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
