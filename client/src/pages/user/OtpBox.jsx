import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import EmptyState from "../../components/ui/EmptyState.jsx";
import {
  cancelActivation,
  checkOtpStatus,
  getMyOrders,
} from "../../service/number";
import { formatCurrency } from "../../utils/transaction.js";
import { formatServiceName } from "../../utils/serviceCode.js";

const TERMINAL_STATUSES = ["OTP_RECEIVED", "COMPLETED", "CANCELLED", "FAILED"];

const OTP_STEPS = [
  "Buy a number",
  "Link it to the service you're verifying",
  "Click Get OTP to receive the code",
];

const OtpBox = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [checkingOrderId, setCheckingOrderId] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders({
        status: statusFilter,
        search: searchTerm || undefined,
      });
      setOrders(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch OTP orders:", err);
      setError(err?.response?.data?.message || "Failed to load OTP orders");
    } finally {
      setLoading(false);
    }
  };

  // Debounce free-text search before it drives a request.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  // Search + status filter are both sent to the backend, which does the
  // filtering — "Refresh Orders" re-runs the same query, it never resets
  // these filters.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm]);

  const hasActiveFilter = Boolean(searchTerm || statusFilter !== "ALL");

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "OTP_RECEIVED":
      case "COMPLETED":
        return {
          label: status === "COMPLETED" ? "Completed" : "OTP Received",
          className: "border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
          icon: CheckCircle2,
        };
      case "CANCELLED":
      case "FAILED":
        return {
          label: status === "FAILED" ? "Failed" : "Cancelled",
          className: "border-gold-light/20 bg-gold-light/15 text-gold",
          icon: XCircle,
        };
      default:
        return {
          label: "Waiting",
          className: "border-amber-500/20 bg-amber-500/15 text-amber-400",
          icon: Clock3,
        };
    }
  };

  const handleCopy = async (value, label) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleCheckOtp = async (orderId) => {
    if (!orderId) return;

    try {
      setCheckingOrderId(orderId);

      const response = await checkOtpStatus(orderId);
      const updatedOrder = response?.data;

      if (updatedOrder?._id) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order,
          ),
        );
      }

      if (response?.otpCode || updatedOrder?.otpCode) {
        toast.success("OTP received");
      } else {
        toast.info("OTP is not available yet");
      }
    } catch (err) {
      console.error("Failed to check OTP status:", err);
      toast.error(err?.response?.data?.message || "Failed to check OTP");
    } finally {
      setCheckingOrderId("");
    }
  };

  const handleCancelOtp = async (order) => {
    if (!order?._id || !order?.activationId) return;

    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this OTP order?",
    );

    if (!shouldCancel) return;

    try {
      setCancellingOrderId(order._id);

      const response = await cancelActivation(order.activationId);
      const updatedOrder = response?.data?.order;

      if (updatedOrder?._id) {
        setOrders((currentOrders) =>
          currentOrders.map((currentOrder) =>
            currentOrder._id === updatedOrder._id ? updatedOrder : currentOrder,
          ),
        );
      }

      toast.success(response?.message || "OTP cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel OTP order:", err);
      toast.error(err?.response?.data?.message || "Failed to cancel OTP");
    } finally {
      setCancellingOrderId("");
    }
  };

  const renderActions = (order) => {
    const isChecking = checkingOrderId === order._id;
    const isCancelling = cancellingOrderId === order._id;
    const canCheckOtp = !TERMINAL_STATUSES.includes(order.status);
    const canCancelOtp =
      Boolean(order.activationId) && !TERMINAL_STATUSES.includes(order.status);

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleCancelOtp(order)}
          disabled={isCancelling || !canCancelOtp}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 text-xs font-semibold text-gray-300 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCancelling ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <XCircle size={14} />
          )}
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleCheckOtp(order._id)}
          disabled={isChecking || !canCheckOtp}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-gold-light to-gold-dark px-3 text-xs font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {isChecking ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {order.otpCode ? "Checked" : "Get OTP"}
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
      {/* How to get your OTP — quick reference, not an alarming warning */}
      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-md sm:flex-row sm:items-center sm:gap-4 sm:px-5">
        {OTP_STEPS.map((step, index) => (
          <div key={step} className="flex flex-1 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-light/10 text-xs font-bold text-gold-light">
              {index + 1}
            </span>
            <span className="text-xs text-gray-400">{step}</span>
            {index < OTP_STEPS.length - 1 && (
              <ChevronRight
                size={14}
                className="hidden shrink-0 text-gray-700 sm:block"
              />
            )}
          </div>
        ))}
      </div>

      {/* Unified workspace — filters directly above the list they control */}
      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-md">
        <div className="flex flex-col gap-4 border-b border-white/10 bg-black/20 px-4 py-4 sm:px-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              OTP Orders
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {orders.length} result
              {orders.length === 1 ? "" : "s"} — search by phone,
              service, country, or activation ID.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search OTP orders"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                void fetchOrders();
              }}
              disabled={loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-gold-light/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Refresh orders"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm text-white focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50"
            >
              <option value="ALL">All Status</option>
              <option value="WAITING_FOR_SMS">Waiting</option>
              <option value="OTP_RECEIVED">OTP Received</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 px-5 py-12 text-gold-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          hasActiveFilter ? (
            <EmptyState
              icon={Search}
              title="No orders match your filters"
              description="Try a different search term or status."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <EmptyState
              icon={Inbox}
              title="No OTP orders yet"
              description="Purchased numbers will appear here once you buy one."
              actionLabel="Buy a Number"
              onAction={() => navigate("/f/numbers")}
            />
          )
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-black/20">
                  <tr>
                    {[
                      "Number",
                      "Service",
                      "Amount",
                      "OTP",
                      "Status",
                      "Date",
                      "Expires At",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {orders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr
                        key={order._id}
                        className="transition-colors hover:bg-white/5"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-mono text-sm font-medium text-white">
                                {order.phoneNumber || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.activationId || "No activation ID"}
                              </p>
                            </div>
                            {order.phoneNumber ? (
                              <button
                                type="button"
                                onClick={() =>
                                  void handleCopy(order.phoneNumber, "Phone")
                                }
                                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                                aria-label="Copy phone number"
                              >
                                <Copy size={14} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          <p className="font-medium text-white">
                            {String(
                              formatServiceName(order.service) || "N/A",
                            ).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Country {order.country || "N/A"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-400">
                          {formatCurrency(order.sellingPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-mono text-sm font-semibold text-white">
                            {order.otpCode || "Waiting"}
                          </p>
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {order.otpMessage || "No message yet"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
                          >
                            <StatusIcon size={12} />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {formatDate(order.purchasedAt || order.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {formatDate(order.expiresAt)}
                        </td>
                        <td className="px-4 py-3">{renderActions(order)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 p-4 lg:hidden">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <article
                    key={order._id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-mono text-sm font-semibold text-white">
                            {order.phoneNumber || "N/A"}
                          </p>
                          {order.phoneNumber ? (
                            <button
                              type="button"
                              onClick={() =>
                                void handleCopy(order.phoneNumber, "Phone")
                              }
                              className="shrink-0 rounded-lg p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
                              aria-label="Copy phone number"
                            >
                              <Copy size={13} />
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {order.activationId || "No activation ID"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
                      >
                        <StatusIcon size={12} />
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-400">
                      <p className="flex flex-col">
                        <span className="text-xs text-gray-500">Service</span>
                        <span className="font-medium text-white">
                          {String(
                            formatServiceName(order.service) || "N/A",
                          ).toUpperCase()}
                        </span>
                      </p>
                      <p className="flex flex-col">
                        <span className="text-xs text-gray-500">Country</span>
                        <span className="font-medium text-white">
                          {order.country || "N/A"}
                        </span>
                      </p>
                      <p className="flex flex-col">
                        <span className="text-xs text-gray-500">Amount</span>
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(order.sellingPrice)}
                        </span>
                      </p>
                      <p className="flex flex-col">
                        <span className="text-xs text-gray-500">OTP</span>
                        <span className="font-mono font-semibold text-white">
                          {order.otpCode || "Waiting"}
                        </span>
                      </p>
                    </div>

                    {order.otpMessage ? (
                      <p className="mt-2 truncate text-xs text-gray-500">
                        {order.otpMessage}
                      </p>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-gray-500">
                      <span>{formatDate(order.purchasedAt || order.createdAt)}</span>
                      <span>Expires {formatDate(order.expiresAt)}</span>
                    </div>

                    <div className="mt-3">{renderActions(order)}</div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default OtpBox;
