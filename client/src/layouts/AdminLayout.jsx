import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Gauge,
  Inbox,
  Menu,
  Phone,
  Wallet,
  X,
  Users,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import useAuth from "../store/useAuth";
import { logout } from "../service/auth.js";
import { FaMoneyBill } from "react-icons/fa";

const adminNavItems = [
  { label: "Dashboard", to: "/a/dashboard", icon: Gauge },
  { label: "Users Management", to: "/a/users", icon: Users },
  { label: "Services & Price Control", to: "/a/numbers", icon: Phone },
  { label: "OTP Orders", to: "/a/otp-orders", icon: Inbox },
  { label: "Payment Tracking", to: "/a/deposits", icon: Wallet },
];

// The top nav shows the current page's title instead of each page
// repeating it — one source of truth, updates on navigation.
const adminPageTitles = {
  dashboard: "Dashboard",
  users: "Users Management",
  numbers: "Services & Price Control",
  "otp-orders": "OTP Orders",
  deposits: "Payment Tracking",
  support: "Support",
};

const adminSidebarConfig = {
  navItems: adminNavItems,
  workspaceLabel: "Admin workspace",
};

const adminFallback = {
  name: "Admin User",
  email: "admin@smswinners.com",
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathSegment = location.pathname.split("/").filter(Boolean)[1] || "dashboard";
  const pageTitle = adminPageTitles[pathSegment] || "Dashboard";

  const profile = user?.data || user || adminFallback;

  const initial = (profile.name || profile.email || "A")
    .slice(0, 1)
    .toUpperCase();
  const displayName = profile.username || profile.name || adminFallback.name;
  const displayEmail = profile.email || adminFallback.email;

  const clearAllTokensAndCookies = () => {
    // Clear all auth cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // Clear specific auth tokens
    document.cookie =
      "smsWinnerToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("smswinner_token");
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.clear();

    // Clear any cached data
    if (window.caches) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn("Logout API failed", error);
    }

    // Clear all tokens and cookies
    clearAllTokensAndCookies();

    // Clear auth state
    clearAuth();

    navigate("/login");
  };

  const closeMobileNav = () => {
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen text-white">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
        <Sidebar
          {...adminSidebarConfig}
          onNavigate={() => {}} // Desktop navigation doesn't need to close anything
          userRole="admin"
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Click outside to close */}
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300"
            onClick={closeMobileNav}
          />
          {/* Sidebar panel - clicking inside won't close */}
          <div className="relative h-full w-72">
            <Sidebar
              {...adminSidebarConfig}
              onNavigate={closeMobileNav} // Close when any nav item is clicked
              userRole="admin"
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <div className="relative min-h-screen min-w-0 overflow-x-hidden text-slate-950 lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Left: mobile toggle + current page title */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-white border-white/30 transition-colors hover:bg-white/10 lg:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <h1 className="truncate text-base font-bold text-white sm:text-lg">
                {pageTitle}
              </h1>
            </div>

            {/* Right: notifications + user + logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* <button
                type="button"
                aria-label="Notifications"
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/30 text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Bell size={18} className="text-white" aria-hidden="true" />
                <span
                  aria-label="Unread notifications"
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gold-light"
                />
              </button> */}

              <div className="hidden items-center gap-3 border-l border-white/30 pl-3 sm:flex">
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-gold-light to-gold-dark text-sm font-bold text-white"
                >
                  {initial}
                </div>
                <div className="w-32 lg:w-40">
                  <p className="truncate text-sm font-semibold leading-tight text-white">
                    {displayName}
                  </p>
                  <p className="truncate text-xs leading-tight text-slate-500">
                    {displayEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden px-4 pb-6 pt-[30px] sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
