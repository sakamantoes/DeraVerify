import { Eye, EyeOff, Loader2, RefreshCw, Wallet } from "lucide-react";
import { useState } from "react";
import useWallet from "../hooks/useWallet.js";

export default function WalletBalanceCard({
  label = "Wallet Balance",
  statusText = "Ready to spend",
  className = "",
}) {
  const [showBalance, setShowBalance] = useState(false);
  const { balance, isLoading, isError, refetch } = useWallet();

  const formattedBalance = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(balance || 0));

  const walletDisplayValue = showBalance
    ? `NGN ${formattedBalance}`
    : "NGN ******";

  return (
    <div
      className={`group rounded-xl border border-white/10 shadow-md bg-white/5 p-5 transition-all transform hover:-translate-y-1 hover:border-red-light/40 hover:bg-white/5 ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red/15 text-red">
          <Wallet size={19} />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowBalance((prev) => !prev)}
            className="rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white"
            aria-label={showBalance ? "Hide wallet balance" : "Show wallet balance"}
          >
            {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            type="button"
            onClick={() => {
              void refetch().catch(() => {});
            }}
            disabled={isLoading}
            className="rounded-lg border border-white/10 p-2 text-gray-400 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh wallet balance"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <div className="mt-1 min-h-[2rem]">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin text-red" />
            <span>Loading balance...</span>
          </div>
        ) : isError ? (
          <p className="text-sm font-medium text-red-light">
            Unable to load balance
          </p>
        ) : (
          <p className="text-2xl font-bold tracking-tight text-white">
            {walletDisplayValue}
          </p>
        )}
      </div>
      <span className="mt-3 inline-flex rounded-full border border-white/10 bg-red/10 px-2.5 py-0.5 text-xs font-medium text-red shadow-md">
        {statusText}
      </span>
    </div>
  );
}
