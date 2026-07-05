import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.get('/api/auth/refresh-token');
        if (res.data && res.data.success) {
          const newAccessToken = res.data.accessToken;
          localStorage.setItem('admin_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed or expired, log out admin
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Admin API Service
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // User Management
  getAllUsers: (page = 1, limit = 10, filter = 'all') =>
    api.get(`/admin/users?page=${page}&limit=${limit}&filter=${filter}`),
  
  getUserDetails: (userId: string) =>
    api.get(`/admin/users/${userId}`),
  
  approveUser: (userId: string) =>
    api.post(`/admin/users/${userId}/approve`),
  
  rejectUser: (userId: string, reason: string) =>
    api.post(`/admin/users/${userId}/reject`, { reason }),
  
  deleteUser: (userId: string, reason: string) =>
    api.delete(`/admin/users/${userId}`, { data: { reason } }),
  
  flagUser: (userId: string, reason: string) =>
    api.post(`/admin/users/${userId}/flag`, { reason }),
  
  unflagUser: (userId: string) =>
    api.post(`/admin/users/${userId}/unflag`),

  // Listing Management
  getAllListings: (page = 1, limit = 10, filter = 'all') =>
    api.get(`/admin/listings?page=${page}&limit=${limit}&filter=${filter}`),
  
  getListingDetails: (listingId: string) =>
    api.get(`/admin/listings/${listingId}`),
  
  approveListing: (listingId: string) =>
    api.post(`/admin/listings/${listingId}/approve`),
  
  rejectListing: (listingId: string, reason: string) =>
    api.post(`/admin/listings/${listingId}/reject`, { reason }),
  
  deleteListing: (listingId: string, reason: string) =>
    api.delete(`/admin/listings/${listingId}`, { data: { reason } }),
  
  flagListing: (listingId: string, reason: string) =>
    api.post(`/admin/listings/${listingId}/flag`, { reason }),

  // Fraud Detection
  getFraudReports: (page = 1, limit = 10) =>
    api.get(`/admin/fraud-reports?page=${page}&limit=${limit}`),
  
  createFraudReport: (itemId: string, itemType: 'user' | 'listing', reason: string, score: number) =>
    api.post('/admin/fraud-reports', { itemId, itemType, reason, score }),

  // Spam Detection
  getSpamReports: (page = 1, limit = 10) =>
    api.get(`/admin/spam-reports?page=${page}&limit=${limit}`),
  
  getMessageDetails: (messageId: string) =>
    api.get(`/admin/messages/${messageId}`),
  
  deleteMessage: (messageId: string, reason: string) =>
    api.delete(`/admin/messages/${messageId}`, { data: { reason } }),
  
  reportSpam: (messageId: string, reason: string) =>
    api.post('/admin/spam-reports', { messageId, reason }),

  // Statistics
  getUserStats: () =>
    api.get('/admin/statistics/users'),
  
  getListingStats: () =>
    api.get('/admin/statistics/listings'),
  
  getSpamStats: () =>
    api.get('/admin/statistics/spam'),

  getReconsiderationTickets: (page = 1, limit = 10, status = 'all') =>
    api.get(`/admin/reconsideration-tickets?page=${page}&limit=${limit}&status=${status}`),
  
  resolveReconsiderationTicket: (ticketId: string, action: 'approve' | 'reject', adminComment: string) =>
    api.post(`/admin/reconsideration-tickets/${ticketId}/resolve`, { action, adminComment }),
};

export default api;
