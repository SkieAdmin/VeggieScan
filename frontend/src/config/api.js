// API Configuration
export const API_BASE_URL = 'http://localhost:8000'; // Change this to your backend URL

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SCAN: '/scan',
  DASHBOARD: '/dashboard',
  HISTORY: '/history',
  ADMIN_USERS: '/admin/users',
  ADMIN_SYSTEM: '/admin/system-status',
  DATASET: '/dataset',
};

// Helper function to make authenticated requests
export const makeAuthenticatedRequest = async (endpoint, options = {}, token) => {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  return response;
};
