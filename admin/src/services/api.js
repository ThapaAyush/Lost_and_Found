import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response.data.errors[0]?.msg) ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(customMessage));
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUserStatus: (id, data) => api.patch(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getItems: (params) => api.get('/admin/items', { params }),
  moderateItem: (id, data) => api.patch(`/admin/items/${id}/moderate`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  getClaims: (params) => api.get('/admin/claims', { params }),
  getAbuseReports: (params) => api.get('/admin/abuse-reports', { params }),
  resolveAbuseReport: (id, data) => api.patch(`/admin/abuse-reports/${id}`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export default api;

