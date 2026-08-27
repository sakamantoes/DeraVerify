// components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import imageObject from "../utils/image";
import useAuth from "../store/useAuth";

export default function Sidebar({
  navItems,
  onNavigate,
  workspaceLabel = "Workspace",
  statusTitle = "Verification ready",
  statusDescription = "Manage your workspace and keep activity organized.",
  StatusIcon = ShieldCheck,
  supportLabel = "Support",
  userRole = "user",
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSupportClick = (e) => {
    e.preventDefault();
    
    // If this is admin sidebar (passed as prop), go directly to admin support
    if (userRole === "admin") {
      navigate("/a/support");
      return;
    }
    
    // For non-admin, check if user is authenticated
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Navigate based on user role
    const role = user?.data?.role || user?.role;
    if (role === "admin") {
      navigate("/a/support");
    } else {
      navigate("/f/support");
    }
  };

  return (
    <aside className="flex h-full w-72 shrink flex-col border-r border-red-light/30 bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-xl">
      <div className="flex h-20 items-center gap-3 border-b border-red-light/30 px-5">
        <img
          src={imageObject.Logo}
          alt="Smswinners"
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="bg-gradient-to-r from-red-light to-red-dark bg-clip-text text-lg font-bold text-transparent">
            Smswinners
          </p>
          <p className="text-xs font-medium text-gray-400">{workspaceLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-gradient-to-r from-red-light to-red-dark text-white shadow-lg shadow-red-light/25"
                  : "text-gray-400 hover:bg-red-light/10 hover:text-white"
              }`
            }
          >
            <item.icon size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-red-light/30 p-4">
        <div className="rounded-lg border border-red-light/30 bg-white/5 p-4 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-bold text-red-400">
            <StatusIcon size={18} />
            {statusTitle}
          </div>
          <p className="mt-2 text-xs leading-5 text-gray-400">
            {statusDescription}
          </p>
        </div>
        <button
          onClick={handleSupportClick}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-light/30 text-sm font-semibold text-gray-200 transition-all hover:bg-red-light/10 hover:text-white active:scale-95"
        >
          <LifeBuoy size={17} />
          {supportLabel}
        </button>
      </div>
    </aside>
  );
}