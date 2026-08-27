import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StatCard from "../../components/ui/StatCard.jsx";
import TransactionStatusBadge from "../../components/ui/TransactionStatusBadge.jsx";
import {
  formatCurrency,
  formatPaymentMethod,
  formatTransactionDate,
  normalizeStatus,
} from "../../utils/transaction.js";
import {
  getPlatformDeposits,
  updatePlatformDepositStatus,
} from "../../service/admin.js";

const statusOptions = [
  { label: "Success", value: "SUCCESS", icon: CheckCircle2 },
  { label: "Failed", value: "FAILED", icon: XCircle },
  { label: "Pending", value: "PENDING", icon: Clock3 },
];

const isManualReceipt = (deposit) => {
  const reference = String(deposit?.referenceId || "");

  return (
    deposit?.paymentMethod === "MANUAL_TRANSFER" &&
    /^https?:\/\/.+\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(reference)
  );
};

const detailRows = (deposit) => [
  ["Depositor", deposit?.depositorName || "N/A"],
  ["Amount", formatCurrency(deposit?.amount)],
  ["Status", normalizeStatus(deposit?.status)],
  ["Payment Method", formatPaymentMethod(deposit?.paymentMethod)],
  ["Type", deposit?.type || "DEPOSIT"],
  [isManualReceipt(deposit) ? "Receipt URL" : "Reference", deposit?.referenceId || "N/A"],
  ["Order ID", deposit?.orderId || "Not assigned"],
  ["User ID", deposit?.userId || "N/A"],
  ["Balance Before", formatCurrency(deposit?.balanceBefore)],
  ["Balance After", formatCurrency(deposit?.balanceAfter)],
  ["Created", formatTransactionDate(deposit)],
  [
    "Updated",
    deposit?.updatedAt
      ? new Date(deposit.updatedAt).toLocaleString()
      : "No timestamp",
  ],
];

export default function Transactions() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [statusDeposit, setStatusDeposit] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPlatformDeposits();
      setDeposits(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch admin deposits:", err);
      setError(err?.response?.data?.message || "Failed to load deposits");
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

  const stats = useMemo(() => {
    const successful = deposits.filter(
      (deposit) => normalizeStatus(deposit.status) === "SUCCESS",
    );
    const pending = deposits.filter(
      (deposit) => normalizeStatus(deposit.status) === "PENDING",
    );
    const failed = deposits.filter(
      (deposit) => normalizeStatus(deposit.status) === "FAILED",
    );
    const confirmedValue = successful.reduce(
      (sum, deposit) => sum + Number(deposit.amount || 0),
      0,
    );

    return [
      {
        label: "Total Deposits",
        value: deposits.length,
        change: "Platform wide",
        icon: FileText,
        iconBg: "bg-red/15",
        iconColor: "text-red",
      },
      {
        label: "Successful",
        value: successful.length,
        change: formatCurrency(confirmedValue),
        icon: CheckCircle2,
        iconBg: "bg-emerald-500/15",
        iconColor: "text-emerald-400",
        changeBg:
          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      },
      {
        label: "Pending",
        value: pending.length,
        change: "Needs review",
        icon: Clock3,
        iconBg: "bg-amber-500/15",
        iconColor: "text-amber-400",
        changeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      },
      {
        label: "Failed",
        value: failed.length,
        change: "Rejected",
        icon: XCircle,
        iconBg: "bg-red-light/15",
        iconColor: "text-red",
        changeBg: "bg-red-light/10 text-red border-red-light/20",
      },
    ];
  }, [deposits]);

  const filteredDeposits = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return deposits.filter((deposit) => {
      const status = normalizeStatus(deposit.status);
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const matchesMethod =
        methodFilter === "ALL" || deposit.paymentMethod === methodFilter;
      const matchesSearch =
        !query ||
        [
          deposit.depositorName,
          deposit.referenceId,
          deposit.orderId,
          deposit.userId,
          deposit.paymentMethod,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [deposits, methodFilter, searchTerm, statusFilter]);

  const updateDepositInState = (updatedDeposit) => {
    setDeposits((currentDeposits) =>
      currentDeposits.map((deposit) =>
        deposit._id === updatedDeposit._id ? updatedDeposit : deposit,
      ),
    );
    setSelectedDeposit((currentDeposit) =>
      currentDeposit?._id === updatedDeposit._id ? updatedDeposit : currentDeposit,
    );
    setStatusDeposit((currentDeposit) =>
      currentDeposit?._id === updatedDeposit._id ? updatedDeposit : currentDeposit,
    );
  };

  const handleCopy = async (value, label = "Value") => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const renderReference = (deposit) => {
    if (isManualReceipt(deposit)) {
      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReceiptPreview(deposit.referenceId)}
            className="group h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-black/30 transition-colors hover:border-red-light/40"
            aria-label="View receipt image"
          >
            <img
              src={deposit.referenceId}
              alt="Manual deposit receipt"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
          <button
            type="button"
            onClick={() => setReceiptPreview(deposit.referenceId)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 text-xs font-medium text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white"
          >
            <Eye size={13} />
            View
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleCopy(deposit.referenceId, "Reference")}
        disabled={!deposit.referenceId}
        className="inline-flex max-w-44 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Copy size={13} />
        <span className="truncate">{deposit.referenceId || "N/A"}</span>
      </button>
    );
  };

  const handleStatusChange = async (status) => {
    if (!statusDeposit?._id || updating) {
      return;
    }

    try {
      setUpdating(true);
      const response = await updatePlatformDepositStatus(statusDeposit._id, status);
      updateDepositInState(response?.data || { ...statusDeposit, status });
      toast.success("Deposit status updated");
      setStatusDeposit(null);
    } catch (err) {
      console.error("Failed to update deposit status:", err);
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white shadow-md sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-300">
              <Banknote size={13} />
              Admin Deposits
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Review wallet funding requests
              <br className="hidden sm:block" /> and update their status.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Inspect platform deposit records, view transaction details, and
              mark pending payments as successful or failed after review.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchDeposits()}
            disabled={loading}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-dark/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-md sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Deposit Filters
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search by depositor, reference, order, user, or payment method.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative sm:col-span-3 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search deposits"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
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
              className="h-11 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
            >
              <option value="ALL">All Methods</option>
              <option value="MANUAL_TRANSFER">Manual Transfer</option>
              <option value="SQUAD">Squad</option>
              <option value="ALAT">ALAT</option>
            </select>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-md">
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
              No platform deposits match the current filters.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/30">
                  <tr>
                    {[
                      "Depositor",
                      "Amount",
                      "Method",
                      "Status",
                      "Reference",
                      "Date",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredDeposits.map((deposit) => (
                    <tr
                      key={deposit._id}
                      className="transition-colors hover:bg-white/5"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">
                          {deposit.depositorName || "N/A"}
                        </p>
                        <p className="mt-1 max-w-44 truncate text-xs text-gray-500">
                          {deposit.userId || "No user ID"}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">
                        {formatCurrency(deposit.amount)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-300">
                        {formatPaymentMethod(deposit.paymentMethod)}
                      </td>
                      <td className="px-5 py-4">
                        <TransactionStatusBadge status={deposit.status} />
                      </td>
                      <td className="px-5 py-4">
                        {renderReference(deposit)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">
                        {formatTransactionDate(deposit)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDeposit(deposit)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 text-sm font-medium text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white"
                          >
                            <Eye size={14} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusDeposit(deposit)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-dark/40 px-3 text-sm font-semibold text-white transition-colors hover:bg-red-light"
                          >
                            Change
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredDeposits.map((deposit) => (
                <article
                  key={deposit._id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {deposit.depositorName || "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatTransactionDate(deposit)}
                      </p>
                    </div>
                    <TransactionStatusBadge status={deposit.status} />
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-gray-400">
                    <p className="flex justify-between gap-3">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(deposit.amount)}
                      </span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span className="text-gray-500">Method</span>
                      <span>{formatPaymentMethod(deposit.paymentMethod)}</span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span className="text-gray-500">
                        {isManualReceipt(deposit) ? "Receipt" : "Reference"}
                      </span>
                      {isManualReceipt(deposit) ? (
                        <button
                          type="button"
                          onClick={() => setReceiptPreview(deposit.referenceId)}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs font-medium text-gray-300"
                        >
                          <img
                            src={deposit.referenceId}
                            alt="Manual deposit receipt"
                            className="h-8 w-8 rounded-md object-cover"
                          />
                          View
                        </button>
                      ) : (
                        <span className="max-w-40 truncate font-mono">
                          {deposit.referenceId || "N/A"}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDeposit(deposit)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/30 text-sm font-medium text-gray-300"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusDeposit(deposit)}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-red-dark/40 text-sm font-semibold text-white"
                    >
                      Change
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {selectedDeposit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-gray-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Transaction Details
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedDeposit.referenceId || "No reference available"}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedDeposit(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(selectedDeposit.amount)}
                </span>
                <TransactionStatusBadge status={selectedDeposit.status} />
                <button
                  type="button"
                  onClick={() => {
                    setStatusDeposit(selectedDeposit);
                    setSelectedDeposit(null);
                  }}
                  className="inline-flex h-9 items-center rounded-lg bg-red-dark/40 px-3 text-sm font-semibold text-white transition-colors hover:bg-red-light"
                >
                  Change Status
                </button>
              </div>
              {isManualReceipt(selectedDeposit) ? (
                <div className="mb-5 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Payment Receipt
                    </p>
                    <button
                      type="button"
                      onClick={() => setReceiptPreview(selectedDeposit.referenceId)}
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white"
                    >
                      <Eye size={13} />
                      View Full
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReceiptPreview(selectedDeposit.referenceId)}
                    className="block max-h-72 w-full overflow-hidden rounded-lg border border-white/10 bg-black"
                  >
                    <img
                      src={selectedDeposit.referenceId}
                      alt="Manual deposit receipt"
                      className="max-h-72 w-full object-contain"
                    />
                  </button>
                </div>
              ) : null}
              <dl className="grid gap-3 sm:grid-cols-2">
                {detailRows(selectedDeposit).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-white/10 bg-black/30 p-4"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      {label}
                    </dt>
                    <dd className="mt-2 break-words text-sm font-medium text-gray-200">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      ) : null}

      {statusDeposit ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70">
          <button
            type="button"
            aria-label="Close status panel"
            className="absolute inset-0"
            onClick={() => setStatusDeposit(null)}
          />
          <aside className="relative h-full w-full max-w-md border-l border-white/10 bg-gray-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Change Deposit Status
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusDeposit.referenceId || statusDeposit._id}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close status panel"
                onClick={() => setStatusDeposit(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Current Deposit
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">
                    {statusDeposit.depositorName || "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatCurrency(statusDeposit.amount)}
                  </p>
                </div>
                <TransactionStatusBadge status={statusDeposit.status} />
              </div>
            </div>

            {isManualReceipt(statusDeposit) ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Receipt
                  </p>
                  <button
                    type="button"
                    onClick={() => setReceiptPreview(statusDeposit.referenceId)}
                    className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white"
                  >
                    <Eye size={13} />
                    View
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptPreview(statusDeposit.referenceId)}
                  className="block max-h-48 w-full overflow-hidden rounded-lg border border-white/10 bg-black"
                >
                  <img
                    src={statusDeposit.referenceId}
                    alt="Manual deposit receipt"
                    className="max-h-48 w-full object-contain"
                  />
                </button>
              </div>
            ) : null}

            <div className="mt-6 space-y-3">
              {statusOptions.map(({ label, value, icon: Icon }) => {
                const isCurrent = normalizeStatus(statusDeposit.status) === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleStatusChange(value)}
                    disabled={updating || isCurrent}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4 text-left transition-colors hover:border-red-light/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block font-semibold text-white">
                          Mark as {label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {isCurrent
                            ? "This is the current status"
                            : `Update deposit to ${label.toLowerCase()}`}
                        </span>
                      </span>
                    </span>
                    {updating ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <p className="mt-6 text-sm leading-6 text-gray-500">
              Status updates are saved immediately and reflected in the records
              list after the server confirms the change.
            </p>
          </aside>
        </div>
      ) : null}

      {receiptPreview ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4">
          <button
            type="button"
            aria-label="Close receipt preview"
            className="absolute inset-0"
            onClick={() => setReceiptPreview(null)}
          />
          <div className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-gray-950 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <h3 className="font-semibold text-white">Payment Receipt</h3>
              <button
                type="button"
                aria-label="Close receipt preview"
                onClick={() => setReceiptPreview(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[82vh] overflow-auto bg-black p-4">
              <img
                src={receiptPreview}
                alt="Manual deposit receipt full preview"
                className="mx-auto max-h-[78vh] max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
