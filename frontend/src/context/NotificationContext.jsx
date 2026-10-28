import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getUnreadCount();
      if (res.data?.success) {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('[Notification Count Error]', err);
    }
  }, [user]);

  const fetchNotifications = useCallback(
    async (page = 1) => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await notificationAPI.getNotifications({ page, limit: 15 });
        if (res.data?.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        }
      } catch (err) {
        console.error('[Fetch Notifications Error]', err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('[Mark As Read Error]', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[Mark All As Read Error]', err);
    }
  };

  // Poll notification count periodically when user is logged in
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
