import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  MessageSquare,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { notificationAPI } from '../services/api';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatTimeAgo } from '../utils/formatters';

const NotificationsPage = () => {
  const { markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPage = async (page = 1) => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications({ page, limit: 12 });
      if (res.data?.success) {
        setNotifications(res.data.notifications);
        setTotalPages(res.data.totalPages);
        setUnreadCount(res.data.unreadCount);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('[Fetch Notifications Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    if (notif.relatedItem) {
      navigate(`/items/${notif.relatedItem._id || notif.relatedItem}`);
    } else if (notif.relatedClaim) {
      navigate(`/claims/${notif.relatedClaim._id || notif.relatedClaim}`);
    } else if (notif.relatedConversation) {
      navigate(`/conversations`);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'potential_match':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'new_claim':
      case 'claim_status':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'new_message':
      case 'contact_request':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay updated with claim decisions, candidate matches, and safe handover reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAll}
            className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading notifications..." />
      ) : notifications.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-5 cursor-pointer transition hover:bg-slate-50 flex items-start space-x-4 ${
                !notif.isRead ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-slate-100 flex-shrink-0">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{notif.title}</h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(notif.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
              </div>

              <div className="text-slate-300 self-center">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications at this time"
          description="We'll notify you whenever there are new matches for your reports or updates on your ownership claims."
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchPage(page)}
      />
    </div>
  );
};

export default NotificationsPage;
