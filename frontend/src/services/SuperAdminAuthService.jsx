import axios from 'axios';

class SuperAdminAuthService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_BASE_URL;
        this.authURL = `${this.baseURL}/auth`;
        this.adminURL = `${this.baseURL}/admin`;

        // Initialize axios instance
        this.api = axios.create({
            baseURL: this.baseURL,
            timeout: 120000, // 120 seconds timeout
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        // Setup interceptors for automatic token management
        this.setupInterceptors();
    }

    /**
     * Setup axios interceptors for automatic token management
     */
    setupInterceptors() {
        // Request interceptor - add tokens to requests
        this.api.interceptors.request.use(
            (config) => {
                const tokens = this.getTokens();

                // Try JWT first (fast)
                if (tokens.access_token) {
                    config.headers.Authorization = `Bearer ${tokens.access_token}`;
                }
                // Fallback to Sanctum token
                else if (tokens.sanctum_token) {
                    config.headers.Authorization = `Bearer ${tokens.sanctum_token}`;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - handle token refresh
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If 401 and we have a refresh token, try to refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const tokens = this.getTokens();
                        if (tokens.refresh_token) {
                            const newTokens = await this.refreshTokens(tokens.refresh_token);
                            this.setTokens(newTokens);

                            // Retry the original request with new token
                            originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
                            return this.api(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh failed, redirect to login
                        this.logout();
                        window.location.href = '/superadmin/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * SuperAdmin Login
     */
    async login(email, password, remember = false) {
        try {
            const response = await this.api.post(`${this.authURL}/login`, {
                email,
                password,
                remember
            });

            if (response.data.success) {
                const authData = response.data.data;
                this.setTokens(authData);
                this.setUser(authData.user);
                return authData;
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Refresh tokens using refresh token
     */
    async refreshTokens(refreshToken) {
        try {
            const response = await this.api.post(`${this.authURL}/refresh`, {
                refresh_token: refreshToken
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Token refresh failed');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Validate current tokens
     */
    async validateTokens() {
        try {
            const response = await this.api.post(`${this.authURL}/validate`);
            return response.data.success;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get current user profile
     */
    async getProfile() {
        try {
            const response = await this.api.get(`${this.authURL}/me`);

            if (response.data.success) {
                this.setUser(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to get profile');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        try {
            const response = await this.api.put(`${this.authURL}/profile`, profileData);

            if (response.data.success) {
                this.setUser(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword, newPasswordConfirmation) {
        try {
            const response = await this.api.post(`${this.authURL}/change-password`, {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: newPasswordConfirmation
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to change password');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Get active sessions
     */
    async getSessions() {
        try {
            const response = await this.api.get(`${this.authURL}/sessions`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to get sessions');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Revoke specific session
     */
    async revokeSession(sessionId) {
        try {
            const response = await this.api.delete(`${this.authURL}/sessions/${sessionId}`);

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to revoke session');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Logout from current session
     */
    async logout() {
        try {
            await this.api.post(`${this.authURL}/logout`);
        } catch (error) {
            // Silently handle logout request failure
        } finally {
            this.clearAuth();
        }
    }

    /**
     * Logout from all sessions
     */
    async logoutAll() {
        try {
            await this.api.post(`${this.authURL}/logout-all`);
        } catch (error) {
            // Silently handle logout all request failure
        } finally {
            this.clearAuth();
        }
    }

    /**
     * Forgot password
     */
    async forgotPassword(email) {
        try {
            const response = await this.api.post(`${this.authURL}/forgot-password`, { email });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to send reset email');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Reset password
     */
    async resetPassword(token, email, password, passwordConfirmation) {
        try {
            const response = await this.api.post(`${this.authURL}/reset-password`, {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Failed to reset password');
            }
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const tokens = this.getTokens();
        const user = this.getUser();
        return !!(tokens.access_token || tokens.sanctum_token) && !!user;
    }

    /**
     * Check if user is super admin
     */
    isSuperAdmin() {
        const user = this.getUser();
        return user && (user.role === 'super_admin' || user.is_super_admin);
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission) {
        const user = this.getUser();
        if (!user) return false;

        // Super admin has all permissions
        if (this.isSuperAdmin()) return true;

        // Check user permissions
        return user.permissions?.includes(permission) || false;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        const user = this.getUser();
        if (!user) return false;

        // Super admin has all roles
        if (this.isSuperAdmin()) return true;

        // Check user roles
        return user.roles?.includes(role) || user.role === role || false;
    }

    // Token management methods
    setTokens(tokens) {
        localStorage.setItem('superadmin_tokens', JSON.stringify({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            sanctum_token: tokens.sanctum_token,
            expires_in: tokens.expires_in,
            refresh_expires_in: tokens.refresh_expires_in,
            token_type: tokens.token_type
        }));
    }

    getTokens() {
        const tokens = localStorage.getItem('superadmin_tokens');
        return tokens ? JSON.parse(tokens) : {};
    }

    clearTokens() {
        localStorage.removeItem('superadmin_tokens');
    }

    // User management methods
    setUser(user) {
        localStorage.setItem('superadmin_user', JSON.stringify(user));
    }

    getUser() {
        const user = localStorage.getItem('superadmin_user');
        return user ? JSON.parse(user) : null;
    }

    clearUser() {
        localStorage.removeItem('superadmin_user');
    }

    // Clear all auth data
    clearAuth() {
        this.clearTokens();
        this.clearUser();
    }

    // Error handling
    handleError(error) {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        } else if (error.message) {
            return new Error(error.message);
        } else {
            return new Error('An unexpected error occurred');
        }
    }

    // Get API instance for custom requests
    getApi() {
        return this.api;
    }
}

// Create singleton instance
const superAdminAuthService = new SuperAdminAuthService();

export default superAdminAuthService;
