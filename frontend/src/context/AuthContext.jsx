import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const ADMIN_EMAIL = 'ayush108ayush108@gmail.com';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on app load
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const signup = async (formData) => {
    setError(null);
    try {
      const res = await authAPI.signup(formData);
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('[Logout Error]', err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('[Refresh User Error]', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        updateUser,
        refreshUser,
        isAdmin: user?.role === 'admin' && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
