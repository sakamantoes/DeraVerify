import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  cancelActivation,
  checkOtpStatus,
  getMyOrders,
} from "../../service/number";
import { formatCurrency } from "../../utils/transaction.js";
import { formatServiceName } from "../../utils/serviceCode.js";

const OtpBox = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [checkingOrderId, setCheckingOrderId] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders();
      setOrders(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch OTP orders:", err);
      setError(err?.response?.data?.message || "Failed to load OTP orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" || order.status === statusFilter;
      const matchesSearch =
        !search ||
        String(order.phoneNumber || "")
          .toLowerCase()
          .includes(search) ||
        String(order.service || "")
          .toLowerCase()
          .includes(search) ||
        String(order.country || "")
          .toLowerCase()
          .includes(search) ||
        String(formatServiceName(order.service) || "")
          .toLowerCase()
          .includes(search) ||
        String(order.activationId || "")
          .toLowerCase()
          .includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [orders, searchTerm, statusFilter]);

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
          className: "border-red-light/20 bg-red-light/15 text-red",
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

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white shadow-md sm:p-8">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-300">
              <Inbox size={13} />
              OTP Inbox
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Track your purchased numbers
              <br className="hidden sm:block" /> and OTP messages.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              View every activation tied to your account, including phone
              numbers, status, OTP code, and provider message.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-red-300 font-semibold">
              Important: Before requesting an OTP, make sure you have assigned
              or linked the purchased number to the service you bought it for.
              After the assigned expiry time, cancel the order. you will be
              refunded immediatly refund. Do not proceed to get the OTP
              after it has expired, to avoid losing funds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void fetchOrders();
            }}
            disabled={loading}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-dark/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Orders
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-md sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
              Find OTP Order
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Search by phone, service, country, or activation ID.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search OTP orders"
                className="h-11 w-full min-w-0 rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50 sm:min-w-72"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
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
      </section>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-md">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">OTP Orders</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {filteredOrders.length} result
              {filteredOrders.length === 1 ? "" : "s"}
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
        ) : filteredOrders.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <Inbox size={42} className="mx-auto text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              No OTP orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Purchased numbers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-black/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    OTP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Expires At
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  const StatusIcon = statusBadge.icon;
                  const isChecking = checkingOrderId === order._id;
                  const isCancelling = cancellingOrderId === order._id;
                  const canCheckOtp = ![
                    "OTP_RECEIVED",
                    "COMPLETED",
                    "CANCELLED",
                    "FAILED",
                  ].includes(order.status);
                  const canCancelOtp =
                    Boolean(order.activationId) &&
                    ![
                      "OTP_RECEIVED",
                      "COMPLETED",
                      "CANCELLED",
                      "FAILED",
                    ].includes(order.status);

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
                      <td className="px-4 py-3 flex">
                        <button
                          type="button"
                          onClick={() => void handleCancelOtp(order)}
                          disabled={isCancelling || !canCancelOtp}
                          className="mr-2 inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-red-light/50 px-3 text-xs font-semibold text-gray-300 transition-colors hover:border-red-light/30 hover:bg-red-light/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/20 bg-green-700/70 px-3 text-xs font-semibold text-gray-300 transition-colors hover:border-green-500/30 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isChecking ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <RefreshCw size={14} />
                          )}
                          {order.otpCode ? "Checked" : "Get OTP"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default OtpBox;
