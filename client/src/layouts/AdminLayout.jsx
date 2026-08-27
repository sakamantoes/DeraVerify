import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Gauge,
  LogOut,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Wallet,
  X,
  Users,
  Activity,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import useAuth from "../store/useAuth";
import { logout } from "../service/auth.js";
import { FaMoneyBill } from "react-icons/fa";

const adminNavItems = [
  { label: "Dashboard", to: "/a/dashboard", icon: Gauge },
  { label: "Users Management", to: "/a/users", icon: Users },
  { label: "Services & Price Control", to: "/a/numbers", icon: Phone },
  { label: "Logs management", to: "/a/logs", icon: Activity },
  { label: "Payment Tracking", to: "/a/deposits", icon: Wallet },
];

const adminSidebarConfig = {
  navItems: adminNavItems,
  workspaceLabel: "Admin workspace",
  statusTitle: "Admin access",
  statusDescription:
    "Manage users, monitor transactions, and oversee system operations.",
  StatusIcon: ShieldCheck,
};

const adminFallback = {
  name: "Admin User",
  email: "admin@smswinners.com",
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();

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
            />
          </div>
        </div>
      )}

      <div className="relative min-h-screen min-w-0 overflow-x-hidden text-slate-950 lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/30 bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Left: mobile toggle + search */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-slate-800 border-white/30 transition-colors hover:bg-slate-100 lg:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <div
                role="search"
                className="hidden h-10 w-full max-w-lg items-center gap-2 rounded-lg border border-white/30 bg-slate-50 px-3 text-slate-500 transition-colors hover:border-red-light/30 hover:bg-white md:flex"
              >
                <Search size={16} className="shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search users, transactions, numbers..."
                  className="w-full select-none truncate text-sm bg-transparent border-none focus:outline-none"
                />
              </div>
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
                  className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-light"
                />
              </button> */}

              <div className="hidden items-center gap-3 border-l border-white/30 pl-3 sm:flex">
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-red-light to-red-dark text-sm font-bold text-white"
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

              <button
                type="button"
                aria-label="Log out"
                onClick={handleLogout}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
