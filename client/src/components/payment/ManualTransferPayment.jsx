import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { manualBankPayment, uploadImage } from "../../service/payment.js";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none transition-colors placeholder:text-gray-600 focus:border-red-light/60";

export default function ManualTransferPayment({ amount = "", onBack }) {
  const [formData, setFormData] = useState({
    depositorName: "",
    amount,
  });
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
    };
  }, [receiptPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRequestError("");
    setSuccessMessage("");
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0];

    setRequestError("");
    setSuccessMessage("");

    if (!file) {
      setReceiptImage(null);
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
      setReceiptPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setReceiptImage(null);
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
      setReceiptPreview("");
      setRequestError("Please select a valid image receipt.");
      event.target.value = "";
      return;
    }

    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }

    setReceiptImage(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setRequestError("");
    setSuccessMessage("");

    try {
      if (!receiptImage) {
        throw new Error("Please upload your payment receipt image.");
      }

      const uploadedReceipt = await uploadImage(receiptImage);

      if (!uploadedReceipt?.url) {
        throw new Error("Receipt upload failed. Please try again.");
      }

      const payload = {
        depositorName: formData.depositorName.trim(),
        transactionId: uploadedReceipt.url,
        amount: Number(formData.amount),
      };

      const response = await manualBankPayment(payload);
      if (!response?.success) {
        throw new Error(response?.message || "Transfer submission failed.");
      }

      const message =
        response?.message ||
        "Transfer submitted successfully. We will confirm it shortly.";

      setSuccessMessage(message);
      toast.success(message);
      setFormData((current) => ({
        ...current,
        depositorName: "",
      }));
      setReceiptImage(null);
      setReceiptPreview("");
      event.target.reset();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Try again.";

      console.error("error submitting manual payment: ", error);
      setRequestError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start overflow-y-auto justify-center bg-black/70  px-4 py-6 backdrop-blur-sm">
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
              <Building2 size={17} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Transfer
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-white">
              Manual Transfer
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Transfer to the account below and submit your payment details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {successMessage ? (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <p>{successMessage}</p>
            </div>
          ) : null}

          {requestError ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-light/20 bg-red-light/10 p-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{requestError}</p>
            </div>
          ) : null}

          <div className="rounded-xl border border-white/10 bg-black/35 p-4 text-sm text-gray-300">
            <div className="flex justify-between gap-4 py-1">
              <span className="text-gray-500">Bank</span>
              <span className="font-semibold text-white">Opay</span>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <span className="text-gray-500">Account Name</span>
              <span className="font-semibold text-white">
                Victory Onyekwerre
              </span>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <span className="text-gray-500">Account Number</span>
              <span className="font-mono font-semibold text-white">
                7089526653
              </span>
            </div>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-gray-300">
              Depositor Account name
            </span>
            <input
              name="depositorName"
              type="text"
              value={formData.depositorName}
              onChange={handleChange}
              placeholder="Name used for transfer"
              required
              disabled={loading}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-300">
              Payment receipt image
            </span>
            <input
              name="transactionId"
              type="file"
              accept="image/*"
              onChange={handleReceiptChange}
              required
              disabled={loading}
              className="mt-2 block w-full cursor-pointer rounded-xl border border-white/10 bg-black/40 text-sm text-gray-300 outline-none transition-colors file:mr-4 file:h-12 file:border-0 file:bg-red-dark file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-red disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          {receiptPreview ? (
            <div className="rounded-xl border border-white/10 bg-black/35 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                Receipt Preview
              </p>
              <img
                src={receiptPreview}
                alt="Payment receipt preview"
                className="h-40 w-full rounded-lg object-cover"
              />
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-gray-300">Amount</span>
            <input
              name="amount"
              type="number"
              min="100"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={loading}
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-dark px-4 text-sm font-bold text-white transition-colors hover:bg-red disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
          >
            <span>Submit Transfer Details</span>
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <ArrowRight size={17} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
