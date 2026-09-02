// components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { LifeBuoy, LogOut } from "lucide-react";
import imageObject from "../utils/image";
import useAuth from "../store/useAuth";

export default function Sidebar({
  navItems,
  onNavigate,
  workspaceLabel = "Workspace",
  supportLabel = "Support",
  userRole = "user",
  onLogout,
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
    <aside className="flex h-full w-72 shrink flex-col border-r border-gold-light/30 bg-black backdrop-blur-xl">
      <div className="flex h-20 items-center gap-3 border-b border-gold-light/30 px-5">
        <img
          src={imageObject.Logo2}
          alt="Smswinners"
          className="h-15 w-20 rounded-full object-cover"
        />
        <div>
          <p className="bg-gradient-to-r from-gold-light to-gold-dark bg-clip-text text-lg font-bold text-transparent">
            Wave Verify
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
                  ? "bg-gradient-to-r from-gold-light to-gold-dark text-white shadow-lg shadow-gold-light/25"
                  : "text-gray-400 hover:bg-gold-light/10 hover:text-white"
              }`
            }
          >
            <item.icon size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="space-y-3 border-t border-gold-light/30 p-4">
        <button
          onClick={handleSupportClick}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-gold-light/30 text-sm font-semibold text-gray-200 transition-all hover:bg-gold-light/10 hover:text-white active:scale-95"
        >
          <LifeBuoy size={17} />
          {supportLabel}
        </button>
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-semibold text-gray-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}