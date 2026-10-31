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
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

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

    const conversationId = notif.relatedConversation?._id || notif.relatedConversation;

    // 1. Message, contact request, or claim with chat -> Navigate directly to Messages tab
    if (
      conversationId ||
      notif.type === 'new_message' ||
      notif.type === 'contact_request' ||
      notif.type === 'new_claim'
    ) {
      navigate('/conversations', {
        state: {
          conversationId: conversationId || undefined,
          itemId: notif.relatedItem?._id || notif.relatedItem || undefined,
        },
      });
      return;
    }

    // 2. Claim status reviews (admin approvals/rejections without conversation)
    if (notif.relatedClaim || notif.type === 'claim_status') {
      const claimId = notif.relatedClaim?._id || notif.relatedClaim;
      navigate(`/claims/${claimId}`);
      return;
    }

    // 3. Item matches or reports
    if (notif.relatedItem) {
      const itemId = notif.relatedItem?._id || notif.relatedItem;
      navigate(`/items/${itemId}`);
      return;
    }

    navigate('/notifications');
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkSingleAsRead = async (e, notifId) => {
    e.stopPropagation();
    await markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getNotificationIcon = (type, isUnread) => {
    switch (type) {
      case 'potential_match':
        return <Sparkles className={`w-5 h-5 ${isUnread ? 'text-teal-600' : 'text-slate-400'}`} />;
      case 'new_claim':
      case 'claim_status':
        return <ShieldCheck className={`w-5 h-5 ${isUnread ? 'text-emerald-600' : 'text-slate-400'}`} />;
      case 'new_message':
      case 'contact_request':
        return <MessageSquare className={`w-5 h-5 ${isUnread ? 'text-blue-600' : 'text-slate-400'}`} />;
      default:
        return <FileText className={`w-5 h-5 ${isUnread ? 'text-blue-600' : 'text-slate-400'}`} />;
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const readCount = Math.max(0, notifications.length - unreadCount);

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
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
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
            className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition shadow-xs"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>All Notifications</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            filter === 'all' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            filter === 'unread'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Unseen</span>
          {unreadCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              filter === 'unread' ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('read')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
            filter === 'read'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Seen</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            filter === 'read' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {readCount}
          </span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" message="Loading notifications..." />
      ) : filteredNotifications.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.isRead;
            return (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 sm:p-5 cursor-pointer transition flex items-start space-x-3 sm:space-x-4 border-l-4 ${
                  isUnread
                    ? 'bg-blue-50/60 hover:bg-blue-100/50 border-l-blue-600'
                    : 'bg-white hover:bg-slate-50 border-l-transparent'
                }`}
              >
                {/* Icon Box */}
                <div
                  className={`p-2.5 rounded-2xl flex-shrink-0 transition ${
                    isUnread
                      ? 'bg-white border border-blue-200 shadow-xs ring-2 ring-blue-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {getNotificationIcon(notif.type, isUnread)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      {isUnread && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-100 flex-shrink-0 animate-pulse"
                          title="Unseen notification"
                        />
                      )}
                      <h4
                        className={`text-sm truncate ${
                          isUnread
                            ? 'font-black text-slate-900 tracking-tight'
                            : 'font-semibold text-slate-600'
                        }`}
                      >
                        {notif.title}
                      </h4>
                      {isUnread ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-2xs flex-shrink-0">
                          Unseen
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-slate-100 text-slate-400 flex-shrink-0">
                          Seen
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] whitespace-nowrap ml-2 flex items-center flex-shrink-0 ${
                        isUnread ? 'text-blue-700 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>

                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isUnread
                        ? 'text-slate-800 font-medium'
                        : 'text-slate-400 font-normal'
                    }`}
                  >
                    {notif.message}
                  </p>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 self-center flex-shrink-0">
                  {isUnread && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkSingleAsRead(e, notif._id)}
                      title="Mark as seen"
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100/70 rounded-lg transition"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <div className={`transition ${isUnread ? 'text-blue-600' : 'text-slate-300'}`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
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
