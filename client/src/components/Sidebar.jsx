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

  return (
    <aside className="flex h-full w-72 shrink flex-col border-r border-gold-light/15 bg-black backdrop-blur-xl">
      <div className="flex h-20 items-center gap-3 px-5">
        <img
          src={imageObject.Logo2}
          alt="Wave Verify"
          className="h-9 w-13  object-contain"
        />
      {
        userRole === "admin" &&(
          <div>
          <p className="bg-gradient-to-r from-gold-light to-gold-dark bg-clip-text text-lg font-bold text-transparent">
            Wave Verify
          </p>
          <p className="text-xs font-medium text-gray-400">{workspaceLabel}</p>
        </div>
        )
      }
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

      <div className="space-y-3 border-t border-gold-light/10 p-4">
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex h-10 w-full items-center justify-start gap-2 px-3 text-sm font-semibold text-gray-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}