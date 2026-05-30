import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ເພີ່ມ JWT token ອັດຕະໂນມັດ
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ====== Users (Public Profile) ======
export const usersAPI = {
  getById: (id) => api.get(`/users/${id}`),
};

// ====== Companies ======
export const companiesAPI = {
  getAll: (params) => api.get('/companies', { params }),
  getById: (id) => api.get(`/companies/${id}`),
  toggleFollow: (id) => api.post(`/companies/${id}/follow`),
  checkFollowing: (id) => api.get(`/companies/${id}/follow/check`),
  getFollowerCount: (id) => api.get(`/companies/${id}/followers/count`),
};

// ====== Saved Jobs ======
export const savedJobsAPI = {
  getMine: () => api.get('/saved-jobs'),
  toggle: (jobId) => api.post(`/saved-jobs/${jobId}/toggle`),
  check: (jobId) => api.get(`/saved-jobs/${jobId}/check`),
};

// ====== Auth ======
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  forgotPassword: (email) => api.post('/forgot-password', { email }),
  validateResetToken: (token) => api.get(`/reset-password/${token}/validate`),
  resetPassword: (token, newPassword) => api.post('/reset-password', { token, new_password: newPassword }),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (oldPassword, newPassword) => api.put('/change-password', { old_password: oldPassword, new_password: newPassword }),
  uploadLogo: (formData) => api.post('/upload-logo', formData, {
    headers: { 'Content-Type': undefined },
  }),
  uploadCover: (formData) => api.post('/upload-cover', formData, {
    headers: { 'Content-Type': undefined },
  }),
};

// ====== Jobs ======
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getCategories: () => api.get('/categories'),
  getStats: () => api.get('/stats'),
  createJob: (data) => api.post('/company/jobs', data),
  updateJob: (id, data) => api.put(`/company/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/company/jobs/${id}`),
  getMyJobs: () => api.get('/company/my-jobs'),
};

// ====== Applications ======
export const applicationsAPI = {
  applyJob: (jobId, formData) => api.post(`/applicant/jobs/${jobId}/apply`, formData, {
    headers: { 'Content-Type': undefined },
  }),
  getMyApplications: () => api.get('/applicant/my-applications'),
  cancelApplication: (appId) => api.delete(`/applicant/applications/${appId}`),
  getJobApplicants: (jobId) => api.get(`/company/jobs/${jobId}/applicants`),
  updateStatus: (appId, status) => api.put(`/company/applications/${appId}/status`, { status }),
};

// ====== Reviews ======
export const reviewsAPI = {
  getJobReviews: (jobId) => api.get(`/jobs/${jobId}/reviews`),
  createReview: (jobId, data) => api.post(`/jobs/${jobId}/reviews`, data),
};

// ====== Admin ======
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (role) => api.get('/admin/users', { params: { role } }),
  banUser: (id, ban) => api.put(`/admin/users/${id}/ban`, { ban }),
  verifyCompany: (id, verify) => api.put(`/admin/users/${id}/verify`, { verify }),
  getAllJobs: (status) => api.get('/admin/jobs', { params: { status } }),
  verifyJob: (id, status) => api.put(`/admin/jobs/${id}/verify`, { status }),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  // Categories
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Notifications
  sendNotification: (data) => api.post('/admin/notifications', data),
  getAllNotifications: () => api.get('/admin/notifications'),

  // Complaints
  getComplaints: (status) => api.get('/admin/complaints', { params: { status } }),
  updateComplaint: (id, data) => api.put(`/admin/complaints/${id}`, data),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (id, value) => api.put(`/admin/settings/${id}`, { value }),

  // Login Logs
  getLoginLogs: (limit) => api.get('/admin/login-logs', { params: { limit } }),

  // Profile
  changePassword: (data) => api.put('/admin/change-password', data),
};

// User notifications
export const notificationsAPI = {
  getMine: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  createComplaint: (data) => api.post('/complaints', data),
};

export default api;