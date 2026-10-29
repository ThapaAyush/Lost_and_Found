import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';

import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminItemsPage from './pages/AdminItemsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSignupPage from './pages/AdminSignupPage';
import AdminClaimsPage from './pages/AdminClaimsPage';
import AdminAbuseReportsPage from './pages/AdminAbuseReportsPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          {/* Admin Login Route */}
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Authenticated Admin Dashboard Layout */}
          <Route element={<AdminLayout />}>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="/items" element={<AdminItemsPage />} />
            <Route path="/users" element={<AdminUsersPage />} />
            <Route path="/signup" element={<AdminSignupPage />} />
            <Route path="/claims" element={<AdminClaimsPage />} />
            <Route path="/abuse-reports" element={<AdminAbuseReportsPage />} />
            <Route path="/audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;

