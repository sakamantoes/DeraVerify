import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import StatCard from "../../components/ui/StatCard.jsx";
import TransactionStatusBadge from "../../components/ui/TransactionStatusBadge.jsx";
import { getAllUserDeposits } from "../../service/wallet.js";
import {
  formatCurrency,
  formatPaymentMethod,
  formatTransactionDate,
} from "../../utils/transaction.js";

export default function UserDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllUserDeposits();
      setDeposits(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch deposits:", err);
      setError(
        err?.response?.data?.message || "Failed to load deposit history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDeposits();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const successfulDeposits = deposits.filter(
    (deposit) => deposit.status === "SUCCESS",
  ).length;
  const pendingDeposits = deposits.filter(
    (deposit) => deposit.status === "PENDING",
  ).length;
  const failedDeposits = deposits.filter(
    (deposit) => deposit.status === "FAILED",
  ).length;
  const totalDeposited = deposits
    .filter((deposit) => deposit.status === "SUCCESS")
    .reduce((sum, deposit) => sum + Number(deposit.amount || 0), 0);

  const filteredDeposits = deposits.filter((deposit) => {
    const matchesStatus =
      statusFilter === "ALL" || deposit.status === statusFilter;
    const matchesMethod =
      methodFilter === "ALL" || deposit.paymentMethod === methodFilter;

    return matchesStatus && matchesMethod;
  });

  const handleCopyReference = async (referenceId) => {
    try {
      await navigator.clipboard.writeText(referenceId);
      toast.success("Reference copied");
    } catch {
      toast.error("Failed to copy reference");
    }
  };

  const stats = [
    {
      label: "Total Deposits",
      value: deposits.length,
      change: "All requests",
      icon: FileText,
      iconBg: "bg-red/15",
      iconColor: "text-red",
      changeBg: "bg-white/8 text-gray-300 border-white/10",
    },
    {
      label: "Successful",
      value: successfulDeposits,
      change: "Confirmed",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      changeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Pending",
      value: pendingDeposits,
      change: "Awaiting review",
      icon: Clock3,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      changeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Confirmed Value",
      value: formatCurrency(totalDeposited),
      change: `${failedDeposits} failed`,
      icon: Wallet,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
      changeBg: "bg-white/8 text-gray-300 border-white/10",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-300">
              <CreditCard size={13} />
              Deposit History
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Track every wallet funding request
              <br className="hidden sm:block" /> in one place.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Review deposit type, payment method, approval status, and copy
              each reference ID when you need to follow up.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void fetchDeposits();
            }}
            disabled={loading}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-dark/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh History
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="rounded-xl border border-white/10 shadow-md bg-white/5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Filters
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review deposits by payment status and method.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 min-w-44 rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <select
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              className="h-11 min-w-44 rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
            >
              <option value="ALL">All Methods</option>
              <option value="MANUAL_TRANSFER">Manual Transfer</option>
              <option value="SQUAD">Squad</option>
              <option value="ALAT">ALAT</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 shadow-md bg-white/5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Deposit Records</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {filteredDeposits.length} result
              {filteredDeposits.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 px-5 py-12 text-red-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <CreditCard size={42} className="mx-auto text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              No deposits found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no deposit records matching the current filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredDeposits.map((deposit) => {
              return (
                <div
                  key={deposit._id}
                  className="px-5 py-4 transition-colors hover:bg-white/5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                          {formatCurrency(deposit.amount)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                          {deposit.type || "DEPOSIT"}
                        </span>
                        <span className="rounded-full border border-red-light/20 bg-red-light/10 px-2.5 py-0.5 text-xs font-medium text-red">
                          {formatPaymentMethod(deposit.paymentMethod)}
                        </span>
                        <TransactionStatusBadge status={deposit.status} />
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-gray-400 sm:grid-cols-2 xl:grid-cols-4">
                        <p>
                          <span className="text-gray-500">Depositor:</span>{" "}
                          <span className="text-gray-300">
                            {deposit.depositorName || "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Reference:</span>{" "}
                          {deposit.paymentMethod === "MANUAL_TRANSFER" ? (
                            <img
                              src={deposit.referenceId}
                              className="w-20 h-20 object-cover"
                            />
                          ) : (
                            <span className="font-mono text-gray-300">
                              {deposit.referenceId || "N/A"}
                            </span>
                          )}
                        </p>
                        <p>
                          <span className="text-gray-500">Order ID:</span>{" "}
                          <span className="text-gray-300">
                            {deposit.orderId || "Not assigned"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Date:</span>{" "}
                          <span className="text-gray-300">
                            {formatTransactionDate(deposit)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyReference(deposit.referenceId)}
                        disabled={!deposit.referenceId}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Copy size={14} />
                        Copy Ref
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
