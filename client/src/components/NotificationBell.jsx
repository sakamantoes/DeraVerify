// components/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  Loader2,
  Mail,
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useNotifications } from '../service/notificationApi.js';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAllNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success':
        return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'error':
        return <XCircle size={16} className="text-red-light" />;
      case 'warning':
        return <AlertCircle size={16} className="text-amber-400" />;
      case 'info':
        return <Info size={16} className="text-blue-400" />;
      default:
        return <Mail size={16} className="text-gray-400" />;
    }
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    if (showAllNotifications) {
      fetchNotifications(); // Refresh if in full view
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    if (showAllNotifications) {
      fetchNotifications(); // Refresh if in full view
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(id);
    }
  };

  const handleBellClick = () => {
    if (showAllNotifications) {
      setShowAllNotifications(false);
    }
    setIsOpen(!isOpen);
  };

  const handleViewAll = () => {
    setShowAllNotifications(true);
  };

  const handleBack = () => {
    setShowAllNotifications(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative rounded-lg p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-light text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-[-45px] mt-2 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900 to-black shadow-2xl backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-4 py-3">
              <div className="flex items-center gap-2">
                {showAllNotifications ? (
                  <button
                    onClick={handleBack}
                    className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                ) : (
                  <Bell size={16} className="text-red-light" />
                )}
                <h3 className="text-sm font-semibold text-white">
                  {showAllNotifications ? "All Notifications" : "Notifications"}
                </h3>
                {unreadCount > 0 && !showAllNotifications && (
                  <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-light">
                    {unreadCount} new
                  </span>
                )}
                {showAllNotifications && unreadCount > 0 && (
                  <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-light">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List with animated height */}
            <div 
              className={`transition-all duration-500 ease-in-out overflow-y-auto ${
                showAllNotifications 
                  ? 'max-h-[600px] opacity-100' 
                  : 'max-h-[400px] opacity-100'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-red-light" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                  <Bell size={32} className="text-gray-600 mb-2" />
                  <p className="text-sm text-gray-500">No notifications</p>
                  <p className="text-xs text-gray-600 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification._id}
                      className={`group relative px-4 py-3 transition-all duration-300 hover:bg-white/5 ${
                        !notification.read ? 'bg-red-500/5' : ''
                      } animate-in slide-in-from-left fade-in`}
                      style={{ 
                        animationDelay: showAllNotifications ? `${index * 50}ms` : '0ms',
                        animationDuration: '300ms'
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'text-white' : 'text-gray-300'
                            }`}>
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => handleDelete(notification._id)}
                              className="opacity-0 transition-opacity group-hover:opacity-100 rounded p-0.5 text-gray-500 hover:text-red-light"
                              aria-label="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="mt-1.5 flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-gray-600">
                              <Clock size={10} />
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="text-[10px] font-medium text-red-light hover:text-red-300 transition-colors"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-white/10 bg-black/30 px-4 py-2 text-center transition-all duration-300">
                {!showAllNotifications ? (
                  <button
                    onClick={handleViewAll}
                    className="text-xs text-gray-500 transition-colors hover:text-gray-300"
                  >
                    View all notifications ({notifications.length})
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Total: {notifications.length}</span>
                    <span>Unread: {unreadCount}</span>
                    <button
                      onClick={handleBack}
                      className="text-red-light hover:text-red-300 transition-colors"
                    >
                      Show less
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;