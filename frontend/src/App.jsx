import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './layouts/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

// Public Pages
import HomePage from './pages/HomePage';
import LostItemsPage from './pages/LostItemsPage';
import FoundItemsPage from './pages/FoundItemsPage';
import ItemDetailsPage from './pages/ItemDetailsPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected App Pages
import DashboardPage from './pages/DashboardPage';
import ReportLostPage from './pages/ReportLostPage';
import ReportFoundPage from './pages/ReportFoundPage';
import EditItemPage from './pages/EditItemPage';
import MyReportsPage from './pages/MyReportsPage';
import PotentialMatchesPage from './pages/PotentialMatchesPage';
import ClaimsPage from './pages/ClaimsPage';
import ClaimDetailsPage from './pages/ClaimDetailsPage';
import ConversationsPage from './pages/ConversationsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

// Not Found
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Unauthenticated Auth Pages */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<Navigate to="/login" replace />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>

            {/* Main Application Shell */}
            <Route element={<AppLayout />}>
              {/* Publicly Browseable Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/found-items" element={<FoundItemsPage />} />
              <Route path="/lost-items" element={<LostItemsPage />} />
              <Route path="/items/:id" element={<ItemDetailsPage />} />

              {/* Authenticated Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/report/lost" element={<ReportLostPage />} />
                <Route path="/report/found" element={<ReportFoundPage />} />
                <Route path="/items/:id/edit" element={<EditItemPage />} />
                <Route path="/my-reports" element={<MyReportsPage />} />
                <Route path="/matches" element={<PotentialMatchesPage />} />
                <Route path="/claims" element={<ClaimsPage />} />
                <Route path="/claims/:id" element={<ClaimDetailsPage />} />
                <Route path="/conversations" element={<ConversationsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
