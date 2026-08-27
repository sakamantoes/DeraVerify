import React, { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Eye,
  RefreshCw,
  AlertCircle,
  Activity,
  Clock,
  MapPin,
  Smartphone,
  CreditCard,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Save,
  X,
} from "lucide-react";
import { getAllUsers, activateUser, deactivateUser } from "../../service/auth";
import { refundAndEditBalance } from "../../service/admin";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Wallet edit states
  const [editingWalletId, setEditingWalletId] = useState(null);
  const [editWalletValue, setEditWalletValue] = useState("");
  const [walletUpdateLoading, setWalletUpdateLoading] = useState(false);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      console.log("Users data:", data);
      
      // Handle different response structures
      const usersArray = data?.data?.users || [];
      setUsers(usersArray);
      setFilteredUsers(usersArray);
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ================= ACTIVATE USER =================
  const handleActivateUser = async (id) => {
    if (!window.confirm("Are you sure you want to activate this user?")) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");
      
      await activateUser(id);
      setSuccess("User activated successfully!");
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to activate user");
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  // ================= DEACTIVATE USER =================
  const handleDeactivateUser = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");
      
      await deactivateUser(id);
      setSuccess("User deactivated successfully!");
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to deactivate user");
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  // ================= EDIT WALLET BALANCE =================
  const handleEditWalletStart = (user) => {
    setEditingWalletId(user._id);
    setEditWalletValue(user.walletBalance?.toString() || "0");
  };

  const handleEditWalletCancel = () => {
    setEditingWalletId(null);
    setEditWalletValue("");
  };

  const handleEditWalletSave = async (userId) => {
    const walletBalance = parseFloat(editWalletValue);
    
    if (isNaN(walletBalance) || walletBalance < 0) {
      setError("Please enter a valid positive number");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setWalletUpdateLoading(true);
      setError("");
      setSuccess("");
      
      await refundAndEditBalance(userId, walletBalance);
      setSuccess("Wallet balance updated successfully!");
      await fetchUsers(); // Refresh the list
      setEditingWalletId(null);
      setEditWalletValue("");
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to update wallet balance");
    } finally {
      setWalletUpdateLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  // ================= FILTER USERS =================
  useEffect(() => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.phone && user.phone.includes(searchTerm))
      );
    }
    
    // Apply status filter - FIXED: Check the actual status field
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => {
        const userStatus = user.status === "active" || user.isActive === true ? "active" : "inactive";
        return userStatus === statusFilter;
      });
    }
    
    setFilteredUsers(filtered);
  }, [searchTerm, statusFilter, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Stats calculations
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active" || u.isActive === true).length;
  const inactiveUsers = users.filter((u) => u.status === "inactive" || u.isActive === false).length;
  const newThisMonth = users.filter((u) => {
    const createdDate = new Date(u.createdAt || u.created_at);
    const now = new Date();
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
  }).length;
  
  // Wallet stats
  const totalWalletBalance = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
  const usersWithBalance = users.filter((u) => (u.walletBalance || 0) > 0).length;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      change: "All time",
      icon: UsersIcon,
      iconBg: "bg-red/15",
      iconColor: "text-red",
    },
    {
      label: "Active Users",
      value: activeUsers,
      change: `${totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}% of total`,
      icon: UserCheck,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
    },
    {
      label: "Inactive Users",
      value: inactiveUsers,
      change: `${totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : 0}% of total`,
      icon: UserX,
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-400",
    },
    {
      label: "New This Month",
      value: newThisMonth,
      change: "+" + newThisMonth + " new",
      icon: TrendingUp,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
    },
  ];

  // Helper function to get user status consistently
  const getUserStatus = (user) => {
    return (user.status === "active" || user.isActive === true) ? "active" : "inactive";
  };

  // Helper function to format wallet balance in Naira
  const formatWalletBalance = (balance) => {
    if (balance === undefined || balance === null) return "₦0.00";
    return `₦${Number(balance).toFixed(2)}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
              <UsersIcon size={13} />
              User Management
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Manage platform users
              <br className="hidden sm:block" /> control access & permissions.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              View all registered users, manage their account status, and monitor activity from a single dashboard.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-dark/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-500 active:bg-red-700"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-white/10 shadow-md bg-white/5 p-5 transition-all transform hover:-translate-y-1 hover:border-red-light/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
              >
                <stat.icon size={19} />
              </div>
              <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-0.5 text-xs font-medium text-gray-300">
                {stat.change}
              </span>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-gray-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Additional Wallet Stats */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 shadow-md bg-white/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
              <Wallet size={19} />
            </div>
            <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-0.5 text-xs font-medium text-gray-300">
              Total Balance
            </span>
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-gray-500">
            Total Wallet Balance
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {formatWalletBalance(totalWalletBalance)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 shadow-md bg-white/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <UsersIcon size={19} />
            </div>
            <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-0.5 text-xs font-medium text-gray-300">
              {totalUsers > 0 ? ((usersWithBalance / totalUsers) * 100).toFixed(1) : 0}% of users
            </span>
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-gray-500">
            Users with Balance
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {usersWithBalance}
          </p>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "all"
                ? "bg-red-500/20 text-red-light border border-red-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "active"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Active ({activeUsers})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "inactive"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Inactive ({inactiveUsers})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-white/10 shadow-md bg-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 flex-col gap-1">
            <Loader2 className="h-8 w-8 animate-spin text-red-light" />
            <p className="text-white text-[12px]">getting all user.....</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 p-4 text-red-light m-4">
            <AlertCircle size={20} />
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search" : "No users registered yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-black/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Wallet Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-light font-semibold">
                          {user.username ? user.username.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.username || "N/A"}</p>
                          <p className="text-xs text-gray-500">ID: {user._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Mail size={12} />
                          <span className="truncate max-w-[150px]">{user.email || "No email"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Phone size={12} />
                          {user.phone || "No phone"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingWalletId === user._id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-gray-400">₦</span>
                          <input
                            type="number"
                            value={editWalletValue}
                            onChange={(e) => setEditWalletValue(e.target.value)}
                            className="w-24 rounded border border-emerald-500/30 bg-black/60 px-2 py-1 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            step="0.01"
                            min="0"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditWalletSave(user._id);
                            }}
                            disabled={walletUpdateLoading}
                            className="rounded p-1 text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            {walletUpdateLoading ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Save size={14} />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditWalletCancel();
                            }}
                            className="rounded p-1 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Wallet size={14} className="text-emerald-400/60" />
                          <span className={`text-sm font-medium ${
                            (user.walletBalance || 0) > 0 ? "text-emerald-400" : "text-gray-500"
                          }`}>
                            {formatWalletBalance(user.walletBalance)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditWalletStart(user);
                            }}
                            className="rounded p-0.5 text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors ml-1"
                            title="Edit balance"
                          >
                            <Edit size={12} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === "active" || user.isActive === true
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {user.status === "active" || user.isActive === true ? (
                          <CheckCircle size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        {user.status === "active" || user.isActive === true ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar size={12} />
                        {user.createdAt || user.created_at
                          ? new Date(user.createdAt || user.created_at).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-gray-500" />
                        <span className="text-xs text-gray-300 capitalize">
                          {user.role || "User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "active" || user.isActive === true ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeactivateUser(user._id);
                            }}
                            disabled={actionLoading === user._id}
                            className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-1.5 text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
                            title="Deactivate User"
                          >
                            {actionLoading === user._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <UserX size={14} />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateUser(user._id);
                            }}
                            disabled={actionLoading === user._id}
                            className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                            title="Activate User"
                          >
                            {actionLoading === user._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <UserCheck size={14} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/80 p-4 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-light text-2xl font-bold">
                  {selectedUser.username ? selectedUser.username.charAt(0).toUpperCase() : selectedUser.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.username || "N/A"}</h3>
                  <p className="text-sm text-gray-400">ID: {selectedUser._id}</p>
                </div>
              </div>

              {/* User Info Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Email Address</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Mail size={14} className="text-gray-500" />
                    <p className="text-sm text-white break-all">{selectedUser.email || "Not provided"}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone size={14} className="text-gray-500" />
                    <p className="text-sm text-white">{selectedUser.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Wallet Balance</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Wallet size={14} className="text-emerald-400" />
                    <p className={`text-sm font-semibold ${
                      (selectedUser.walletBalance || 0) > 0 ? "text-emerald-400" : "text-gray-400"
                    }`}>
                      {formatWalletBalance(selectedUser.walletBalance)}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Account Status</p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        selectedUser.status === "active" || selectedUser.isActive === true
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {selectedUser.status === "active" || selectedUser.isActive === true ? (
                        <CheckCircle size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {selectedUser.status === "active" || selectedUser.isActive === true ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">User Role</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield size={14} className="text-gray-500" />
                    <p className="text-sm text-white capitalize">{selectedUser.role || "User"}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Member Since</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Calendar size={14} className="text-gray-500" />
                    <p className="text-sm text-white">
                      {selectedUser.createdAt || selectedUser.created_at
                        ? new Date(selectedUser.createdAt || selectedUser.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={14} className="text-gray-500" />
                    <p className="text-sm text-white">
                      {selectedUser.updatedAt || selectedUser.updated_at
                        ? new Date(selectedUser.updatedAt || selectedUser.updated_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {(selectedUser.status === "active" || selectedUser.isActive === true) ? (
                  <button
                    onClick={() => {
                      handleDeactivateUser(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 rounded-lg bg-amber-500/20 py-2.5 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/30 border border-amber-500/20"
                  >
                    <UserX size={16} className="inline mr-2" />
                    Deactivate User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleActivateUser(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 rounded-lg bg-emerald-500/20 py-2.5 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/30 border border-emerald-500/20"
                  >
                    <UserCheck size={16} className="inline mr-2" />
                    Activate User
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Toasts */}
      {success && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-500/90 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-right-5">
          <CheckCircle size={16} />
          {success}
        </div>
      )}
      
      {error && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-right-5">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}