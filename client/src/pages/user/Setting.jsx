import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mail,
  Moon,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../store/useAuth.js";
import api from "../../service/api.js";

const formatUserId = (id) => {
  if (!id) return "Not available";
  return `...${String(id).slice(-8)}`;
};

export default function Setting() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const profile = user?.data || user || {};
  const displayName = profile.username || profile.name || "Verified User";
  const displayEmail = profile.email || "No email on file";
  const userId = profile.id || profile._id;
  const initial = (displayName || displayEmail || "U").slice(0, 1).toUpperCase();

  // Username edit state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(displayName);
  const [updatingUsername, setUpdatingUsername] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Simple preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const deleteReady = deleteConfirm.trim().toUpperCase() === "DELETE";

  const handleCopy = async (value, label) => {
    if (!value) {
      toast.info(`${label} is not available yet`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (newUsername === displayName) {
      setIsEditingUsername(false);
      return;
    }

    setUpdatingUsername(true);
    try {
      const response = await api.put("/api/auth/update-username", {
        username: newUsername.trim(),
      });

      if (response.data.success) {
        toast.success("Username updated successfully");
        if (updateUser) {
          updateUser({ ...profile, username: newUsername.trim() });
        }
        setIsEditingUsername(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update username");
      setNewUsername(displayName);
    } finally {
      setUpdatingUsername(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await api.put("/api/auth/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success(`${key} preference updated`);
  };

  const handleDeletionRequest = () => {
    if (!deleteReady) {
      toast.info("Type DELETE to confirm this request");
      return;
    }
    toast.info("Account deletion request submitted");
    setDeleteConfirm("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-300">
            <User size={13} />
            Account Settings
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Settings
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
            Manage your profile, security, and preferences.
          </p>
        </div>
      </section>

      {/* Profile Section */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 select-none items-center justify-center rounded-2xl bg-gradient-to-br from-red-light to-red-dark text-3xl font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Profile
              </p>
              {isEditingUsername ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/40 w-[200px] sm:w-[400px] px-3 py-2 text-lg font-bold text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                    autoFocus
                    disabled={updatingUsername}
                  />
                  <button
                    onClick={handleUpdateUsername}
                    disabled={updatingUsername}
                    className="rounded-lg bg-red-light px-2 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-dark disabled:opacity-50"
                  >
                    {updatingUsername ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setNewUsername(displayName);
                      setIsEditingUsername(false);
                    }}
                    className="rounded-lg border border-white/10 px-2 py-2 text-sm font-semibold text-gray-400 transition-colors hover:bg-white/10"
                  >
                   <p>X</p>
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <User size={14} />
                  </button>
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Mail size={14} className="text-red-400" />
                  <span className="break-all">{displayEmail}</span>
                </div>
                <button
                  onClick={() => handleCopy(displayEmail, "Email")}
                  className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-white"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={17} />
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-widest text-gray-500">
              Account Status
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Verified</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-300 border border-white/10">
              <ShieldCheck size={17} />
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-widest text-gray-500">
              User ID
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-semibold text-white">
                {formatUserId(userId)}
              </p>
              <button
                onClick={() => handleCopy(userId, "User ID")}
                className="text-gray-500 transition-colors hover:text-white"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Lock size={18} />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-white">Change Password</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            <Lock size={14} />
            Change Password
          </button>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 pr-10 text-sm text-white placeholder:text-gray-500 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 pr-10 text-sm text-white placeholder:text-gray-500 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 pr-10 text-sm text-white placeholder:text-gray-500 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="inline-flex items-center gap-2 rounded-lg bg-red-light px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-dark disabled:opacity-50"
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-400 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-md">
        <h2 className="font-semibold text-white">Quick Links</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => navigate("/f/fund-account")}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:border-red-light/30 hover:bg-red-light/10"
          >
            <Wallet size={18} className="text-red-400" />
            <span className="text-sm font-semibold text-white">Fund Wallet</span>
          </button>
          <button
            onClick={() => navigate("/f/deposits")}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:border-red-light/30 hover:bg-red-light/10"
          >
            <CreditCard size={18} className="text-red-400" />
            <span className="text-sm font-semibold text-white">Deposits</span>
          </button>
          <button
            onClick={() => navigate("/f/receipts")}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3 transition-colors hover:border-red-light/30 hover:bg-red-light/10"
          >
            <ReceiptText size={18} className="text-red-400" />
            <span className="text-sm font-semibold text-white">Receipts</span>
          </button>
        </div>
      </section>

      {/* Delete Account */}
      <section className="rounded-xl border border-red-light/20 bg-red-light/10 p-6 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-light/15 text-red">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-white">Delete Account</h2>
            <p className="mt-1 text-sm leading-6 text-gray-300">
              Permanently delete your account and all associated data.
            </p>
          </div>
        </div>

        <label className="mt-5 block text-xs font-semibold uppercase tracking-widest text-red-200">
          Type DELETE to confirm
        </label>
        <input
          value={deleteConfirm}
          onChange={(event) => setDeleteConfirm(event.target.value)}
          placeholder="DELETE"
          className="mt-2 h-11 w-full rounded-lg border border-red-light/20 bg-black/40 px-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-red-light/60 focus:ring-1 focus:ring-red-light/50"
        />
        <button
          onClick={handleDeletionRequest}
          disabled={!deleteReady}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-red-light px-4 text-sm font-semibold text-white transition-colors hover:bg-red-dark disabled:cursor-not-allowed disabled:bg-red-light/30 disabled:text-white/50"
        >
          <Trash2 size={15} />
          Request Account Deletion
        </button>
      </section>
    </div>
  );
}