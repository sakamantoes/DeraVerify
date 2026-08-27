import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Filter,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getAlluserPurchaseReceipt } from "../../service/payment.js";


const formatCurrency = (value) =>
  `NGN ${new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}`;
  
const getObjectIdDate = (id) => {
  if (!id) {
    return null;
  }

  const timestamp = parseInt(String(id).slice(0, 8), 16);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp * 1000);
};

const formatReceiptDate = (receipt) => {
  const dateValue =
    receipt.createdAt || receipt.updatedAt || getObjectIdDate(receipt._id);

  if (!dateValue) {
    return "No timestamp";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "No timestamp";
  }

  return date.toLocaleString();
};

const formatPurchaseType = (type) => {
  const typeMap = {
    LOG: "Log Purchase",
    OTP: "OTP Purchase",
  };

  return typeMap[type] || type || "Purchase";
};

const getStatusBadge = (status) => {
  switch (status) {
    case "SUCCESS":
      return {
        label: "Success",
        className:
          "border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
        icon: CheckCircle2,
      };
    case "FAILED":
      return {
        label: "Failed",
        className: "border-red-light/20 bg-red-light/15 text-red",
        icon: XCircle,
      };
    default:
      return {
        label: "Pending",
        className: "border-amber-500/20 bg-amber-500/15 text-amber-400",
        icon: Clock3,
      };
  }
};

export default function UserReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAlluserPurchaseReceipt();
      setReceipts(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
      setError(err?.response?.data?.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return receipts.filter((receipt) => {
      const receiptNo = String(receipt.receiptNo || "").toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 || receiptNo.includes(normalizedSearch);
      const matchesType =
        typeFilter === "ALL" || receipt.purchaseType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [receipts, searchTerm, typeFilter]);

  const successfulReceipts = receipts.filter(
    (receipt) => receipt.status === "SUCCESS",
  ).length;
  const pendingReceipts = receipts.filter(
    (receipt) => receipt.status === "PENDING",
  ).length;
  const totalSpent = receipts
    .filter((receipt) => receipt.status === "SUCCESS")
    .reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);

  const handleCopyReceipt = async (receiptNo) => {
    try {
      await navigator.clipboard.writeText(receiptNo);
      toast.success("Receipt ID copied");
    } catch (err) {
      toast.error("Failed to copy receipt ID");
    }
  };

  const stats = [
    {
      label: "Total Receipts",
      value: receipts.length,
      change: "All purchases",
      icon: FileText,
      iconBg: "bg-red/15",
      iconColor: "text-red",
      changeBg: "bg-white/8 text-gray-300 border-white/10",
    },
    {
      label: "Successful",
      value: successfulReceipts,
      change: "Completed",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
      changeBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Pending",
      value: pendingReceipts,
      change: "Processing",
      icon: Clock3,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
      changeBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      change: "Confirmed",
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
              <ReceiptText size={13} />
              Purchase Receipts
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              View every purchase receipt
              <br className="hidden sm:block" /> tied to your account.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Search by receipt ID, review purchase details, and copy receipt
              numbers whenever you need proof of payment.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void fetchReceipts();
            }}
            disabled={loading}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-dark/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Receipts
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-white/10 shadow-md bg-white/5 p-5 transition-all transform hover:-translate-y-1 hover:border-red-light/40 hover:bg-white/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
              >
                <stat.icon size={19} />
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${stat.changeBg}`}
              >
                {stat.change}
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-gray-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-white/10 shadow-md bg-white/5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Find Receipt
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search with a receipt ID or narrow the list by purchase type.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search receipt ID"
                className="h-11 w-full min-w-0 rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50 sm:min-w-72"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-11 min-w-44 rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
              >
                <option value="ALL">All Types</option>
                <option value="LOG">Log Purchase</option>
                <option value="OTP">OTP Purchase</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 shadow-md bg-white/5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Receipt Records</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {filteredReceipts.length} result
              {filteredReceipts.length === 1 ? "" : "s"}
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
        ) : filteredReceipts.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <ReceiptText size={42} className="mx-auto text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              No receipts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No receipt records match the current search or filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredReceipts.map((receipt) => {
              const statusBadge = getStatusBadge(receipt.status);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={receipt._id}
                  className="px-5 py-4 transition-colors hover:bg-white/5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                          {formatCurrency(receipt.amount, receipt.currency)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                          {formatPurchaseType(receipt.purchaseType)}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
                        >
                          <StatusIcon size={12} />
                          {statusBadge.label}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-gray-400 sm:grid-cols-2 xl:grid-cols-4">
                        <p>
                          <span className="text-gray-500">Receipt ID:</span>{" "}
                          <span className="font-mono text-gray-300">
                            {receipt.receiptNo || "N/A"}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Balance Before:</span>{" "}
                          <span className="text-gray-300">
                            {formatCurrency(
                              receipt.balanceBefore,
                              receipt.currency,
                            )}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Balance After:</span>{" "}
                          <span className="text-gray-300">
                            {formatCurrency(
                              receipt.balanceAfter,
                              receipt.currency,
                            )}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Date:</span>{" "}
                          <span className="text-gray-300">
                            {formatReceiptDate(receipt)}
                          </span>
                        </p>
                      </div>

                      {receipt.description ? (
                        <p className="mt-3 text-sm text-gray-400">
                          {receipt.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyReceipt(receipt.receiptNo)}
                        disabled={!receipt.receiptNo}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-red-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Copy size={14} />
                        Copy ID
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
