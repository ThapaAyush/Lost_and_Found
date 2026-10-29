import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const ADMIN_EMAIL = 'ayush108ayush108@gmail.com';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyAdminStatus = (userData) => {
    if (!userData) return false;
    const isEmailValid = userData.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const isRoleAdmin = userData.role === 'admin';
    return isEmailValid && isRoleAdmin;
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data?.success && verifyAdminStatus(res.data?.user)) {
          setAdminUser(res.data.user);
        } else {
          setAdminUser(null);
        }
      } catch (err) {
        setAdminUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    if (email?.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        message: `Access denied. Only the designated administrator (${ADMIN_EMAIL}) is authorized to access this portal.`,
      };
    }

    try {
      const res = await authAPI.login({ email: email.trim(), password });
      const user = res.data?.user;

      if (!verifyAdminStatus(user)) {
        await authAPI.logout();
        setAdminUser(null);
        return {
          success: false,
          message: 'Access restricted: Account does not possess administrator clearance.',
        };
      }

      setAdminUser(user);
      return { success: true, user };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Invalid administrator email or password.',
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('[Admin Logout Error]', err);
    } finally {
      setAdminUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(adminUser),
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

