import api from './api';
import { authService } from './AuthService';

class UserManagementService {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(params = {}) {
    try {

      const response = await api.get('/v1/users', { params });

      console.log('Users API response:', {
        hasData: !!response.data.data,
        hasPagination: !!response.data.pagination,
        hasTotal: !!response.data.total,
        dataKeys: Object.keys(response.data)
      });

      // Handle different response structures from backend
      const responseData = response.data;
      let usersData, paginationData;

      if (responseData.data && responseData.pagination) {
        // Custom pagination response with nested pagination object
        usersData = responseData.data;
        paginationData = responseData.pagination;
      } else if (responseData.data && responseData.total) {
        // Standard Laravel pagination response
        usersData = responseData.data;
        paginationData = {
          total: responseData.total,
          per_page: responseData.per_page,
          current_page: responseData.current_page,
          last_page: responseData.last_page,
          from: responseData.from,
          to: responseData.to
        };
      } else if (Array.isArray(responseData)) {
        // Direct array response
        usersData = responseData;
        paginationData = { total: responseData.length, last_page: 1, current_page: 1 };
      } else {
        // Fallback
        usersData = responseData.users || [];
        paginationData = responseData.pagination || { total: 0, last_page: 1, current_page: 1 };
      }

      // Transform users data to frontend format
      const transformedUsers = Array.isArray(usersData)
        ? usersData.map(user => this.transformUserDataForFrontend(user))
        : [];


      return {
        success: true,
        data: {
          data: transformedUsers,
          pagination: paginationData
        },
        message: responseData.message || 'Users retrieved successfully'
      };
    } catch (error) {

      return this.handleError(error, 'Failed to fetch users');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/v1/users/${id}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch user');
    }
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      const response = await api.post('/v1/users', userData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create user');
    }
  }

  /**
   * Update user
   */
  async updateUser(id, userData) {
    try {
      const response = await api.put(`/v1/users/${id}`, userData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update user');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/v1/users/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to delete user');
    }
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(id) {
    try {
      const response = await api.patch(`/v1/users/${id}/toggle-status`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to toggle user status');
    }
  }

  /**
   * Restore user
   */
  async restoreUser(id) {
    try {
      const response = await api.patch(`/v1/users/${id}/restore`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to restore user');
    }
  }

  /**
   * Clone user
   */
  async cloneUser(id, email, overrides = {}) {
    try {
      const response = await api.post(`/v1/users/${id}/clone`, {
        email,
        overrides
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to clone user');
    }
  }

  /**
   * Search users
   */
  async searchUsers(query, filters = {}) {
    try {
      const response = await api.get('/v1/users/search', {
        params: { query, ...filters }
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to search users');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    try {
      const response = await api.get('/v1/users/statistics');


      const statisticsData = response.data.data || response.data;

      return {
        success: true,
        data: statisticsData,
        message: response.data.message || 'Statistics retrieved successfully'
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch user statistics');
    }
  }

  /**
   * Get user activity
   */
  async getUserActivity(id) {
    try {
      const response = await api.get(`/v1/users/${id}/activity`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch user activity');
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(id) {
    try {
      const response = await api.get(`/v1/users/${id}/sessions`);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch user sessions');
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(id, filters = {}) {
    try {
      const response = await api.get(`/v1/users/${id}/permissions`, { params: filters });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch user permissions');
    }
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email, excludeUserId = null) {
    try {
      const response = await api.post('/v1/users/check-email', {
        email,
        exclude_user_id: excludeUserId
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to check email availability');
    }
  }

  /**
   * Check if username exists
   */
  async checkUsernameExists(username, excludeUserId = null) {
    try {
      const response = await api.post('/v1/users/check-username', {
        username,
        exclude_user_id: excludeUserId
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to check username availability');
    }
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(userIds, data) {
    try {
      const response = await api.patch('/v1/users/bulk-update', {
        user_ids: userIds,
        data
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to bulk update users');
    }
  }

  /**
   * Handle API errors
   */
  handleError(error, defaultMessage) {

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      return {
        success: false,
        message: data?.message || defaultMessage,
        errors: data?.errors || {},
        status,
        code: data?.code || 'API_ERROR'
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        errors: {},
        status: 0,
        code: 'NETWORK_ERROR'
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || defaultMessage,
        errors: {},
        status: 0,
        code: 'UNKNOWN_ERROR'
      };
    }
  }

  /**
   * Transform frontend user data to backend format
   */
  transformUserDataForBackend(userData) {
    return {
      full_name: userData.name || userData.full_name,
      email: userData.email,
      username: userData.username,
      password_hash: userData.password,
      password_hash_confirmation: userData.confirmPassword,
      role: userData.role,
      organization_id: userData.organization_id,
      phone: userData.phone,
      bio: userData.bio,
      department: userData.department,
      job_title: userData.position || userData.job_title,
      location: userData.location,
      timezone: userData.timezone,
      is_email_verified: userData.is_verified || userData.is_email_verified,
      is_phone_verified: userData.is_phone_verified,
      two_factor_enabled: userData.is_2fa_enabled || userData.two_factor_enabled,
      status: userData.status,
      avatar_url: userData.avatar_url,
      permissions: userData.permissions || [],
      metadata: {
        employee_id: userData.metadata?.employee_id,
        hire_date: userData.metadata?.hire_date,
        manager: userData.metadata?.manager,
        cost_center: userData.metadata?.cost_center,
        ...userData.metadata
      }
    };
  }

  /**
   * Transform backend user data to frontend format
   */
  transformUserDataForFrontend(userData) {
    return {
      id: userData.id,
      name: userData.full_name,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      organization: userData.organization?.name,
      organization_id: userData.organization_id,
      phone: userData.phone,
      bio: userData.bio,
      department: userData.department,
      position: userData.job_title,
      location: userData.location,
      timezone: userData.timezone,
      is_verified: userData.is_email_verified,
      is_phone_verified: userData.is_phone_verified,
      is_2fa_enabled: userData.two_factor_enabled,
      status: userData.status,
      avatar_url: userData.avatar_url,
      permissions: userData.permissions || [],
      last_login: userData.last_login_at,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      metadata: {
        employee_id: userData.metadata?.employee_id,
        hire_date: userData.metadata?.hire_date,
        manager: userData.metadata?.manager,
        cost_center: userData.metadata?.cost_center,
        ...userData.metadata
      }
    };
  }
}

export default new UserManagementService();
