import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else if (response?.status === 404) {
      toast.error('Resource not found.');
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (!response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API utility functions
export const apiUtils = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
  },
  
  // Vendor endpoints
  vendors: {
    getAll: (params) => api.get('/vendors', { params }),
    getById: (id) => api.get(`/vendors/${id}`),
    getMenu: (id, params) => api.get(`/vendors/${id}/menu`, { params }),
    getDashboardStats: () => api.get('/vendors/dashboard/stats'),
    updateProfile: (data) => api.put('/vendors/profile', data),
  },
  
  // Menu endpoints
  menu: {
    getAll: (params) => api.get('/menu', { params }),
    getCategories: () => api.get('/menu/categories'),
    getMyItems: (params) => api.get('/menu/my-items', { params }),
    create: (data) => api.post('/menu', data),
    update: (id, data) => api.put(`/menu/${id}`, data),
    delete: (id) => api.delete(`/menu/${id}`),
    toggleAvailability: (id) => api.patch(`/menu/${id}/toggle-availability`),
  },
  
  // Order endpoints
  orders: {
    create: (data) => api.post('/orders', data),
    getMyOrders: (params) => api.get('/orders/my-orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    cancel: (id, reason) => api.patch(`/orders/${id}/cancel`, { cancelReason: reason }),
    search: (code) => api.get('/orders/search', { params: { code } }),
    
    // Vendor order endpoints
    getVendorOrders: (params) => api.get('/orders/vendor/incoming', { params }),
    updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
    getVendorStats: (params) => api.get('/orders/vendor/stats', { params }),
  },
};