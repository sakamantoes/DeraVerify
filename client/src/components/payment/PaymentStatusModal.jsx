import { CheckCircle2, Clock3, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSquadPaymentStatus } from "../../service/payment";

const statusContent = {
  success: {
    title: "Payment Successful",
    message:
      "Your payment was completed successfully. Your wallet will update shortly.",
    icon: CheckCircle2,
    iconClass: "bg-green-500/10 text-green-400",
  },
  pending: {
    title: "Payment Pending",
    message:
      "Your payment is still being confirmed. We will update your wallet once it clears.",
    icon: Clock3,
    iconClass: "bg-yellow-500/10 text-yellow-400",
  },
  failed: {
    title: "Payment Failed",
    message:
      "We could not confirm this payment. Please try again or use another payment method.",
    icon: XCircle,
    iconClass: "bg-red-500/10 text-red-400",
  },
};

export default function PaymentStatusModal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [transactionStatus, setTransactionStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [statusError, setStatusError] = useState("");

  const urlRef =
    searchParams.get("referenceId") ||
    searchParams.get("transaction_reference") ||
    searchParams.get("transaction_ref") ||
    searchParams.get("reference") ||
    searchParams.get("tx_ref");

  const storedRef = sessionStorage.getItem("ctexReference");
  const savedRef = storedRef && storedRef !== "undefined" ? storedRef : null;

  // CTEX's own reference starts with CTEXPAY_; prefer the one we saved
  const reference =
    urlRef && !urlRef.startsWith("CTEXPAY_")
      ? urlRef
      : savedRef || urlRef;

  const content = statusContent[transactionStatus] || {
    title: "Payment Status Unavailable",
    message:
      statusError ||
      "We could not read the payment status from this redirect link.",
    icon: Clock3,
    iconClass: "bg-white/10 text-gray-300",
  };

  const Icon = content.icon;

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      if (!reference) {
        setTransactionStatus("unavailable");
        setStatusError("No payment reference was found in this redirect link.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getSquadPaymentStatus({
          referenceId: reference,
        });

        setTransactionStatus(String(response.data.status).toLowerCase());
        setStatusError("");
      } catch (error) {
        setTransactionStatus("unavailable");
        setStatusError(
          error?.response?.data?.message ||
            error?.data?.message ||
            "We could not verify this payment status. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [reference]);

  const handleClose = () => {
    navigate("/f/dashboard", { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gold-light/10 bg-panel shadow-2xl">
        <div className="flex justify-end border-b border-white/10 px-4 py-3">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close payment status"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-light/30 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-6 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${content.iconClass}`}
          >
            <Icon size={32} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            {isLoading ? "Checking Payment Status" : content.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            {isLoading
              ? "Please wait while we confirm your payment with the server."
              : content.message}
          </p>

          {reference && (
            <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Reference
              </p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-white">
                {reference}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-gold-light to-gold-dark px-4 text-sm font-bold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
          >
            {isLoading ? "Checking..." : "Okay"}
          </button>
        </div>
      </div>
    </div>
  );
}