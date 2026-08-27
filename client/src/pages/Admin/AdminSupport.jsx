import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Eye,
  Reply,
  XCircle,
  Filter,
  Users,
} from "lucide-react";
import {
  getAllSupportMessages,
  getAdminSupportMessageById,
  adminReplyToMessage,
  updateSupportStatus,
  deleteSupportMessage,
  getUnreadSupportCount,
} from '../../service/supportApi.js';

const AdminSupport = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: 20 };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const data = await getAllSupportMessages(params);
      setMessages(data.data || []);
      setPagination({
        page: data.page,
        total: data.total,
        pages: data.pages,
      });
    } catch (error) {
      console.log(error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadSupportCount();
      setUnreadCount(data.data?.unread || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewMessage = async (id) => {
    try {
      setLoading(true);
      const data = await getAdminSupportMessageById(id);
      setSelectedMessage(data.data);
      await fetchUnreadCount();
      await fetchMessages();
    } catch (error) {
      setError("Failed to load message details");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (id) => {
    if (!replyText) {
      setError("Please enter a reply");
      return;
    }

    try {
      setLoading(true);
      await adminReplyToMessage(id, replyText);
      setSuccess("Reply sent successfully!");
      setReplyText("");
      await handleViewMessage(id);
      await fetchMessages();
      await fetchUnreadCount();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to send reply");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setLoading(true);
      await updateSupportStatus(id, status);
      setSuccess(`Status updated to ${status}`);
      await handleViewMessage(id);
      await fetchMessages();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to update status");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteSupportMessage(id);
      setSuccess("Message deleted successfully!");
      setSelectedMessage(null);
      await fetchMessages();
      await fetchUnreadCount();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to delete message");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle size={14} className="text-emerald-400" />;
      case "replied":
        return <Reply size={14} className="text-blue-400" />;
      default:
        return <Clock size={14} className="text-amber-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/20",
      replied: "bg-blue-500/20 text-blue-400 border-blue-500/20",
      resolved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    };
    return `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${styles[status]}`;
  };

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, [pagination.page, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-300">
              <MessageSquare size={13} />
              Admin Support Panel
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Manage customer support tickets
              <br className="hidden sm:block" /> respond and resolve issues.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              View all support tickets, respond to customer inquiries, and track resolution status.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
              <Users size={16} className="text-red-400" />
              <span className="text-sm font-semibold text-white">
                {unreadCount} Unread
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-500">Total Tickets</p>
          <p className="text-2xl font-bold text-white">{pagination.total}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-amber-400">
            {messages.filter(m => m.status === "pending").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-500">Replied</p>
          <p className="text-2xl font-bold text-blue-400">
            {messages.filter(m => m.status === "replied").length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-gray-500">Resolved</p>
          <p className="text-2xl font-bold text-emerald-400">
            {messages.filter(m => m.status === "resolved").length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "all"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "pending"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("replied")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "replied"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Replied
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "resolved"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            }`}
          >
            Resolved
          </button>
          <button
            onClick={fetchMessages}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="border-b border-white/10 px-4 py-3 bg-black/30">
              <h2 className="text-sm font-semibold text-white">Support Tickets</h2>
            </div>
            <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-red-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">No support tickets</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => handleViewMessage(message._id)}
                    className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                      selectedMessage?._id === message._id ? "bg-red-500/10 border-l-2 border-red-500" : ""
                    } ${!message.isReadByAdmin ? "bg-red-500/5" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-white truncate">{message.subject}</h3>
                          {!message.isReadByAdmin && (
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{message.userName}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {message.message.substring(0, 60)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={getStatusBadge(message.status)}>
                            {getStatusIcon(message.status)}
                            {message.status}
                          </span>
                          <span className="text-[10px] text-gray-600">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="border-b border-white/10 px-4 py-3 bg-black/30 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Ticket Details</h2>
                <div className="flex gap-2">
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => handleUpdateStatus(selectedMessage._id, e.target.value)}
                    className="rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                {/* User Info */}
                <div className="rounded-lg border border-white/10 bg-black/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-gray-500" />
                    <span className="text-xs text-gray-500">Customer Info</span>
                  </div>
                  <p className="text-sm text-white">Name: {selectedMessage.userName}</p>
                  <p className="text-sm text-gray-400">Email: {selectedMessage.userEmail}</p>
                </div>

                {/* User Message */}
                <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                        <MessageSquare size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{selectedMessage.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(selectedMessage.status)}>
                      {getStatusIcon(selectedMessage.status)}
                      {selectedMessage.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Admin Reply */}
                {selectedMessage.adminReply && (
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                        <Reply size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Admin Reply</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedMessage.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">
                      {selectedMessage.adminReply}
                    </p>
                  </div>
                )}

                {/* Send Reply */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-500">
                    Send Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                    placeholder="Type your reply here..."
                  />
                  <button
                    onClick={() => handleSendReply(selectedMessage._id)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-light disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white">Select a Ticket</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a ticket from the list to view and respond
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
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
};

export default AdminSupport;