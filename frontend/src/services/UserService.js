import { BaseService } from './BaseService';

/**
 * UserService - Handles user management operations
 * Extends BaseService for common CRUD operations
 */
class UserService extends BaseService {
  constructor() {
    super('/api/v1/users');
  }

  /**
   * Get users with pagination and filters
   */
  async getUsers(params = {}) {
    return this.get('', { params });
  }

  /**
   * Get user by ID
   */
  async getUserById(id) {
    return this.getById(id);
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    return this.create(userData);
  }

  /**
   * Update user
   */
  async updateUser(id, userData) {
    return this.update(id, userData);
  }

  /**
   * Delete user
   */
  async deleteUser(id) {
    return this.delete(id);
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(ids) {
    return this.request('DELETE', '/bulk', { ids });
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId) {
    return this.request('GET', `/${userId}/roles`);
  }

  /**
   * Assign roles to user
   */
  async assignRolesToUser(userId, roleIds) {
    return this.request('POST', `/${userId}/roles`, { role_ids: roleIds });
  }

  /**
   * Remove roles from user
   */
  async removeRolesFromUser(userId, roleIds) {
    return this.request('DELETE', `/${userId}/roles`, { role_ids: roleIds });
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId) {
    return this.request('GET', `/${userId}/permissions`);
  }

  /**
   * Update user status
   */
  async updateUserStatus(userId, status) {
    return this.request('PATCH', `/${userId}/status`, { status });
  }

  /**
   * Reset user password
   */
  async resetUserPassword(userId) {
    return this.request('POST', `/${userId}/reset-password`);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email) {
    return this.request('POST', '/forgot-password', { email });
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    return this.request('GET', '/profile');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData) {
    return this.request('PUT', '/profile', profileData);
  }

  /**
   * Change user password
   */
  async changePassword(passwordData) {
    return this.request('POST', '/change-password', passwordData);
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId, params = {}) {
    return this.request('GET', `/${userId}/activity`, { params });
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    return this.request('GET', `/${userId}/stats`);
  }

  /**
   * Validate user data
   */
  validateUserData(data, isUpdate = false) {
    const errors = {};

    // Required fields
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
      }
    }

    if (!isUpdate || data.email !== undefined) {
      if (!data.email) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!isUpdate) {
      if (!data.password) {
        errors.password = 'Password is required';
      } else if (data.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
      }
    }

    // Optional validations
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (data.username && data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format user data for API
   */
  formatUserData(data) {
    const formatted = { ...data };

    // Remove empty strings and null values
    Object.keys(formatted).forEach(key => {
      if (formatted[key] === '' || formatted[key] === null || formatted[key] === undefined) {
        delete formatted[key];
      }
    });

    // Format specific fields
    if (formatted.name) {
      formatted.name = formatted.name.trim();
    }

    if (formatted.email) {
      formatted.email = formatted.email.toLowerCase().trim();
    }

    if (formatted.username) {
      formatted.username = formatted.username.toLowerCase().trim();
    }

    return formatted;
  }

  /**
   * Get user export data
   */
  async exportUsers(format = 'json', filters = {}) {
    const params = { ...filters, format };
    return this.request('GET', '/export', { params });
  }

  /**
   * Import users
   */
  async importUsers(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    return this.request('POST', '/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
}

// Create and export singleton instance
export const userService = new UserService();
export default UserService;
