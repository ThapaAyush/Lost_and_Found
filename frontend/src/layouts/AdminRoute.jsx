import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminRoute = () => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" message="Verifying admin credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isDesignatedAdmin =
    isAdmin && user?.email?.toLowerCase() === (ADMIN_EMAIL || 'ayush108ayush108@gmail.com').toLowerCase();

  if (!isDesignatedAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;