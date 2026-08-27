import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  Save,
  X,
  Tag,
  TrendingUp,
  Shield,
} from "lucide-react";
import { createLog, getLogs, updateLog, deleteLog } from "../../service/logs";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Updated form data to include category field
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    country: "",
    category: "",
    price: "",
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getLogs();
      console.log("Logs data response:", data);
      
      const logsArray = data?.logs || data?.data?.logs || [];
      console.log("Extracted logs array:", logsArray);
      setLogs(logsArray);
      setFilteredLogs(logsArray);
    } catch (error) {
      console.log("Fetch error:", error);
      setError(error?.response?.data?.message || error?.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLog = async () => {
    // Validation
    if (!formData.email) {
      setError("Please enter an email for the log");
      return;
    }
    if (!formData.password) {
      setError("Please enter a password for the log");
      return;
    }
    if (!formData.category) {
      setError("Please enter a category for the log");
      return;
    }
    if (!formData.price) {
      setError("Please enter a price for the log");
      return;
    }

    try {
      setActionLoading("create");
      setError("");
      setSuccess("");

      const payload = {
        email: formData.email,
        password: formData.password,
        country: formData.country || "Unknown",
        category: formData.category,
        price: parseFloat(formData.price) || 0,
      };

      console.log("Creating log with payload:", payload);
      
      const response = await createLog(payload);
      console.log("Create log response:", response);
      
      if (response?.success) {
        setSuccess("Log created successfully!");
        resetForm();
        setIsModalOpen(false);
        setTimeout(() => {
          fetchLogs();
        }, 500);
      } else {
        setError(response?.message || "Failed to create log");
      }
    } catch (error) {
      console.log("Create error:", error);
      console.log("Error response:", error?.response);
      console.log("Error data:", error?.response?.data);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to create log";
      setError(typeof errorMessage === "object" ? JSON.stringify(errorMessage) : errorMessage);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleUpdateLog = async () => {
    if (!selectedLog?._id && !selectedLog?.id) {
      setError("Invalid log ID");
      return;
    }

    try {
      setActionLoading("update");
      setError("");
      setSuccess("");

      const payload = {
        email: formData.email,
        password: formData.password,
        country: formData.country,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
      };

      console.log("Updating log with payload:", payload);
      
      await updateLog(selectedLog._id || selectedLog.id, payload);
      setSuccess("Log updated successfully!");
      resetForm();
      setIsModalOpen(false);
      setTimeout(() => {
        fetchLogs();
      }, 500);
    } catch (error) {
      console.log(error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update log";
      setError(typeof errorMessage === "object" ? JSON.stringify(errorMessage) : errorMessage);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleDeleteLog = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this log? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      await deleteLog(id);
      setSuccess("Log deleted successfully!");
      setTimeout(() => {
        fetchLogs();
      }, 500);
    } catch (error) {
      console.log(error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete log";
      setError(typeof errorMessage === "object" ? JSON.stringify(errorMessage) : errorMessage);
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalMode("create");
    setSelectedLog(null);
    setIsModalOpen(true);
  };

  const openEditModal = (log) => {
    setSelectedLog(log);
    setFormData({
      email: log.email || "",
      password: log.password || "",
      country: log.country || "",
      category: log.category || "",
      price: log.price || "",
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const openViewModal = (log) => {
    setSelectedLog(log);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      country: "",
      category: "",
      price: "",
    });
  };

  useEffect(() => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          (log.email &&
            log.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.country &&
            log.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (log.category &&
            log.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLogs(filtered);
  }, [searchTerm, logs]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const totalLogs = logs.length;
  const availableLogs = logs.filter((l) => !l.sold).length;
  const soldLogs = logs.filter((l) => l.sold).length;

  const stats = [
    {
      label: "Total Logs",
      value: totalLogs,
      change: "All time",
      icon: FileText,
      iconBg: "bg-red/15",
      iconColor: "text-red",
    },
    {
      label: "Available Logs",
      value: availableLogs,
      change: `${totalLogs > 0 ? ((availableLogs / totalLogs) * 100).toFixed(1) : 0}% available`,
      icon: TrendingUp,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
    },
    {
      label: "Sold Logs",
      value: soldLogs,
      change: `${totalLogs > 0 ? ((soldLogs / totalLogs) * 100).toFixed(1) : 0}% sold`,
      icon: FileText,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
    },
    {
      label: "Active Status",
      value: availableLogs,
      change: "Available for purchase",
      icon: CheckCircle,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-dark/40 via-black to-black p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-300">
              <Shield size={13} />
              Admin Logs Management
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Manage logs & data entries
              <br className="hidden sm:block" /> create, edit, and delete.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Full CRUD operations for logs. Create new logs, update existing
              ones, or remove outdated entries.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-dark px-5 text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-dark"
          >
            <Plus size={16} />
            Create New Log
          </button>
        </div>
      </section>

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
            <div className="mt-1 text-2xl font-bold tracking-tight text-white">
              {loading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-white/10"></div>
              ) : (
                stat.value
              )}
            </div>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs by email, country, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-red-bg-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-bg-red-light/50"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 shadow-md bg-white/5 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-1 flex-col py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-light" />
            <p className="text-white text-[12px]">Loading Logs....</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-red-light/10 p-4 text-red-400 m-4">
            <AlertCircle size={20} />
            <span>{typeof error === "string" ? error : JSON.stringify(error)}</span>
            <button
              onClick={fetchLogs}
              className="ml-2 rounded-lg bg-red-light/20 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-light/30"
            >
              Retry
            </button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-white mb-4" />
            <h3 className="text-lg font-semibold text-white">No logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search"
                : "Create your first log to get started"}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              <Plus size={16} className="inline mr-2" />
              Create New Log
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-black/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Password
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Country
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredLogs.map((log) => (
                  <tr
                    key={log._id || log.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-light/10 text-red-light">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {log.email || "No email"}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                            {log._id?.slice(-8) || "No ID"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-gray-300">
                        <Tag size={10} />
                        {log.password ? "••••••••" : "No password"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-gray-300">
                        {log.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-gray-300">
                        {log.country || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 text-sm font-semibold">
                          ₦
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {log.price || "0.00"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          !log.sold
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-light/20 text-red-light"
                        }`}
                      >
                        {!log.sold ? (
                          <CheckCircle size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        {!log.sold ? "Available" : "Sold"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar size={12} />
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openViewModal(log)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        {!log.sold && (
                          <>
                            <button
                              onClick={() => openEditModal(log)}
                              className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-1.5 text-blue-400 transition-colors hover:bg-blue-500/20"
                              title="Edit Log"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteLog(log._id || log.id)}
                              disabled={actionLoading === (log._id || log.id)}
                              className="rounded-lg border border-red-bg-red-light/20 bg-red-light/10 p-1.5 text-red-light transition-colors hover:bg-red-light/20 disabled:opacity-50"
                              title="Delete Log"
                            >
                              {actionLoading === (log._id || log.id) ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/80 p-4 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white">
                {modalMode === "create" && "Create New Log"}
                {modalMode === "edit" && "Edit Log"}
                {modalMode === "view" && "Log Details"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === "view" && selectedLog ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-light/10 text-red-400">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {selectedLog.email || "Log Details"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        ID: {selectedLog._id || selectedLog.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-white mt-1 break-all">
                        {selectedLog.email || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-gray-500">Password</p>
                      <p className="text-sm text-white mt-1 font-mono">
                        {selectedLog.password || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm text-white mt-1">
                        {selectedLog.category || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-gray-500">Country</p>
                      <p className="text-sm text-white mt-1">
                        {selectedLog.country || "N/A"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm text-white mt-1">
                        ₦{selectedLog.price || "0.00"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-gray-500">Status</p>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            !selectedLog.sold
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-light/20 text-red-400"
                          }`}
                        >
                          {!selectedLog.sold ? (
                            <CheckCircle size={10} />
                          ) : (
                            <XCircle size={10} />
                          )}
                          {!selectedLog.sold ? "Available" : "Sold"}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="text-sm text-white mt-1">
                        {selectedLog.createdAt
                          ? new Date(selectedLog.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {!selectedLog.sold && (
                      <button
                        onClick={() => openEditModal(selectedLog)}
                        className="flex-1 rounded-lg bg-blue-500/20 py-2.5 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/30 border border-blue-500/20"
                      >
                        <Edit size={16} className="inline mr-2" />
                        Edit Log
                      </button>
                    )}
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-bg-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-bg-red-light/50"
                        placeholder="user@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Password *
                      </label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-bg-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-bg-red-light/50"
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-bg-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-bg-red-light/50"
                        placeholder="e.g., Social Media, Gaming, Finance"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-bg-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-bg-red-light/50"
                        placeholder="e.g., United States, Nigeria"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">
                        Price (₦) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-bg-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-bg-red-light/50"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={
                        modalMode === "create"
                          ? handleCreateLog
                          : handleUpdateLog
                      }
                      disabled={
                        actionLoading === "create" || actionLoading === "update"
                      }
                      className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-light disabled:opacity-50"
                    >
                      {actionLoading === "create" ||
                      actionLoading === "update" ? (
                        <Loader2 size={16} className="mx-auto animate-spin" />
                      ) : (
                        <>
                          <Save size={16} className="inline mr-2" />
                          {modalMode === "create"
                            ? "Create Log"
                            : "Save Changes"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-emerald-500/90 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-right-5">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-red-light/90 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-right-5">
          <AlertCircle size={16} />
          {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}
    </div>
  );
}