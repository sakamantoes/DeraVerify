import {
  AlertCircle,
  Bell,
  ChevronRight,
  CreditCard,
  Inbox,
  Loader2,
  MessageSquareText,
  Phone,
  ReceiptText,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import WalletBalanceCard from "../../components/WalletBalanceCard.jsx";
import { GetAllNotifications } from "../../service/notificationApi.js";
import { getMyOrders } from "../../service/number.js";

const stats = [
  {
    label: "Active Orders",
    value: "6",
    change: "2 waiting",
    icon: Phone,
    iconBg: "bg-gradient-to-br from-gold/50 to-gold/20",
    iconColor: "text-gold-light",
    changeBg: "bg-gold/10 text-gold border-white/10 shadow-md",
  },
  {
    label: "OTP Received",
    value: "0",
    change: "Total OTPs received",
    icon: MessageSquareText,
    iconBg: "bg-gold/15",
    iconColor: "text-gold/90",
    changeBg: "bg-gold/10 text-gold border-white/10 shadow-md",
  },
];

const serviceCards = [
  {
    title: "Available Phone Numbers",
    description:
      "Buy SMS-capable numbers listed by admin for app verification.",
    meta: "More 86 countries in stock",
    icon: Smartphone,
    to: "/f/numbers",
  },
  {
    title: "OTP Inbox",
    description:
      "Receive codes from purchased numbers and track completed orders.",
    meta: "Request your OTP codes",
    icon: ShieldCheck,
    to: "/f/otp-box",
  },
];

const quickActions = [
  { label: "Buy Number", icon: Phone, to: "/f/numbers" },
  { label: "OTP Inbox", icon: Inbox, to: "/f/otp-box" },
  { label: "View Deposits", icon: CreditCard, to: "/f/deposits" },
  { label: "View Receipts", icon: ReceiptText, to: "/f/receipts" },
  { label: "Settings", icon: Settings, to: "/f/settings" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  // New state for OTP received count
  const [otpReceivedCount, setOtpReceivedCount] = useState(0);
  const [loadingOtp, setLoadingOtp] = useState(true);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

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
    <div className="mx-auto max-w-7xl space-y-4 px-3 sm:space-y-5 sm:px-4 md:px-6">
      {/* Section 2: Stats row — Wallet Balance, Active Orders, OTP Received */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <WalletBalanceCard />
        {updatedStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Section 3: Quick Actions (left) + Available Services (right) */}
      <section className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-xl border border-gold-light/10 bg-white/5 p-4 shadow-md sm:p-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 sm:text-sm">
            Quick Actions
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:grid-cols-3">
            {quickActions.map(({ label, icon: Icon, to }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(to)}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gold-light/10 bg-black/20 px-2 py-5 text-center shadow-md transition-all hover:border-gold-light/30 hover:bg-gold-light/10 active:scale-95"
              >
                <Icon size={18} className="text-gold-light" />
                <span className="text-xs font-semibold leading-tight text-gray-300">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Available Services */}
        <div className="rounded-xl border border-gold-light/10 bg-white/5 p-4 shadow-md sm:p-5">
          <h2 className="text-sm font-semibold text-white sm:text-base">
            Available Services
          </h2>
          <div className="mt-3 space-y-2.5 sm:mt-4">
            {serviceCards.map((service) => (
              <button
                key={service.title}
                type="button"
                onClick={() => navigate(service.to)}
                className="group flex w-full items-center gap-3 rounded-xl border border-gold-light/10 bg-black/20 p-3 text-left shadow-md transition-all hover:-translate-y-1 hover:border-gold-light/40 hover:bg-gold-light/5 sm:p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-light/10 text-gold transition-colors group-hover:bg-gold-light/20">
                  <service.icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {service.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-gray-500">
                    {service.description}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    {service.meta}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-gray-600 transition-colors group-hover:text-gold-light"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Recent activity — full width */}
      <section className="rounded-xl border border-gold-light/10 bg-white/5 p-4 shadow-md sm:p-5">
        <h2 className="text-sm font-semibold text-white">Recent Deposit</h2>
        <div className="mt-4 space-y-1">
          {loadingNotifications ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={22} className="animate-spin text-gold-light" />
            </div>
          ) : notificationError ? (
            <div className="flex items-center gap-2 rounded-lg border border-gold-light/10 bg-gold-light/5 px-3 py-4 text-xs text-gold-300 sm:text-sm">
              <AlertCircle size={14} className="shrink-0" />
              <span>{notificationError}</span>
            </div>
          ) : recentNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="No recent deposits"
              description="Fund your account to see deposits here."
              actionLabel="Fund Account"
              onAction={() =>
                navigate("/f/fund-account", {
                  state: { from: "/f/dashboard" },
                })
              }
            />
          ) : (
            recentNotifications.map((notification) => (
              <div
                key={notification._id}
                className="flex flex-col gap-2 rounded-lg border-b border-gold-light/5 px-2 py-2.5 shadow-md transition-all hover:-translate-y-1 hover:bg-white/5 sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="flex min-w-0 items-start gap-2 sm:flex-1 sm:gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-light/10 text-gold-light/80 sm:h-8 sm:w-8">
                    <Bell size={13} className="sm:h-[15px] sm:w-[15px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white sm:text-sm">
                      {notification.title || "Notification"}
                    </p>
                    <p className="line-clamp-2 text-[10px] text-gray-500 sm:text-xs">
                      {notification.message || "No message"}
                    </p>
                  </div>
                </div>
                <p className="pl-9 text-[10px] font-medium text-gray-500 sm:shrink-0 sm:pl-0 sm:text-xs">
                  {formatNotificationDate(notification.createdAt)}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
