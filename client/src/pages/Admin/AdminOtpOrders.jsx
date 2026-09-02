import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { getAllOtpOrders } from "../../service/admin.js";
import { formatCurrency } from "../../utils/transaction.js";
import { formatServiceName } from "../../utils/serviceCode.js";

const ORDERS_PER_PAGE = 20;

// Same status-badge language as the user-facing OTP Inbox, so an order
// reads the same way whether an admin or the owning user is looking at it.
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

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString();
};

export default function AdminOtpOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllOtpOrders({
        page,
        limit: ORDERS_PER_PAGE,
        status: statusFilter,
        search: searchTerm || undefined,
      });

      setOrders(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
      setTotalResults(response?.pagination?.total ?? response?.data?.length ?? 0);
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

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, searchTerm]);

  const hasActiveFilter = Boolean(searchTerm || statusFilter !== "ALL");

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
      {/* Compact header */}
      <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-light/40 bg-gold-light/10 px-3 py-1 text-xs font-semibold text-gold-300">
            <Inbox size={13} />
            Admin · Debugging
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchOrders()}
          disabled={loading}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold-dark px-5 text-sm font-semibold text-white shadow-lg shadow-gold-light/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </section>

      {/* Workspace */}
      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-md">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-black/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Orders</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {totalResults} result{totalResults === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search phone, service, country, provider"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-gold-light/50 focus:outline-none focus:ring-1 focus:ring-gold-light/50"
              />
            </div>

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
              description="Orders will appear here once users start buying numbers."
            />
          )
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black/30">
                  <tr>
                    {[
                      "User",
                      "Number",
                      "Service",
                      "OTP",
                      "Amount",
                      "Status",
                      "Cancel Reason",
                      "Purchased",
                      "Expires",
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
                  {orders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr
                        key={order._id}
                        className="transition-colors hover:bg-white/5"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">
                            {order.userId?.username || "Unknown user"}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {order.userId?.email || "No email on record"}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-mono text-sm text-white">
                          {order.phoneNumber || "N/A"}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-300">
                          <p className="font-medium text-white">
                            {formatServiceName(order.service)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.country || "N/A"}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-mono text-sm text-gray-300">
                          {order.otpCode || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-white">
                          {formatCurrency(order.sellingPrice)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
                          >
                            <StatusIcon size={12} />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-48 truncate text-sm text-gray-400">
                          {order.cancelReason || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">
                          {formatDate(order.purchasedAt || order.createdAt)}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400">
                          {formatDate(order.expiresAt)}
                        </td>
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
                          <User size={13} className="shrink-0 text-gray-500" />
                          <p className="truncate text-sm font-semibold text-white">
                            {order.userId?.username || "Unknown user"}
                          </p>
                        </div>
                        <p className="mt-0.5 truncate font-mono text-xs text-gray-500">
                          {order.phoneNumber || "N/A"}
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
                          {formatServiceName(order.service)}
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
                        <span className="font-semibold text-white">
                          {formatCurrency(order.sellingPrice)}
                        </span>
                      </p>
                      <p className="flex flex-col">
                        <span className="text-xs text-gray-500">OTP</span>
                        <span className="font-mono font-semibold text-white">
                          {order.otpCode || "—"}
                        </span>
                      </p>
                    </div>

                    {order.cancelReason ? (
                      <p className="mt-2 text-xs text-gray-500">
                        <span className="text-gray-600">Cancelled: </span>
                        {order.cancelReason}
                      </p>
                    ) : null}

                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs text-gray-500">
                      <span>{formatDate(order.purchasedAt || order.createdAt)}</span>
                      <span>Expires {formatDate(order.expiresAt)}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="border-t border-white/10 px-5 py-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
