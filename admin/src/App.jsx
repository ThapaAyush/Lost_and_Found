import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';

import AdminLayout from './components/AdminLayout';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminItemsPage from './pages/AdminItemsPage';
import AdminUsersPage from './pages/AdminUsersPage';

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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;

