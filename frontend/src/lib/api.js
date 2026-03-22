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

// ====== Auth ======
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
};

// ====== Jobs ======
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  getCategories: () => api.get('/categories'),
  createJob: (data) => api.post('/company/jobs', data),
  updateJob: (id, data) => api.put(`/company/jobs/${id}`, data),
  getMyJobs: () => api.get('/company/my-jobs'),
};

// ====== Applications ======
export const applicationsAPI = {
  applyJob: (jobId, data) => api.post(`/applicant/jobs/${jobId}/apply`, data),
  getMyApplications: () => api.get('/applicant/my-applications'),
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
  getAllJobs: (status) => api.get('/admin/jobs', { params: { status } }),
  verifyJob: (id, status) => api.put(`/admin/jobs/${id}/verify`, { status }),
  getReviews: () => api.get('/admin/reviews'),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

export default api;