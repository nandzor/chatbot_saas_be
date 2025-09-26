/**
 * API Client Utility
 * Centralized HTTP client for API calls
 */

import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const jwtToken = localStorage.getItem('jwt_token');
    const sanctumToken = localStorage.getItem('sanctum_token');

    // Add JWT token to Authorization header
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    // Add Sanctum token as fallback
    if (sanctumToken) {
      config.headers['X-Sanctum-Token'] = sanctumToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized access - token may be invalid or expired');
      // Only redirect to login if we're not already on a login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('sanctum_token');
        localStorage.removeItem('chatbot_user');
        localStorage.removeItem('chatbot_session');
        window.location.href = '/login';
      }
    }

    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data.message);
    }

    // Handle 422 errors (validation errors)
    if (error.response?.status === 422) {
      console.error('Validation errors:', error.response.data.errors);
    }

    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
