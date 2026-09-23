import { useEffect, useRef, useState } from "react";
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
  "Wait for the OTP to arrive",
];

const OtpBox = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cancellingOrderId, setCancellingOrderId] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const ordersRef = useRef([]);
  const inFlightOrderIdsRef = useRef(new Set());

  ordersRef.current = orders;

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

  useEffect(() => {
    const pollWaitingOrders = async () => {
      const waitingOrders = ordersRef.current.filter(
        (order) => order.status === "WAITING_FOR_SMS",
      );

      await Promise.all(
        waitingOrders.map(async (order) => {
          if (!order._id || inFlightOrderIdsRef.current.has(order._id)) {
            return;
          }

          inFlightOrderIdsRef.current.add(order._id);

          try {
            const response = await checkOtpStatus(order._id);
            const updatedOrder = response?.data;

            if (!updatedOrder?._id) return;

            setOrders((currentOrders) =>
              currentOrders.map((currentOrder) =>
                currentOrder._id === updatedOrder._id
                  ? updatedOrder
                  : currentOrder,
              ),
            );

            if (updatedOrder.status === "OTP_RECEIVED") {
              toast.success("OTP received");
            } else if (
              updatedOrder.status === "CANCELLED" ||
              updatedOrder.status === "FAILED"
            ) {
              toast.info("OTP order ended and your wallet was refunded");
            }
          } catch (err) {
            console.error("Failed to poll OTP status:", err);
          } finally {
            inFlightOrderIdsRef.current.delete(order._id);
          }
        }),
      );
    };

    const intervalId = window.setInterval(() => {
      void pollWaitingOrders();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      inFlightOrderIdsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

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

  const getServiceName = (service) => {
    const value = String(service || "").trim();
    if (!value) return "This service";

    const formatted = formatServiceName(value);
    return formatted === value.toUpperCase() ? value : formatted;
  };

  const getSecondsLeft = (expiresAt) => {
    if (!expiresAt) return 0;

    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
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
    const isCancelling = cancellingOrderId === order._id;
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
        {order.status === "WAITING_FOR_SMS" ? (
          <span className="inline-flex h-9 items-center gap-2 px-2 text-xs text-gray-400">
            <Loader2 size={14} className="animate-spin" />
            Polling
          </span>
        ) : null}
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
            <h2 className="text-sm font-semibold text-white">OTP Orders</h2>
            <p className="mt-1 text-xs text-gray-500">
              {orders.length} result
              {orders.length === 1 ? "" : "s"} — search by phone, service,
              country, or activation ID.
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
          <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const StatusIcon = statusBadge.icon;
              const serviceName = getServiceName(order.service);
              const secondsLeft = getSecondsLeft(order.expiresAt);
              const minutesLeft = Math.floor(secondsLeft / 60);
              const secondsLabel = String(secondsLeft % 60).padStart(2, "0");

              return (
                <article
                  key={order._id}
                  className="min-h-[430px] rounded-2xl border border-gold-light/20 bg-black/30 p-5 shadow-lg shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-medium text-emerald-300">
                        <CheckCircle2 size={12} />
                        Number ready
                      </span>
                      <p className="mt-1 text-[11px] text-gray-500">
                        {serviceName} · {formatCurrency(order.sellingPrice)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusBadge.className}`}
                    >
                      <StatusIcon size={12} />
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl border border-gold-light/10 bg-black/30 px-3 py-5 text-center">
                    <p className="break-all font-mono text-lg font-bold tracking-wide text-white">
                      {order.phoneNumber || "N/A"}
                    </p>
                    {order.phoneNumber ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handleCopy(order.phoneNumber, "Phone")
                        }
                        className="mt-2 inline-flex items-center gap-1 text-[10px] text-gold-light transition-colors hover:text-white"
                      >
                        <Copy size={11} />
                        Tap to copy
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gold-light shadow-[0_0_12px_rgba(241,194,88,0.8)]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        {order.otpCode
                          ? "OTP received"
                          : "Waiting for your SMS..."}
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                        {order.otpMessage ||
                          "Codes usually arrive within a minute. It shows up here automatically."}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold-light text-[10px] font-semibold text-white">
                      {order.status === "WAITING_FOR_SMS" ? (
                        `${minutesLeft}:${secondsLabel}`
                      ) : (
                        <span className="font-mono text-xs">
                          {order.otpCode || "--"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-amber-500/15 p-4 text-[11px] text-gray-300">
                    <p className="font-semibold text-gold-light">
                      Always do this before getting a new number
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      <li>Delete and reinstall your {serviceName} app</li>
                      <li>Use normal {serviceName} app</li>
                    </ul>
                    <p className="mt-2 font-medium text-white">
                      Most especially, make use of a VPN.
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-[10px] text-gray-500">
                    <span>{order.country || "Unknown country"}</span>
                    <span>Expires {formatDate(order.expiresAt)}</span>
                  </div>

                  <div className="mt-4">{renderActions(order)}</div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default OtpBox;
