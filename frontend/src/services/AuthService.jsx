import axios from 'axios';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.refreshPromise = null;
    this.getCurrentUserPromise = null; // Track getCurrentUser calls
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
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Login user with unified authentication
   * Supports both email and username login
   */
  async login(credentials) {
    try {
      // Validate credentials
      if (!credentials.email && !credentials.username) {
        throw new Error('Email or username is required');
      }
      if (!credentials.password) {
        throw new Error('Password is required');
      }

      // Prepare login data
      const loginData = {
        password: credentials.password,
        ...(credentials.email ? { email: credentials.email } : { username: credentials.username })
      };

      const response = await this.api.post('/auth/login', loginData);

      if (response.data.success) {
        const { data } = response.data;

        // Store tokens with unified auth support
        this.updateTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          sanctum_token: data.sanctum_token,
          token_type: data.token_type,
          expires_in: data.expires_in,
          refresh_expires_in: data.refresh_expires_in,
          auth_method: data.auth_method || 'jwt', // Track which auth method was used
        });

        // Set default headers for unified auth
        this.api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        if (data.sanctum_token) {
          this.api.defaults.headers.common['X-Sanctum-Token'] = data.sanctum_token;
        }

        // Store user data
        if (data.user) {
          localStorage.setItem('chatbot_user', JSON.stringify(data.user));
        }
      }

      return response.data;
    } catch (error) {
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
    } finally {
      // Clear tokens regardless of API call success
      this.clearTokens();
    }
  }

  /**
   * Get current user information synchronously from localStorage
   */
  getCurrentUserSync() {
    try {
      const savedUser = localStorage.getItem('chatbot_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
      return null;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return null;
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser() {
    // If there's already a pending request, return that promise
    if (this.getCurrentUserPromise) {
      return this.getCurrentUserPromise;
    }

    // Create new promise and store it
    this.getCurrentUserPromise = this._fetchCurrentUser();

    try {
      const result = await this.getCurrentUserPromise;
      return result;
    } finally {
      // Clear the promise after completion
      this.getCurrentUserPromise = null;
    }
  }

  /**
   * Internal method to fetch current user
   */
  async _fetchCurrentUser() {
    try {
      const response = await this.api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
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
   * Update tokens in localStorage and headers with unified auth support
   */
  updateTokens(tokens) {
    // Store JWT token
    if (tokens.access_token) {
      localStorage.setItem('jwt_token', tokens.access_token);
      localStorage.setItem('token_expires_at', new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString());
    }

    // Store refresh token
    if (tokens.refresh_token) {
      localStorage.setItem('refresh_token', tokens.refresh_token);
      localStorage.setItem('refresh_expires_at', new Date(Date.now() + (tokens.refresh_expires_in || 86400) * 1000).toISOString());
    }

    // Store Sanctum token (fallback)
    if (tokens.sanctum_token) {
      localStorage.setItem('sanctum_token', tokens.sanctum_token);
    }

    // Store auth method for debugging
    if (tokens.auth_method) {
      localStorage.setItem('auth_method', tokens.auth_method);
    }

    // Store unified auth metadata
    localStorage.setItem('unified_auth_enabled', 'true');
    localStorage.setItem('last_auth_update', new Date().toISOString());
  }

  /**
   * Clear all tokens and user data
   */
  clearTokens() {
    // Clear all auth-related localStorage items
    const authKeys = [
      'jwt_token', 'refresh_token', 'sanctum_token',
      'token_expires_at', 'refresh_expires_at', 'auth_method',
      'unified_auth_enabled', 'last_auth_update', 'chatbot_user'
    ];

    authKeys.forEach(key => localStorage.removeItem(key));

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
    const savedUser = localStorage.getItem('chatbot_user');

    // Must have at least one token and user data
    if ((!jwtToken && !sanctumToken) || !savedUser) {
      return false;
    }

    // Check if JWT token is expired
    if (jwtToken && tokenExpiresAt && new Date(tokenExpiresAt) <= new Date()) {
      // JWT expired, but Sanctum might still be valid
      return !!sanctumToken;
    }

    return true;
  }

  /**
   * Get current tokens with unified auth info
   */
  getTokens() {
    return {
      jwt: localStorage.getItem('jwt_token') || undefined,
      sanctum: localStorage.getItem('sanctum_token') || undefined,
      refresh: localStorage.getItem('refresh_token') || undefined,
      auth_method: localStorage.getItem('auth_method') || 'jwt',
      unified_auth_enabled: localStorage.getItem('unified_auth_enabled') === 'true',
      last_auth_update: localStorage.getItem('last_auth_update'),
    };
  }

  /**
   * Check unified auth status and health
   */
  async checkUnifiedAuthHealth() {
    try {
      const response = await this.api.get('/auth/me');
      return {
        status: 'healthy',
        auth_method: response.data.data?.auth_method || 'unknown',
        user: response.data.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.response?.data?.message || error.message,
        auth_method: localStorage.getItem('auth_method') || 'unknown',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Handle unified auth errors with fallback strategies
   */
  handleAuthError(error) {
    const errorResponse = error.response?.data;

    // Handle specific error codes from backend
    switch (errorResponse?.error_code) {
      case 'TOKEN_EXPIRED':
        return this.handleTokenExpired();
      case 'TOKEN_INVALID':
        return this.handleTokenInvalid();
      case 'RATE_LIMIT_EXCEEDED':
        return this.handleRateLimitExceeded(errorResponse);
      case 'USER_LOCKED':
        return this.handleUserLocked(errorResponse);
      default:
        return {
          type: 'general',
          message: errorResponse?.message || 'Authentication failed',
          details: errorResponse?.errors || {}
        };
    }
  }

  /**
   * Handle token expired with automatic refresh
   */
  async handleTokenExpired() {
    try {
      await this.refreshTokens();
      return { type: 'refreshed', message: 'Token refreshed successfully' };
    } catch (error) {
      this.clearTokens();
      return { type: 'expired', message: 'Session expired, please login again' };
    }
  }

  /**
   * Handle invalid token
   */
  handleTokenInvalid() {
    this.clearTokens();
    return { type: 'invalid', message: 'Invalid token, please login again' };
  }

  /**
   * Handle rate limit exceeded
   */
  handleRateLimitExceeded(errorResponse) {
    return {
      type: 'rate_limit',
      message: 'Too many requests, please try again later',
      retryAfter: errorResponse?.retry_after || 60
    };
  }

  /**
   * Handle locked user
   */
  handleUserLocked(errorResponse) {
    return {
      type: 'locked',
      message: 'Account is locked, please contact administrator',
      lockedUntil: errorResponse?.locked_until
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
