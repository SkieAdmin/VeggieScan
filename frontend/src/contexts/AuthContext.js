import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Configure axios defaults
  axios.defaults.baseURL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:3001/api';

  // Add token to all requests if available
  axios.interceptors.request.use(
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

  // Handle token expiration or unauthorized responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Token expired or invalid
        logout();
      }
      return Promise.reject(error);
    }
  );

  // Check if token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwt_decode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData && !isTokenExpired(token)) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      const response = await axios.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to login');
      throw error;
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      setError('');
      const response = await axios.post('/auth/register', { name, email, password });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to register');
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError('');
      const response = await axios.put('/users/profile', userData);
      
      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
      throw error;
    }
  };

  // Update user password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setError('');
      await axios.put('/users/password', { currentPassword, newPassword });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update password');
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
