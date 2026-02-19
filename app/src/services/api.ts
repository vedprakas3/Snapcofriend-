import axios, { type AxiosInstance, type AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  getMe: () =>
    api.get('/auth/me'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/update-password', { currentPassword, newPassword }),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken })
};

// User API
export const userAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (data: any) =>
    api.put('/users/profile', data),
  
  uploadAvatar: (avatarUrl: string) =>
    api.post('/users/avatar', { avatarUrl }),
  
  updateEmergencyContact: (data: any) =>
    api.put('/users/emergency-contact', data),
  
  deleteAccount: () =>
    api.delete('/users/account')
};

// Friend API
export const friendAPI = {
  getFriends: (params?: any) =>
    api.get('/friends', { params }),
  
  getFriendById: (id: string) =>
    api.get(`/friends/${id}`),
  
  getMyProfile: () =>
    api.get('/friends/me/profile'),
  
  createProfile: (data: any) =>
    api.post('/friends/profile', data),
  
  updateProfile: (data: any) =>
    api.put('/friends/profile', data),
  
  addPackage: (data: any) =>
    api.post('/friends/packages', data),
  
  updatePackage: (packageId: string, data: any) =>
    api.put(`/friends/packages/${packageId}`, data),
  
  deletePackage: (packageId: string) =>
    api.delete(`/friends/packages/${packageId}`),
  
  updateAvailability: (availability: any[]) =>
    api.put('/friends/availability', { availability }),
  
  getStats: () =>
    api.get('/friends/me/stats')
};

// Booking API
export const bookingAPI = {
  getBookings: (params?: any) =>
    api.get('/bookings', { params }),
  
  getBookingById: (id: string) =>
    api.get(`/bookings/${id}`),
  
  createBooking: (data: any) =>
    api.post('/bookings', data),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/bookings/${id}/status`, { status }),
  
  cancelBooking: (id: string, reason: string) =>
    api.put(`/bookings/${id}/cancel`, { reason }),
  
  addCheckIn: (id: string, data: any) =>
    api.post(`/bookings/${id}/checkin`, data),
  
  getMessages: (id: string) =>
    api.get(`/bookings/${id}/messages`),
  
  sendMessage: (id: string, content: string, type?: string) =>
    api.post(`/bookings/${id}/messages`, { content, type }),
  
  addReview: (id: string, data: any) =>
    api.post(`/bookings/${id}/review`, data),
  
  disputeBooking: (id: string, data: any) =>
    api.post(`/bookings/${id}/dispute`, data)
};

// Match API
export const matchAPI = {
  findMatches: (data: any) =>
    api.post('/matches/find', data),
  
  getMatchDetails: (friendId: string) =>
    api.get(`/matches/${friendId}`),
  
  getRecommendations: () =>
    api.get('/matches/recommendations')
};

// Message API
export const messageAPI = {
  getConversations: () =>
    api.get('/messages/conversations'),
  
  getUnreadCount: () =>
    api.get('/messages/unread'),
  
  markAsRead: (bookingId: string) =>
    api.put(`/messages/read/${bookingId}`)
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (bookingId: string) =>
    api.post('/payments/create-intent', { bookingId }),
  
  confirmPayment: (bookingId: string, paymentIntentId: string) =>
    api.post('/payments/confirm', { bookingId, paymentIntentId }),
  
  getPaymentMethods: () =>
    api.get('/payments/methods'),
  
  addPaymentMethod: (paymentMethodId: string) =>
    api.post('/payments/methods', { paymentMethodId }),
  
  removePaymentMethod: (methodId: string) =>
    api.delete(`/payments/methods/${methodId}`),
  
  getEarnings: () =>
    api.get('/payments/earnings'),
  
  requestPayout: (amount: number) =>
    api.post('/payments/payout', { amount })
};

// Safety API
export const safetyAPI = {
  triggerSOS: (bookingId: string, location?: any, notes?: string) =>
    api.post('/safety/sos', { bookingId, location, notes }),
  
  getSafetyStatus: (bookingId: string) =>
    api.get(`/safety/status/${bookingId}`),
  
  shareLocation: (bookingId: string, lat: number, lng: number) =>
    api.post('/safety/location', { bookingId, lat, lng }),
  
  getCheckInStatus: (bookingId: string) =>
    api.get(`/safety/checkin/${bookingId}`),
  
  verifySafetyCode: (bookingId: string, code: string) =>
    api.post('/safety/verify-code', { bookingId, code })
};

// Admin API
export const adminAPI = {
  getDashboardStats: () =>
    api.get('/admin/dashboard'),
  
  getUsers: (params?: any) =>
    api.get('/admin/users', { params }),
  
  getBookings: (params?: any) =>
    api.get('/admin/bookings', { params }),
  
  verifyUser: (userId: string) =>
    api.put(`/admin/users/${userId}/verify`),
  
  getDisputes: (status?: string) =>
    api.get('/admin/disputes', { params: { status } }),
  
  resolveDispute: (disputeId: string, data: any) =>
    api.put(`/admin/disputes/${disputeId}/resolve`, data),
  
  getPendingVerifications: () =>
    api.get('/admin/verifications'),
  
  approveVerification: (id: string) =>
    api.put(`/admin/verifications/${id}/approve`),
  
  rejectVerification: (id: string, reason: string) =>
    api.put(`/admin/verifications/${id}/reject`, { reason }),
  
  getReports: (type: string, startDate: string, endDate: string) =>
    api.get('/admin/reports', { params: { type, startDate, endDate } })
};

export default api;
