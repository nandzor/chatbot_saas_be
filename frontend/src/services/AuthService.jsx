import axios from 'axios';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.refreshPromise = null;
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for automatic token management
   */
  setupInterceptors() {
    // Request interceptor - add tokens
    this.api.interceptors.request.use(
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
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh JWT token
            const newTokens = await this.refreshTokens();

            // Update tokens in localStorage
            this.updateTokens(newTokens);

            // Retry original request with new JWT token
            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;

            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Login user with unified authentication
   */
  async login(credentials) {
    try {
      const response = await this.api.post('/auth/login', credentials);

      if (response.data.success) {
        const { data } = response.data;

        // Store tokens
        this.updateTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          sanctum_token: data.sanctum_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
          refresh_expires_in: data.refresh_expires_in,
        });

        // Set default headers
        this.api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        this.api.defaults.headers.common['X-Sanctum-Token'] = data.sanctum_token;
      }

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Refresh JWT token using refresh token
   */
  async refreshTokens() {
    // Prevent multiple refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual refresh request
   */
  async performRefresh() {
    const refreshToken = localStorage.getItem('refresh_token');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.api.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      return response.data.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout endpoint
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear tokens regardless of API call success
      this.clearTokens();
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data.data;
  }

  /**
   * Validate current tokens
   */
  async validateTokens() {
    try {
      await this.api.post('/auth/validate');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update tokens in localStorage and headers
   */
  updateTokens(tokens) {
    localStorage.setItem('jwt_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('sanctum_token', tokens.sanctum_token);
    localStorage.setItem('token_expires_at', new Date(Date.now() + tokens.expires_in * 1000).toISOString());
    localStorage.setItem('refresh_expires_at', new Date(Date.now() + tokens.refresh_expires_in * 1000).toISOString());
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('sanctum_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('refresh_expires_at');

    // Clear headers
    delete this.api.defaults.headers.common['Authorization'];
    delete this.api.defaults.headers.common['X-Sanctum-Token'];
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const jwtToken = localStorage.getItem('jwt_token');
    const sanctumToken = localStorage.getItem('sanctum_token');
    const tokenExpiresAt = localStorage.getItem('token_expires_at');

    if (!jwtToken && !sanctumToken) {
      return false;
    }

    // Check if JWT token is expired
    if (tokenExpiresAt && new Date(tokenExpiresAt) <= new Date()) {
      // JWT expired, but Sanctum might still be valid
      return !!sanctumToken;
    }

    return true;
  }

  /**
   * Get current tokens
   */
  getTokens() {
    return {
      jwt: localStorage.getItem('jwt_token') || undefined,
      sanctum: localStorage.getItem('sanctum_token') || undefined,
      refresh: localStorage.getItem('refresh_token') || undefined,
    };
  }

  /**
   * Get API instance for making authenticated requests
   */
  getApi() {
    return this.api;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
