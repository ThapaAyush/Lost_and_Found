import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Crucial for HTTP-only cookie exchange
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.response?.data?.errors?.join(', ') ||
        error.message ||
        'An unexpected network error occurred',
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);

// Auth Endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// User Profile Endpoints
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (formData) =>
    api.patch('/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (data) => api.post('/users/change-password', data),
  getStats: () => api.get('/users/stats'),
};

// Items & Reports Endpoints
export const itemAPI = {
  getItems: (params) => api.get('/items', { params }),
  getItemById: (id) => api.get(`/items/${id}`),
  createItem: (formData) =>
    api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateItem: (id, formData) =>
    api.patch(`/items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateItemStatus: (id, data) => api.patch(`/items/${id}/status`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  getMyItems: (params) => api.get('/items/mine', { params }),
  getItemMatches: (id) => api.get(`/items/${id}/matches`),
  submitClaim: (id, formData) =>
    api.post(`/items/${id}/claims`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Smart Matching Endpoints
export const matchAPI = {
  getMatches: (params) => api.get('/matches', { params }),
  getCommunityMatches: (params) => api.get('/matches/community', { params }),
};

// Claims Endpoints
export const claimAPI = {
  getMyClaims: () => api.get('/claims/mine'),
  getClaimById: (id) => api.get(`/claims/${id}`),
  updateClaimStatus: (id, data) => api.patch(`/claims/${id}`, data),
};

// Notifications Endpoints
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

// Contact Requests & Conversations
export const conversationAPI = {
  getConversations: () => api.get('/conversations'),
  createOrGetConversation: (data) => api.post('/conversations', data),
  getConversationById: (id) => api.get(`/conversations/${id}`),
  sendMessage: (id, data) => api.post(`/conversations/${id}/messages`, data),
  updateStatus: (id, data) => api.patch(`/conversations/${id}/status`, data),
};

// Abuse Reports
export const reportAPI = {
  submitReport: (data) => api.post('/reports', data),
};

// Administration Endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  getItems: (params) => api.get('/admin/items', { params }),
  moderateItem: (id, data) => api.patch(`/admin/items/${id}/moderate`, data),
  getClaims: (params) => api.get('/admin/claims', { params }),
  getAbuseReports: (params) => api.get('/admin/abuse-reports', { params }),
  resolveAbuseReport: (id, data) => api.patch(`/admin/abuse-reports/${id}`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export default api;
