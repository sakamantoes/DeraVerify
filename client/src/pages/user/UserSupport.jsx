import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  XCircle,
} from "lucide-react";
import {
  createSupportMessage,
  getUserSupportMessages,
  getSupportMessageById,
  addUserReply,
  deleteUserSupportMessage,
} from "../../service/supportApi";

const UserSupport = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getUserSupportMessages();
      setMessages(data.data || []);
    } catch (error) {
      console.log(error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    if (!subject || !messageText) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await createSupportMessage({ subject, message: messageText });
      setSuccess("Message sent successfully!");
      setSubject("");
      setMessageText("");
      setShowCreateForm(false);
      await fetchMessages();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to send message");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (id) => {
    try {
      setLoading(true);
      const data = await getSupportMessageById(id);
      setSelectedMessage(data.data);
    } catch (error) {
      setError("Failed to load message details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (id) => {
    if (!replyText) {
      setError("Please enter a reply");
      return;
    }

    try {
      setLoading(true);
      await addUserReply(id, replyText);
      setSuccess("Reply added successfully!");
      setReplyText("");
      await handleViewMessage(id);
      await fetchMessages();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to add reply");
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
      await deleteUserSupportMessage(id);
      setSuccess("Message deleted successfully!");
      setSelectedMessage(null);
      await fetchMessages();
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

  const getStatusText = (status) => {
    switch (status) {
      case "resolved":
        return "Resolved";
      case "replied":
        return "Replied";
      default:
        return "Pending";
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-md bg-gradient-to-br from-red-950/40 via-black to-black p-6 text-white sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-red-dark/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-light/40 bg-red-light/10 px-3 py-1 text-xs font-semibold text-red-300">
              <MessageSquare size={13} />
              Support Center
            </div>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Get help from our support team
              <br className="hidden sm:block" /> we're here for you 24/7.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Have a question or issue? Send us a message and our support team will get back to you as soon as possible.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-light"
          >
            <MessageSquare size={16} />
            New Support Ticket
          </button>
        </div>
      </section>

      {/* Create Ticket Form */}
      {showCreateForm && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Create New Support Ticket</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-white/10"
            >
              <XCircle size={20} />
            </button>
          </div>
          <form onSubmit={handleCreateMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                placeholder="Brief summary of your issue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Message *
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                placeholder="Describe your issue in detail..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-light disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send Message
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="border-b border-white/10 px-4 py-3 bg-black/30">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">My Tickets</h2>
                <button
                  onClick={fetchMessages}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-white/10 max-h-[500px] overflow-y-auto">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-red-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={32} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">No support tickets</p>
                  <p className="text-xs text-gray-600 mt-1">Create a ticket to get help</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => handleViewMessage(message._id)}
                    className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                      selectedMessage?._id === message._id ? "bg-red-500/10 border-l-2 border-red-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{message.subject}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {message.message.substring(0, 80)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(message.status)}
                            <span className="text-[10px] text-gray-500">{getStatusText(message.status)}</span>
                          </div>
                          <span className="text-[10px] text-gray-600">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {message.adminReply && (
                        <div className="ml-2">
                          <Reply size={12} className="text-blue-400" />
                        </div>
                      )}
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
                <button
                  onClick={() => handleDeleteMessage(selectedMessage._id)}
                  className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                {/* User Message */}
                <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                        <MessageSquare size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">You</p>
                        <p className="text-xs text-gray-500">
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedMessage.status)}
                      <span className="text-xs text-gray-500">{getStatusText(selectedMessage.status)}</span>
                    </div>
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
                        <p className="text-sm font-medium text-white">Support Team</p>
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

                {/* Add Reply */}
                {selectedMessage.status !== "resolved" && (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:border-red-light/50 focus:outline-none focus:ring-1 focus:ring-red-light/50"
                      placeholder="Type your reply here..."
                    />
                    <button
                      onClick={() => handleAddReply(selectedMessage._id)}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-light disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      Send Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white">Select a Ticket</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a ticket from the list to view details
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

export default UserSupport;