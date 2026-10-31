import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink, Clock } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatTimeAgo } from '../utils/formatters';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { unreadCount, notifications, markAsRead, markAllAsRead, fetchNotifications } =
    useNotifications();
  const navigate = useNavigate();

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    setIsOpen(false);

    const conversationId =
      notification.relatedConversation?._id || notification.relatedConversation;

    // 1. Message, contact request, or claim with chat -> Navigate directly to Messages tab
    if (
      conversationId ||
      notification.type === 'new_message' ||
      notification.type === 'contact_request' ||
      notification.type === 'new_claim'
    ) {
      navigate('/conversations', {
        state: {
          conversationId: conversationId || undefined,
          itemId: notification.relatedItem?._id || notification.relatedItem || undefined,
        },
      });
      return;
    }

    // 2. Claim status reviews (admin approvals/rejections)
    if (notification.relatedClaim || notification.type === 'claim_status') {
      const claimId = notification.relatedClaim?._id || notification.relatedClaim;
      navigate(`/claims/${claimId}`);
      return;
    }

    // 3. Item matches or reports
    if (notification.relatedItem) {
      const itemId = notification.relatedItem?._id || notification.relatedItem;
      navigate(`/items/${itemId}`);
      return;
    }

    navigate('/notifications');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-600 rounded-full px-1 shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:right-0 mt-2 w-[calc(100vw-36px)] sm:w-96 max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="font-black text-slate-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
            {notifications && notifications.length > 0 ? (
              notifications.map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 sm:p-4 cursor-pointer transition flex items-start space-x-3 border-l-4 ${
                      isUnread
                        ? 'bg-blue-50/70 hover:bg-blue-100/60 border-l-blue-600'
                        : 'bg-white hover:bg-slate-50 border-l-transparent'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        isUnread ? 'bg-blue-600 ring-2 ring-blue-200 animate-pulse' : 'bg-slate-200'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs line-clamp-1 ${
                            isUnread ? 'font-black text-slate-900' : 'font-semibold text-slate-600'
                          }`}
                        >
                          {notif.title}
                        </p>
                        {isUnread && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 flex-shrink-0">
                            New
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs line-clamp-2 mt-0.5 ${
                          isUnread ? 'text-slate-700 font-medium' : 'text-slate-400 font-normal'
                        }`}
                      >
                        {notif.message}
                      </p>
                      <span
                        className={`text-[10px] mt-1 flex items-center ${
                          isUnread ? 'text-blue-700 font-bold' : 'text-slate-400'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                You're all caught up! No notifications.
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 block py-1"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
