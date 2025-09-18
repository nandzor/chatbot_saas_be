/* eslint-disable no-console */
import { authService } from './AuthService';
import { handleError } from '@/utils/errorHandler';

class SuperAdminUserManagementService {
  constructor() {
    this.authService = authService;
  }

  /**
   * Helper method to make API calls using AuthService
   */
  async _makeApiCall(method, endpoint, data = null, config = {}) {
      const response = await this.authService.api.request({
        method,
        url: `/v1${endpoint}`,
        data,
        ...config
      });
    return response.data;
  }

  /**
   * Get all users (superadmin can see all users across organizations)
   * GET /api/v1/users
   */
  async getUsers(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/users', params);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting users:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Create new user
   * POST /api/v1/users
   */
  async createUser(userData) {
    try {
      const response = await this._makeApiCall('POST', '/users', userData);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating user:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/v1/users/{{userId}}
   */
  async getUserById(userId) {
    try {
      const response = await this._makeApiCall('GET', `/users/${userId}`);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting user by ID:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Update user
   * PUT /api/v1/users/{{userId}}
   */
  async updateUser(userId, userData) {
    try {
      const response = await this._makeApiCall('PUT', `/users/${userId}`, userData);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating user:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/v1/users/{{userId}}
   */
  async deleteUser(userId) {
    try {
      const response = await this._makeApiCall('DELETE', `/users/${userId}`);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting user:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Search users
   */
  async searchUsers(query, params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/users/search', {
        q: query,
        ...params
      });

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error searching users:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Toggle user status (activate/deactivate)
   */
  async toggleUserStatus(userId) {
    try {
      const response = await this._makeApiCall('PATCH', `/users/${userId}/toggle-status`);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error toggling user status:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId) {
    try {
      const response = await this._makeApiCall('GET', `/users/${userId}/activity`);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting user activity:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId) {
    try {
      const response = await this._makeApiCall('GET', `/users/${userId}/sessions`);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting user sessions:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId) {
    try {
      const response = await this._makeApiCall('GET', `/users/${userId}/permissions`);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting user permissions:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    try {
      const response = await this._makeApiCall('GET', '/users/statistics');

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting user statistics:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Check email availability
   */
  async checkEmail(email) {
    try {
      const response = await this._makeApiCall('POST', '/users/check-email', { email });

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking email:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Check username availability
   */
  async checkUsername(username) {
    try {
      const response = await this._makeApiCall('POST', '/users/check-username', { username });

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error checking username:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(updates) {
    try {
      const response = await this._makeApiCall('PATCH', '/users/bulk-update', updates);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error bulk updating users:', error);
      }
      throw handleError(error);
    }
  }
}

export default SuperAdminUserManagementService;
