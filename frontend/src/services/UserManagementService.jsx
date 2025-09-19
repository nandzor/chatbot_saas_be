/* eslint-disable no-console */
import { authService } from './AuthService';
import { handleError } from '@/utils/errorHandler';

class UserManagementService {
  constructor() {
    this.authService = authService;
  }

  /**
   * Get organization ID from auth context
   */
  getOrganizationId() {
    const user = this.authService.getCurrentUserSync();

    if (import.meta.env.DEV) {
      console.log('UserManagementService - User data:', user);
      console.log('UserManagementService - organization_id:', user?.organization_id);
      console.log('UserManagementService - organization:', user?.organization);
    }

    // Try multiple possible organization ID fields
    const organizationId = user?.organization_id ||
                          user?.organization?.id ||
                          user?.organization_id ||
                          user?.org_id ||
                          user?.organizationId;

    if (import.meta.env.DEV) {
      console.log('UserManagementService - Final organization ID:', organizationId);
    }

    return organizationId;
  }

  /**
   * Helper method to make API calls using AuthService
   */
  async _makeApiCall(method, endpoint, data = null, config = {}) {
    const organizationId = this.getOrganizationId();
    if (!organizationId) {
      // Try to get organization ID from current user async
      try {
        const user = await this.authService.getCurrentUser();
        const asyncOrgId = user?.organization_id || user?.organization?.id || user?.org_id || user?.organizationId;

        if (!asyncOrgId) {
          throw new Error('Organization ID not found. Please ensure you are logged in and have an organization assigned.');
        }

        // Use the async organization ID
        const response = await this.authService.api.request({
          method,
          url: `/v1/organizations/${asyncOrgId}${endpoint}`,
          data,
          ...config
        });
        return response.data;
      } catch (error) {
        throw new Error('Organization ID not found. Please ensure you are logged in and have an organization assigned.');
      }
    }

    const fullUrl = `/v1/organizations/${organizationId}${endpoint}`;

    if (import.meta.env.DEV) {
      console.log('UserManagementService - Making API call:', {
        method,
        url: fullUrl,
        data,
        config
      });
    }

    const response = await this.authService.api.request({
      method,
      url: fullUrl,
      data,
      ...config
    });

    if (import.meta.env.DEV) {
      console.log('UserManagementService - Raw response:', response);
    }

    return response.data;
  }

  /**
   * Get all users in organization
   * GET /api/v1/organizations/{{organization}}/users
   */
  async getUsers(params = {}) {
    try {
      if (import.meta.env.DEV) {
        console.log('UserManagementService - getUsers params:', params);
        console.log('UserManagementService - organization ID:', this.getOrganizationId());
      }

      const response = await this._makeApiCall('GET', '/users', null, { params });

      if (import.meta.env.DEV) {
        console.log('UserManagementService - API response:', response);
      }

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      // Return the complete response including pagination data
      return response;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting users:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Create new user in organization
   * POST /api/v1/organizations/{{organization}}/users
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
   * GET /api/v1/organizations/{{organization}}/users/{{userId}}
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
   * PUT /api/v1/organizations/{{organization}}/users/{{userId}}
   */
  async updateUser(userId, userData) {
    try {
      // Validate required fields
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!userData || Object.keys(userData).length === 0) {
        throw new Error('User data is required');
      }

      // Sanitize user data
      const sanitizedData = this._sanitizeUserData(userData);

      const response = await this._makeApiCall('PUT', `/users/${userId}`, sanitizedData);

      if (!response || !response.success) {
        throw new Error(response?.message || response?.error || 'No data received from server');
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
   * Update user using PATCH method
   * PATCH /api/v1/organizations/{{organization}}/users/{{userId}}
   */
  async patchUser(userId, userData) {
    try {
      // Validate required fields
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!userData || Object.keys(userData).length === 0) {
        throw new Error('User data is required');
      }

      // Sanitize user data
      const sanitizedData = this._sanitizeUserData(userData);

      const response = await this._makeApiCall('PATCH', `/users/${userId}`, sanitizedData);

      if (!response || !response.success) {
        throw new Error(response?.message || response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error patching user:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Toggle user status
   * PATCH /api/v1/organizations/{{organization}}/users/{{userId}}/toggle-status
   */
  async toggleUserStatus(userId, status) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (!status) {
        throw new Error('Status is required');
      }

      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const response = await this._makeApiCall('PATCH', `/users/${userId}/toggle-status`, { status });

      if (!response || !response.success) {
        throw new Error(response?.message || response?.error || 'No data received from server');
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
   * Sanitize user data before sending to API
   */
  _sanitizeUserData(userData) {
    const sanitized = {};

    // Allowed fields for update
    const allowedFields = [
      'full_name', 'email', 'phone', 'username', 'role', 'status',
      'bio', 'timezone', 'language', 'permissions', 'preferences'
    ];

    // Only include allowed fields
    allowedFields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(userData, field) && userData[field] !== undefined) {
        sanitized[field] = userData[field];
      }
    });

    return sanitized;
  }

  /**
   * Delete user
   * DELETE /api/v1/organizations/{{organization}}/users/{{userId}}
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

export default UserManagementService;
