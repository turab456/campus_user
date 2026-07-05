import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, CheckCheck, MessageSquare, ShieldAlert, AlertTriangle, Ban, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendApi as api } from '../services/backendApi';
import { useAuth } from '../context/AuthContext';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedListing?: string;
  relatedChat?: string;
  createdAt: string;
}

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await api.getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // Silently fail
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(1, 15);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read
    if (!notif.read) {
      try {
        await api.markNotificationRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch {
        // Silently fail
      }
    }

    // Navigate based on type
    setIsOpen(false);
    
    const isSaleEvent = ['sale_pending', 'sale_confirmed', 'sale_denied', 'sale_canceled'].includes(notif.type);

    if (notif.type === 'new_message' && notif.relatedChat) {
      navigate('/messages', { state: { activeChatId: notif.relatedChat } });
    } else if (isSaleEvent) {
      if (notif.relatedChat) {
        navigate('/messages', { state: { activeChatId: notif.relatedChat } });
      } else {
        navigate('/messages');
      }
    } else if (notif.relatedListing) {
      navigate(`/book/${notif.relatedListing}`);
    } else {
      navigate('/home');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'sale_pending': return <Package className="w-4 h-4 text-amber-500" />;
      case 'sale_confirmed': return <Check className="w-4 h-4 text-green-500" />;
      case 'sale_denied': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'sale_canceled': return <X className="w-4 h-4 text-slate-500" />;
      case 'fraud_warning': return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'listing_flagged': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'moderation_block': return <Ban className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-full text-muted hover:text-textDark hover:bg-[#F5F3EF] transition-colors focus:outline-none focus:ring-2 focus:ring-primary/25"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-10 md:hidden bg-black/20" onClick={() => setIsOpen(false)} />
          
          <div className="fixed left-4 right-4 top-[60px] md:absolute md:left-auto md:right-0 md:top-auto md:mt-2 md:w-96 bg-white border border-borderCustom rounded-xl shadow-premium z-20 overflow-hidden max-h-[480px] flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-borderCustom flex items-center justify-between bg-[#FAF8F5]">
              <h3 className="text-sm font-bold text-textDark">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {user?.blocked && (
                <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-start gap-2.5">
                  <Ban className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-[11px] text-red-800 leading-snug font-medium">
                    Your account is blocked due to suspicious activity. Please raise a ticket for reconsideration in the profile section.
                  </div>
                </div>
              )}
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-muted">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left px-4 py-3 border-b border-borderCustom/50 hover:bg-[#FAF8F5] transition-colors flex items-start gap-3 ${
                      !notif.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-textDark' : 'text-muted'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted leading-snug mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
