import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, AUTH_TOKEN_KEY } from '../utils/config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and redirect to login
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      // Navigation will be handled by the auth context
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
    return response.data;
  },
  
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
    return response.data;
  },
  
  logout: async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  },
  
  checkAuth: async () => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return false;
    
    try {
      await api.get('/auth/verify');
      return true;
    } catch (error) {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      return false;
    }
  }
};

// Scan Services
export const scanService = {
  uploadScan: async (imageUri) => {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'vegetable.jpg',
    });
    
    const response = await api.post('/scans/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  getAllScans: async () => {
    const response = await api.get('/scans');
    return response.data;
  },
  
  getRecentScans: async (limit = 5) => {
    const response = await api.get(`/scans/recent?limit=${limit}`);
    return response.data;
  },
  
  getScanById: async (id) => {
    const response = await api.get(`/scans/${id}`);
    return response.data;
  },
  
  deleteScan: async (id) => {
    const response = await api.delete(`/scans/${id}`);
    return response.data;
  }
};

// Statistics Services
export const statsService = {
  getDashboardStats: async () => {
    const response = await api.get('/stats');
    return response.data;
  },
  
  getFreshnessStats: async () => {
    const response = await api.get('/stats/freshness');
    return response.data;
  }
};

// User Services
export const userService = {
  getUserProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  
  updateUserProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
  
  updateUserPreferences: async (preferences) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  }
};

export default {
  authService,
  scanService,
  statsService,
  userService
};
