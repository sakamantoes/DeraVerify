import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wallet,
  Users,
  BarChart3,
  AlertTriangle,
  Activity,
  Server,
  UserCheck,
  CoinsIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../../service/auth";
import { getPlatformDeposits, getSmsPoolBalance } from "../../service/admin";
import { getSmsBowerBalance } from "../../service/number";
import useActiveOtp from "../../hooks/useActiveOtp.js";
import { getRecentSystemNotifications } from "../../service/notificationApi";

const formatSessionTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const serviceCards = [
  {
    title: "Available Numbers Stock",
    description: "Manage SMS-capable numbers inventory across 86 countries.",
    meta: "Over 12,847 numbers available",
    icon: Smartphone,
  },
  {
    title: "Email Accounts Stock",
    description: "Monitor virtual email inventory and bulk purchase orders.",
    meta: "Over 3,421 emails in stock",
    icon: Mail,
  },
];

const quickActions = [
  { label: "Manage Users", icon: Users, path: "/a/users" },
  { label: "View Support", icon: BarChart3, path: "/a/support" },
  { label: "Add Numbers", icon: Phone, path: "/a/numbers" },
  { label: "Logs", icon: Activity, path: "/a/logs" },
];

const parseBalanceValue = (response) => {
  if (response?.data?.balance !== undefined) {
    return Number(response.data.balance) || 0;
  }

  if (response?.balance && typeof response.balance === "string") {
    const match = response.balance.match(/[\d.]+/);
    return match ? Number(match[0]) || 0 : 0;
  }

  if (response?.balance?.balance !== undefined) {
    return Number(response.balance.balance) || 0;
  }

  if (response?.balance !== undefined && typeof response.balance !== "object") {
    return Number(response.balance) || 0;
  }

  return 0;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [smsBowerBalance, setSmsBowerBalance] = useState(0);
  const [smsPoolBalance, setSmsPoolBalance] = useState(0);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const { isLoading, otpOrder, total, refetch } = useActiveOtp();

  const activeOtpSessions = useMemo(() => {
    const orders = Array.isArray(otpOrder) ? otpOrder : [];

    return orders.slice(0, 5).map((order) => {
      const user = order.userId;
      const username =
        typeof user === "object"
          ? user?.username || user?.email
          : order.username || order.email;
      const received = Boolean(order.otpCode);

      return {
        id: order._id || order.activationId || order.phoneNumber,
        user: username || "Unknown user",
        service: String(order.service || "OTP").toUpperCase(),
        country: order.country || "N/A",
        number: order.phoneNumber || "N/A",
        status: received ? "Code received" : "Waiting for OTP",
        time: received
          ? order.otpCode
          : formatSessionTime(order.purchasedAt || order.createdAt),
        received,
      };
    });
  }, [otpOrder]);

  const stats = [
    {
      label: "Total Users",
      value: "0",
      change: "+124 this month",
      icon: Users,
      iconBg: "bg-red/15",
      iconColor: "text-red",
      changeBg: "bg-red/10 text-red border-white/10 shadow-md",
    },
    {
      label: "Active Sessions",
      value: isLoading
        ? "..."
        : Number(total ?? activeOtpSessions.length).toLocaleString(),
      change: "Waiting for OTP",
      icon: Activity,
      iconBg: "bg-gradient-to-br from-red/50 to-red/20",
      iconColor: "text-white",
      changeBg: "bg-red/10 text-red border-white/10 shadow-md",
    },
    {
      label: "Total Revenue",
      value: `NGN ${totalRevenue.toLocaleString()}`,
      change: "+18.2% vs last month",
      icon: CoinsIcon,
      iconBg: "bg-white/10",
      iconColor: "text-gray-200",
      changeBg: "bg-white/8 text-gray-300 border-white/10",
    },
    {
      label: "System Health",
      value: "99.97%",
      change: "All systems operational",
      icon: Server,
      iconBg: "bg-red/15",
      iconColor: "text-red/90",
      changeBg: "bg-red/10 text-red border-white/10 shadow-md",
    },
  ];

  const fetchTotalUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const users =
        response.data?.users || response.users || response.data || [];
      const userCount = Array.isArray(users) ? users.length : 0;
      setTotalUsers(userCount);
    } catch (error) {
      console.error("Error fetching users:", error);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      const response = await getPlatformDeposits();
      const deposits = response?.data || [];
      const revenue = deposits
        .filter((deposit) => deposit.status?.toUpperCase() === "SUCCESS")
        .reduce((sum, deposit) => sum + Number(deposit.amount || 0), 0);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProviderBalances = async () => {
    try {
      setLoadingBalances(true);
      const [bowerResponse, poolResponse] = await Promise.all([
        getSmsBowerBalance(),
        getSmsPoolBalance(),
      ]);

      setSmsBowerBalance(parseBalanceValue(bowerResponse));
      setSmsPoolBalance(parseBalanceValue(poolResponse));
    } catch (error) {
      console.error("Error fetching provider balances:", error);
      setSmsBowerBalance(0);
      setSmsPoolBalance(0);
    } finally {
      setLoadingBalances(false);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await getRecentSystemNotifications(5);
      console.log("Recent notifications response:", response);

      // Fix: Access the nested notifications array properly
      if (response?.success && response?.data?.notifications) {
        setRecentNotifications(response.data.notifications);
      } else if (response?.notifications) {
        // Fallback in case the structure is different
        setRecentNotifications(response.notifications);
      } else {
        console.log("No notifications found in response structure");
        setRecentNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
      setRecentNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchTotalUsers();
      fetchRevenue();
      fetchProviderBalances();
      fetchRecentNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Update the stats array with dynamic total users
  const updatedStats = stats.map((stat) =>
    stat.label === "Total Users"
      ? { ...stat, value: loading ? "..." : totalUsers.toLocaleString() }
      : stat,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-950/40 via-black to-black p-4 sm:p-6 md:p-8 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-red-300">
              <ShieldCheck size={11} className="sm:w-[13px] sm:h-[13px]" />
              Admin Control Panel
            </div>
            <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              Monitor users, transactions,
              <br className="hidden xs:block sm:block" /> and system
              performance.
            </h1>
            <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm leading-5 sm:leading-6 text-gray-400">
              Manage user accounts, track revenue, oversee number/email stock,
              and monitor system health metrics in real-time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/a/users")}
              className="inline-flex h-9 sm:h-11 shrink-0 items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-red-dark/40 px-3 sm:px-5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-dark"
            >
              <Users size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Manage Users</span>
              <span className="xs:hidden">Users</span>
            </button>
            {/* <button
              type="button"
              onClick={() => navigate("/a/reports")}
              className="inline-flex h-9 sm:h-11 shrink-0 items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-white/20 px-3 sm:px-5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <BarChart3 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Reports</span>
            </button> */}
          </div>
        </div>
      </section>

      {/* ── Provider Balance Cards ── */}
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl border-2 border-red-light/30 shadow-lg bg-gradient-to-r from-red-950/60 via-red-900/40 to-black p-4 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-light/20 blur-3xl" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-light/20 border-2 border-red-light/40">
              <Wallet size={24} className="sm:w-8 sm:h-8 text-red-light" />
            </div>
            <div className="flex-1">
              <p className="text-[7px] sm:text-sm font-semibold uppercase text-gray-400">
                Provider Funding Balances
              </p>
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-red-light">
                SMS provider wallet health
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["SMSBower", smsBowerBalance],
                  ["SMSPool", smsPoolBalance],
                ].map(([label, balance]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-black/25 p-4"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                      {label} balance
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-white tracking-tight sm:text-3xl">
                      {loadingBalances ? (
                        <span className="inline-flex items-center gap-2 text-base text-gray-300">
                          <RefreshCw size={18} className="animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        `$${Number(balance).toFixed(2)}`
                      )}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={fetchProviderBalances}
              disabled={loadingBalances}
              className="inline-flex items-center gap-2 rounded-lg border border-red-light/30 bg-red-light/10 px-4 py-2 text-sm font-semibold text-red-light transition-colors hover:bg-red-light/20 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loadingBalances ? "animate-spin" : ""}
              />
              Refresh Balance
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-red-light/20 pt-3">
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span className="text-emerald-400">● Active</span>
        </div>
      </section>

      {/* ── Stat cards ── */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {updatedStats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-white/10 shadow-md bg-white/5 p-4 sm:p-5 transition-all transform hover:-translate-y-1 hover:border-red-light/40 hover:bg-white/5"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
              >
                <stat.icon size={16} className="sm:w-[19px] sm:h-[19px]" />
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] sm:text-xs font-medium text-center ${stat.changeBg}`}
              >
                {stat.change}
              </span>
            </div>
            <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs font-medium uppercase tracking-widest text-gray-500">
              {stat.label}
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* ── Main grid ── */}
      <section className="w-full grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left column */}
        <div className="space-y-4 sm:space-y-5">
          {/* Quick actions */}
          <div className="rounded-xl border border-red-light/10 shadow-md bg-white/5 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-400">
              Admin Quick Actions
            </h2>
            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 xs:grid-cols-4">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-red-light/10 shadow-md bg-black/20 py-3 sm:py-5 px-2 text-center transition-all hover:border-red-light/30 hover:bg-red-light/10 active:scale-105"
                >
                  <Icon size={16} className="sm:w-5 sm:h-5 text-white/40" />
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-300 text-center leading-tight">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active sessions monitoring */}
          <div className="overflow-hidden rounded-xl border border-red-light/10 shadow-md bg-white/5">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 border-b border-red-light/10 shadow-md px-4 sm:px-5 py-3 sm:py-4">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-white">
                  Active User Sessions
                </h2>
                <p className="mt-0.5 text-[10px] sm:text-xs text-gray-500">
                  Real-time OTP requests and number activations
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 rounded-lg border border-white/10 shadow-md px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-gray-300 transition-colors hover:border-red-light/30 hover:bg-red-light/8">
                  <UserCheck size={11} className="sm:w-[13px] sm:h-[13px]" />
                  <span className="hidden xs:inline">Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-1 rounded-lg border border-white/10 shadow-md px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-gray-300 transition-colors hover:border-red-light/30 hover:bg-red-light/8 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={11}
                    className={`sm:w-[13px] sm:h-[13px] ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden xs:inline">Refresh</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-red-light/10">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 sm:px-5 py-10 text-sm text-gray-400">
                  <RefreshCw size={16} className="animate-spin" />
                </div>
              ) : activeOtpSessions.length === 0 ? (
                <div className="px-4 sm:px-5 py-10 text-center text-sm text-gray-500">
                  No active OTP orders right now.
                </div>
              ) : (
                activeOtpSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-2 px-4 sm:px-5 py-3 sm:py-4 hover:bg-white/5 transition-all"
                  >
                    {/* User + service */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-base font-semibold text-white">
                          {session.user}
                        </span>
                        <span className="rounded-full border border-white/10 shadow-md bg-red-light/10 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[11px] font-medium text-red">
                          {session.service}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-500">
                        <span className="break-all">{session.number}</span>
                        <button
                          aria-label="Copy number"
                          className="rounded p-0.5 text-gray-600 transition-colors hover:text-gray-300"
                        >
                          <Copy size={11} className="sm:w-[13px] sm:h-[13px]" />
                        </button>
                      </div>
                      <div className="mt-0.5 text-[10px] sm:text-xs text-gray-600">
                        {session.country}
                      </div>
                    </div>

                    {/* Status and code row */}
                    <div className="flex items-center justify-between gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium">
                        {session.received ? (
                          <CheckCircle2
                            size={12}
                            className="sm:w-[14px] sm:h-[14px] text-emerald-500"
                          />
                        ) : (
                          <Clock3
                            size={12}
                            className="sm:w-[14px] sm:h-[14px] text-amber-500"
                          />
                        )}
                        <span
                          className={
                            session.received
                              ? "text-emerald-400"
                              : "text-gray-400"
                          }
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="shrink-0 rounded-lg border border-red-light/10 shadow-md bg-black/40 px-2 sm:px-3 py-1.5 sm:py-2 text-center font-mono text-xs sm:text-sm font-bold tracking-widest text-white">
                        {session.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-5">
          {/* System inventory */}
          <div className="rounded-xl border border-red-light/10 shadow-md bg-white/5 p-4 sm:p-5">
            <h2 className="text-sm sm:text-base font-semibold text-white">
              System Inventory
            </h2>
            <div className="mt-3 sm:mt-4 space-y-2.5">
              {serviceCards.map((service) => (
                <div
                  key={service.title}
                  className="group flex gap-3 rounded-xl border border-red-light/10 shadow-md bg-black/20 p-3 sm:p-4 transition-all hover:-translate-y-1 hover:border-red-light/40 hover:bg-red-light/5"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-red-light/10 text-red transition-colors group-hover:bg-red-light/20">
                    <service.icon
                      size={16}
                      className="sm:w-[18px] sm:h-[18px]"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {service.title}
                    </p>
                    <p className="mt-0.5 text-[10px] sm:text-xs leading-4 sm:leading-5 text-gray-500">
                      {service.description}
                    </p>
                    <p className="mt-1 text-[9px] sm:text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                      {service.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity / alerts */}
          <div className="rounded-xl border border-red-light/10 shadow-md bg-white/5 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-semibold text-white">
                System Alerts & Activity
              </h2>
              <button
                onClick={fetchRecentNotifications}
                disabled={loadingNotifications}
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                <RefreshCw
                  size={12}
                  className={`sm:w-[14px] sm:h-[14px] ${loadingNotifications ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="mt-3 sm:mt-4 space-y-1">
              {loadingNotifications ? (
                <div className="flex justify-center py-8">
                  <RefreshCw size={24} className="animate-spin text-gray-500" />
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No recent activities
                </div>
              ) : (
                recentNotifications.map((notification, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 border-b border-red-light/5 shadow-md rounded-lg px-2 py-2 sm:py-2.5 transition-all hover:-translate-y-1 hover:bg-white/5"
                  >
                    <div
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg ${
                        notification.direction === "up"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : notification.direction === "down"
                            ? "bg-red-light/10 text-red-light/80"
                            : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {notification.direction === "up" ? (
                        <ArrowUpRight
                          size={13}
                          className="sm:w-[15px] sm:h-[15px]"
                        />
                      ) : notification.direction === "down" ? (
                        <ArrowDownRight
                          size={13}
                          className="sm:w-[15px] sm:h-[15px]"
                        />
                      ) : (
                        <AlertTriangle
                          size={13}
                          className="sm:w-[15px] sm:h-[15px]"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs sm:text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="truncate text-[10px] sm:text-xs text-gray-500">
                        {notification.detail}
                      </p>
                      {notification.user && (
                        <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5">
                          User: {notification.user}
                        </p>
                      )}
                    </div>
                    <p
                      className={`shrink-0 text-[10px] sm:text-xs font-semibold tabular-nums ${
                        notification.direction === "up"
                          ? "text-emerald-400"
                          : notification.direction === "down"
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      {notification.amount || ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
