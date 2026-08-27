import {
  AlertCircle,
  Bell,
  CreditCard,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WalletBalanceCard from "../../components/WalletBalanceCard.jsx";
import { GetAllNotifications } from "../../service/notificationApi.js";
import { getUserPurchasedApi } from "../../service/logs.js";
import { getMyOrders } from "../../service/number.js";

const stats = [
  {
    label: "Active Orders",
    value: "6",
    change: "2 waiting",
    icon: Phone,
    iconBg: "bg-gradient-to-br from-red/50 to-red/20",
    iconColor: "text-red-light",
    changeBg: "bg-red/10 text-red border-white/10 shadow-md",
  },
  {
    label: "Emails Bought",
    value: "0",
    change: "Total purchased",
    icon: Mail,
    iconBg: "bg-gradient-to-br from-red/50 to-red/20",
    iconColor: "text-red-light",
    changeBg: "bg-red/10 text-red border-white/10 shadow-md",
  },
  {
    label: "OTP Received",
    value: "0",
    change: "Total OTPs received",
    icon: MessageSquareText,
    iconBg: "bg-red/15",
    iconColor: "text-red/90",
    changeBg: "bg-red/10 text-red border-white/10 shadow-md",
  },
];

const serviceCards = [
  {
    title: "Available Phone Numbers",
    description:
      "Buy SMS-capable numbers listed by admin for app verification.",
    meta: "More 86 countries in stock",
    icon: Smartphone,
  },
  {
    title: "Virtual Email Accounts",
    description:
      "Purchase fresh inboxes for signup, confirmation, and recovery links.",
    meta: "Logs purchase ready",
    icon: Mail,
  },
  {
    title: "OTP Inbox",
    description:
      "Receive codes from purchased numbers and track completed orders.",
    meta: "Request your OTP codes",
    icon: ShieldCheck,
  },
];

const quickActions = [
  { label: "Fund Account", icon: CreditCard, to: "/f/fund-account" },
  { label: "Buy Number", icon: Phone, to: "/f/numbers" },
  { label: "Buy Logs", icon: Mail, to: "/f/logs" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");
  const [emailsBoughtCount, setEmailsBoughtCount] = useState(0);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  
  // New state for OTP received count
  const [otpReceivedCount, setOtpReceivedCount] = useState(0);
  const [loadingOtp, setLoadingOtp] = useState(true);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const fetchPurchaseHistory = async () => {
    try {
      setLoadingEmails(true);
      const data = await getUserPurchasedApi();
      const purchases = data.data || data.purchases || [];
      setPurchaseHistory(purchases);
      setEmailsBoughtCount(purchases.length);
    } catch (error) {
      console.log("Error fetching purchase history:", error);
      setPurchaseHistory([]);
      setEmailsBoughtCount(0);
    } finally {
      setLoadingEmails(false);
    }
  };

  // New function to fetch orders and calculate OTP received count
  const fetchOrdersForStats = async () => {
    try {
      setLoadingOtp(true);
      const response = await getMyOrders();
      const orders = response?.data || [];
      
      // Count OTP received (status OTP_RECEIVED or COMPLETED)
      const receivedOtps = orders.filter(
        (order) => order.status === "OTP_RECEIVED" || order.status === "COMPLETED"
      ).length;
      
      // Count active orders (waiting for OTP)
      const activeOrders = orders.filter(
        (order) => order.status === "WAITING_FOR_SMS"
      ).length;
      
      setOtpReceivedCount(receivedOtps);
      setActiveOrdersCount(activeOrders);
      
     
    } catch (error) {
      console.error("Error fetching orders for stats:", error);
      setOtpReceivedCount(0);
      setActiveOrdersCount(0);
    } finally {
      setLoadingOtp(false);
    }
  };

  useEffect(() => {
    const fetchRecentNotifications = async () => {
      try {
        setLoadingNotifications(true);
        setNotificationError("");

        const response = await GetAllNotifications(1, 5, false);
        setRecentNotifications(response?.data?.notifications || []);
      } catch (err) {
        console.error("Failed to fetch recent notifications:", err);
        setNotificationError(
          err?.response?.data?.message || "Failed to load notifications",
        );
      } finally {
        setLoadingNotifications(false);
      }
    };

    void fetchRecentNotifications();
    void fetchPurchaseHistory();
    void fetchOrdersForStats(); // Fetch orders for OTP count
  }, []);

  const formatNotificationDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Update stats with dynamic counts
  const updatedStats = stats.map((stat) => {
    if (stat.label === "Emails Bought") {
      return {
        ...stat,
        value: loadingEmails ? "..." : emailsBoughtCount.toLocaleString(),
      };
    }
    if (stat.label === "OTP Received") {
      return {
        ...stat,
        value: loadingOtp ? "..." : otpReceivedCount.toLocaleString(),
        change: `${((otpReceivedCount / (otpReceivedCount + (loadingOtp ? 1 : 1))) * 100 || 0).toFixed(1)}% success`,
      };
    }
    if (stat.label === "Active Orders") {
      return {
        ...stat,
        value: loadingOtp ? "..." : activeOrdersCount.toLocaleString(),
        change: activeOrdersCount === 1 ? "1 waiting" : `${activeOrdersCount} waiting`,
      };
    }
    return stat;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-950/40 via-black to-black p-4 sm:p-6 md:p-8 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-red-300">
              <ShieldCheck size={11} className="sm:w-[13px] sm:h-[13px]" />
              Verification workspace
            </div>
            <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              Buy virtual numbers, emails,
              <br className="hidden xs:block sm:block" /> and receive OTP codes
              in one place.
            </h1>
            <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm leading-5 sm:leading-6 text-gray-400">
              Fund your account, pick services from admin stock, track active
              purchases, and receive verification codes as they arrive.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/f/fund-account", { state: { from: "/f/dashboard" } })
            }
            className="inline-flex h-9 sm:h-11 shrink-0 items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-red-dark/40 px-3 sm:px-5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-dark"
          >
            <Wallet size={14} className="sm:w-4 sm:h-4" />
            Fund Account
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Wallet Balance Card - Full width on mobile, normal on desktop */}
        <div className="sm:col-span-2 lg:col-span-1">
          <WalletBalanceCard />
        </div>

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
                className={`rounded-full border px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-medium text-center ${stat.changeBg}`}
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

      {/* Main Grid */}
      <section className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left Column */}
        <div className="space-y-4 sm:space-y-5">
          {/* Quick Actions */}
          <div className="rounded-xl border border-red-light/10 shadow-md bg-white/5 p-4 sm:p-5">
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-400">
              Quick Actions
            </h2>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 gap-3 xs:grid-cols-3">
              {quickActions.map(({ label, icon: Icon, to }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (to === "/f/fund-account") {
                      navigate(to, {
                        state: { from: "/f/dashboard" },
                      });
                    } else {
                      navigate(to);
                    }
                  }}
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

          {/* Purchase History Section */}
          {purchaseHistory.length > 0 && (
            <div className="rounded-xl border border-red-light/10 shadow-md bg-white/5 p-4 sm:p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-400">
                  Recent Purchases
                </h2>
                <button
                  onClick={() => navigate("/f/logs")}
                  className="text-[10px] sm:text-xs text-red-light hover:text-red-400 transition-colors"
                >
                  View All →
                </button>
              </div>
              <div className="mt-3 sm:mt-4 space-y-2">
                {purchaseHistory.slice(0, 3).map((purchase, index) => (
                  <div
                    key={purchase._id || index}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 p-2 sm:p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {purchase.email || purchase.description || "Log Purchase"}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500">
                        {purchase.createdAt
                          ? new Date(purchase.createdAt).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs sm:text-sm font-semibold text-emerald-400">
                        ₦{purchase.price?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-5">
          {/* Available Services */}
          <div className="rounded-xl border border-red-light/10 shadow-md bg-white/5 p-4 sm:p-5">
            <h2 className="text-sm sm:text-base font-semibold text-white">
              Available Services
            </h2>
            <div className="mt-3 sm:mt-4 space-y-2.5">
              {serviceCards.map((service) => (
                <div
                  key={service.title}
                  className="group flex gap-3 rounded-xl border border-red-light/10 shadow-md bg-black/20 p-3 sm:p-4 transition-all hover:-translate-y-1 hover:border-red-light/40 hover:bg-red-light/5"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-red-light/10 text-red transition-colors group-hover:bg-red-light/20">
                    <service.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
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

          <div className="rounded-xl border border-red-light/10 shadow-md bg-white/5 p-5">
            <h2 className="font-semibold text-white">Recent Deposit</h2>
            <div className="mt-4 space-y-1">
              {loadingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={22} className="animate-spin text-red-light" />
                </div>
              ) : notificationError ? (
                <div className="flex items-center gap-2 rounded-lg border border-red-light/10 bg-red-light/5 px-3 py-4 text-xs sm:text-sm text-red-300">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{notificationError}</span>
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-6 sm:py-8 text-center">
                  <Bell size={20} className="sm:w-6 sm:h-6 mx-auto text-gray-600" />
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    No recent notifications
                  </p>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="flex flex-col gap-2 rounded-lg border-b border-red-light/5 shadow-md px-2 py-2.5 transition-all hover:-translate-y-1 hover:bg-white/5 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <div className="flex min-w-0 items-start gap-2 sm:gap-3 sm:flex-1">
                      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-red-light/10 text-red-light/80">
                        <Bell size={13} className="sm:w-[15px] sm:h-[15px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-white truncate">
                          {notification.title || "Notification"}
                        </p>
                        <p className="line-clamp-2 text-[10px] sm:text-xs text-gray-500">
                          {notification.message || "No message"}
                        </p>
                      </div>
                    </div>
                    <p className="pl-9 text-[10px] sm:text-xs font-medium text-gray-500 sm:shrink-0 sm:pl-0">
                      {formatNotificationDate(notification.createdAt)}
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