import api from './axiosInstance';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const eventApi = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  uploadImage: (id, formData) => api.post(`/events/${id}/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyEvents: (params) => api.get('/events/my-events', { params }),
};

export const bookingApi = {
  create: (data) => api.post('/bookings/create', data),
  getMyBookings: () => api.get('/bookings/my'),
  cancel: (id) => api.post(`/bookings/${id}/cancel`),
  getQR: (id) => api.get(`/bookings/${id}/qr`),
};

export const paymentApi = {
  createIntent: (bookingId) => api.post('/payments/create-intent', { bookingId }),
};

export const dashboardApi = {
  getAdminStats: () => api.get('/dashboard/admin/stats'),
  getOrganizerStats: () => api.get('/dashboard/organizer/stats'),
  getUsers: (params) => api.get('/dashboard/admin/users', { params }),
  updateRole: (id, role) => api.put(`/dashboard/admin/users/${id}/role`, { role }),
  banUser: (id) => api.put(`/dashboard/admin/users/${id}/ban`),
  getNotifications: () => api.get('/dashboard/notifications'),
  markAsRead: (id) => api.put(`/dashboard/notifications/${id}/read`),
  markAllAsRead: () => api.put('/dashboard/notifications/read-all'),
};
