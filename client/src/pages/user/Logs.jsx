import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ShoppingBag,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
  DollarSign,
  Wallet,
  ChevronRight,
  Tag,
  Grid3x3,
  List,
} from "lucide-react";
import {
  getLogs,
  buyLog,
  getUserPurchasedApi,
  getLogById,
} from "../../service/logs";
import WalletBalanceCard from "../../components/WalletBalanceCard.jsx";

const Logs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // ================= FETCH ALL LOGS =================
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getLogs();
      console.log("Logs data:", data);
      const logsArray = data.logs || data.data || [];
      setLogs(logsArray);
      setFilteredLogs(logsArray);
      
      // Extract unique categories from logs
      const uniqueCats = [...new Set(logsArray.map(log => log.category).filter(Boolean))];
      setCategories(uniqueCats);
    } catch (error) {
      console.log(error);
      setError("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH LOGS BY CATEGORY (LOCAL FILTERING) =================
  const fetchLogsByCategory = (category) => {
    setSelectedCategory(category);
    
    let filtered;
    if (category === "all") {
      filtered = logs;
    } else {
      filtered = logs.filter(log => log.category === category);
    }
    
    setFilteredLogs(filtered);
  };

  // ================= FETCH PURCHASE HISTORY =================
  const fetchPurchaseHistory = async () => {
    try {
      const data = await getUserPurchasedApi();
      console.log("Purchase history data:", data);
      setPurchaseHistory(data.data || data.purchases || []);
    } catch (error) {
      console.log(error);
      setPurchaseHistory([]);
    }
  };

  // ================= BUY LOG =================
  const handleBuyLog = async (id, price) => {
    if (!id) {
      setError("Invalid log selected");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to purchase this log for ₦${price}?`,
      )
    ) {
      return;
    }

    try {
      setBuyingId(id);
      setError("");
      setSuccess("");

      const res = await buyLog(id);
      console.log("Purchase response:", res);

      setSuccess("Log purchased successfully!");

      // Refresh data
      await fetchLogs();
      await fetchPurchaseHistory();
      
      // Keep the current category filter
      fetchLogsByCategory(selectedCategory);

      setTimeout(() => {
        setSuccess("");
        setSelectedLog(null);
      }, 2000);
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to purchase log");
    } finally {
      setBuyingId(null);
    }
  };

  // ================= VIEW LOG DETAILS =================
  const handleViewDetails = async (id) => {
    if (!id) {
      setError("Invalid log ID");
      return;
    }

    try {
      setLoading(true);
      const data = await getLogById(id);
      console.log("Log details:", data);
      setSelectedLog(data.data || data.log);
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to load log details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchPurchaseHistory();
  }, []);

  // Filter logs by search term
  useEffect(() => {
    if (searchTerm === "") {
      // Reset to category-filtered logs
      fetchLogsByCategory(selectedCategory);
      return;
    }
    
    const searched = logs.filter((log) => {
      // First check if log matches selected category
      if (selectedCategory !== "all" && log.category !== selectedCategory) {
        return false;
      }
      
      // Then check search term
      const matchesSearch =
        (log.email &&
          log.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.country &&
          log.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.category &&
          log.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
    
    setFilteredLogs(searched);
  }, [searchTerm, logs, selectedCategory]);

  const totalLogs = logs.length;
  const purchasedCount = purchaseHistory.length;
  const totalSpent = purchaseHistory.reduce(
    (sum, item) => sum + (item.price || 0),
    0,
  );

  const stats = [
    {
      label: "Available Logs",
      value: filteredLogs.length,
      change: "Ready to purchase",
      icon: FileText,
      iconBg: "bg-red/15",
      iconColor: "text-red",
    },
    {
      label: "Total Categories",
      value: categories.length,
      change: "Available types",
      icon: Tag,
      iconBg: "bg-purple-500/15",
      iconColor: "text-purple-400",
    },
    {
      label: "Purchased Logs",
      value: purchasedCount,
      change: "In your collection",
      icon: ShoppingBag,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-400",
    },
    {
      label: "Total Spent",
      value: `₦${totalSpent.toFixed(2)}`,
      change: "All time",
      icon: DollarSign,
      iconBg: "bg-blue-500/15",
      iconColor: "text-blue-400",
    },
  ];

  // Get unique categories from logs for display
  const uniqueCategories = [...new Set(logs.map(log => log.category).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-300">
              <FileText size={13} />
              Logs Marketplace
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Browse and purchase
              <br className="hidden sm:block" /> premium logs & data.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Access verified logs, user data, and activity records. Filter by
              category to find exactly what you need.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/f/fund-account", { state: { from: "/f/dashboard" } })
            }
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-dark/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-light active:bg-red-700"
          >
            <Wallet size={16} />
            Fund Wallet
          </button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <WalletBalanceCard statusText="Available" />
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
              <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium bg-white/8 text-gray-300 border-white/10">
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("available")}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${
            activeTab === "available"
              ? "text-red-light border-b-2 border-red-light"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Available Logs
          {filteredLogs.length > 0 && activeTab !== "available" && (
            <span className="ml-2 rounded-full bg-red-light/20 px-1.5 py-0.5 text-xs text-red-light">
              {filteredLogs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-sm font-medium transition-all relative ${
            activeTab === "history"
              ? "text-red-light border-b-2 border-red-light"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          Purchase History
          {purchasedCount > 0 && activeTab !== "history" && (
            <span className="ml-2 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-xs text-emerald-400">
              {purchasedCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "available" && (
        <>
          {/* TWO CONTAINER LAYOUT */}
          <div className="grid gap-6 lg:grid-cols-4">
            {/* CONTAINER 1: Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-xl border border-white/10 shadow-md bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <Tag size={18} className="text-red-light" />
                  <h3 className="font-semibold text-white">Filter by Category</h3>
                </div>
                
                <div className="space-y-2">
                  {/* All Categories Button */}
                  <button
                    onClick={() => fetchLogsByCategory("all")}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      selectedCategory === "all"
                        ? "bg-red-light/20 text-white border border-red-light/30"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Grid3x3 size={14} />
                      <span>All Categories</span>
                    </div>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      {logs.length}
                    </span>
                  </button>

                  {/* Category Buttons */}
                  {uniqueCategories.length > 0 ? (
                    uniqueCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => fetchLogsByCategory(category)}
                        className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                          selectedCategory === category
                            ? "bg-red-light/20 text-white border border-red-light/30"
                            : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Tag size={14} />
                          <span className="truncate">{category}</span>
                        </div>
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                          {logs.filter(log => log.category === category).length}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No categories available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CONTAINER 2: Logs Grid */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search logs by email, country, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-white placeholder:text-gray-500 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                  />
                </div>
              </div>

              {/* Active Category Indicator */}
              {selectedCategory !== "all" && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-light/10 px-3 py-2 text-sm text-red-light border border-red-light/20">
                  <Tag size={14} />
                  <span>Showing logs in category: <strong>{selectedCategory}</strong></span>
                  <button
                    onClick={() => fetchLogsByCategory("all")}
                    className="ml-auto text-xs bg-red-light/20 px-2 py-1 rounded hover:bg-red-light/30 transition-colors"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Logs Grid Content */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-red-light" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-red-light/10 p-4 text-red-light">
                  <AlertCircle size={20} />
                  {error}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white">
                    No logs available
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? "Try adjusting your search or filter"
                      : selectedCategory !== "all"
                      ? `No logs found in "${selectedCategory}" category`
                      : "Check back later for new logs"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log._id}
                      className="group rounded-xl border border-white/10 shadow-md bg-white/5 p-5 transition-all transform hover:-translate-y-1 hover:border-red-light/40 hover:bg-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-light/10 text-red-light">
                            <FileText size={18} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white truncate max-w-[150px]">
                              {log.email || "No email"}
                            </h3>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Tag size={10} />
                              {log.category || "General"}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          {log.country || "N/A"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 text-sm">₦</span>
                          <span className="text-lg font-bold text-white">
                            {log.price || "0.00"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(log._id)}
                            className="rounded-lg border border-white/10 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleBuyLog(log._id, log.price)}
                            disabled={buyingId === log._id}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-dark px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-red-light disabled:opacity-50"
                          >
                            {buyingId === log._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <ShoppingBag size={12} />
                            )}
                            Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Purchase History */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {purchaseHistory.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white">
                No purchase history
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't purchased any logs yet
              </p>
              <button
                onClick={() => setActiveTab("available")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-light"
              >
                Browse Logs
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 shadow-md bg-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-white/10 bg-black/20">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Log
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Purchase Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {purchaseHistory.map((purchase) => (
                      <tr
                        key={purchase._id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {purchase.email || "Log"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {purchase.country || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-gray-300">
                            <Tag size={10} />
                            {purchase.category || "General"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(
                            purchase.createdAt || purchase.purchasedAt,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-emerald-400">
                            ₦{purchase.price}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                            <CheckCircle2 size={10} />
                            Completed
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewDetails(purchase._id)}
                            className="rounded-lg border border-white/10 p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/80 p-4 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white">Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-light/10 text-red-light">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedLog.email || "Log Details"}
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <Tag size={12} />
                    {selectedLog.category || "General"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Country:</strong>
                  </p>
                  <p className="text-sm text-white">
                    {selectedLog.country || "Not specified"}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Password:</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono">
                      {showPassword ? (
                        <span className="text-yellow-400">
                          {selectedLog.password || "Not available"}
                        </span>
                      ) : (
                        <span className="text-gray-500">••••••••</span>
                      )}
                    </p>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                          <line x1="2" y1="2" x2="22" y2="22"></line>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (selectedLog.password) {
                          navigator.clipboard.writeText(selectedLog.password);
                          setSuccess("Password copied to clipboard!");
                          setTimeout(() => setSuccess(""), 2000);
                        }
                      }}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                      title="Copy password"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-lg font-bold text-white">
                    ₦{selectedLog.price || "0.00"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-white capitalize">
                    {selectedLog.sold ? "Sold" : "Available"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium text-white">
                    {selectedLog.category || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(selectedLog.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {!selectedLog.sold && (
                  <button
                    onClick={() => {
                      handleBuyLog(selectedLog._id, selectedLog.price);
                      setSelectedLog(null);
                    }}
                    disabled={buyingId === selectedLog._id}
                    className="flex-1 rounded-lg bg-red-dark py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-light disabled:opacity-50"
                  >
                    {buyingId === selectedLog._id ? (
                      <Loader2 size={16} className="mx-auto animate-spin" />
                    ) : (
                      `Purchase ₦${selectedLog.price}`
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedLog(null)}
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
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-red-light/90 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in slide-in-from-right-5">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default Logs;