import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth tokens
    const jwtToken = localStorage.getItem('jwt_token');
    const sanctumToken = localStorage.getItem('sanctum_token');

    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }
    
    if (sanctumToken) {
      config.headers['X-Sanctum-Token'] = sanctumToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api'}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          if (refreshResponse.data.success) {
            // Update tokens
            const { access_token, refresh_token } = refreshResponse.data.data;
            localStorage.setItem('jwt_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('sanctum_token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export { api };
export default api;
