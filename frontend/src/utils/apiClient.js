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
    const token = localStorage.getItem(import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token');
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
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token');
      window.location.href = '/login';
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
