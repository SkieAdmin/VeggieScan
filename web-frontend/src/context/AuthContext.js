import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = `${process.env.REACT_APP_BACKEND_URL_PORT}`;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data);
      const { access_token, token_type, user_id } = response.data;
      
      // Get user details to check if admin
      const userDetailsResponse = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      console.log('User details:', userDetailsResponse.data);
      const is_admin = userDetailsResponse.data.is_admin || false;
      
      // Store complete user data
      const userData = { 
        id: user_id, 
        email, 
        is_admin, 
        token: access_token 
      };

      console.log('Storing token:', access_token);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  const register = async (email, username, password, isAdmin = false) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        username,
        password,
        is_admin: isAdmin,
      });

      return { success: true, message: 'Registration successful' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    console.log('Using token:', token);
    console.log('Endpoint:', `${API_BASE_URL}${endpoint}`);
    
    // Don't set Content-Type for FormData - let axios handle it
    const isFormData = options.data instanceof FormData;
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    
    // Only set Content-Type if it's not FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    } else {
      console.log('FormData detected, letting axios set Content-Type');
    }
    
    return axios({
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      ...options,
    });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    makeAuthenticatedRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
