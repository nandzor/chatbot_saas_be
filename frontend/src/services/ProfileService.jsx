/* eslint-disable no-console */
import { authService } from './AuthService';
import { handleError } from '@/utils/errorHandler';

class ProfileService {
  constructor() {
    this.authService = authService;
  }

  /**
   * Helper method to make API calls using AuthService
   */
  async _makeApiCall(method, endpoint, data = null, config = {}) {
    const response = await this.authService.api.request({
      method,
      url: `/api/v1${endpoint}`,
      data,
      ...config
    });
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile() {
    try {
      // Use AuthService to get current user
      const userData = await this.authService.getCurrentUser();

      if (!userData) {
        throw new Error('No user data received from AuthService');
      }

      return userData;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting current profile:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await this._makeApiCall('PUT', '/me/profile', profileData);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data.data || response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating profile:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData) {
    try {
      const response = await this._makeApiCall('POST', '/auth/change-password', passwordData);

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error changing password:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await this._makeApiCall('POST', '/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data.data || response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error uploading avatar:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Delete avatar
   */
  async deleteAvatar() {
    try {
      const response = await this._makeApiCall('DELETE', '/me/avatar');

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error deleting avatar:', error);
      }
      throw handleError(error);
    }
  }


  /**
   * Get active sessions
   */
  async getActiveSessions() {
    try {
      const response = await this._makeApiCall('GET', '/auth/sessions');

      // Backend returns { success: true, data: [...] }
      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      // Return the sessions array directly
      return response.data || [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting active sessions:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices() {
    try {
      const response = await this._makeApiCall('POST', '/auth/logout-all');

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error logging out all devices:', error);
      }
      throw handleError(error);
    }
  }


  /**
   * Validate email
   */
  async validateEmail(email) {
    try {
      const response = await this._makeApiCall('POST', '/users/check-email', { email });

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error validating email:', error);
      }
      throw handleError(error);
    }
  }

  /**
   * Validate phone
   */
  async validatePhone(phone) {
    try {
      const response = await this._makeApiCall('POST', '/users/check-phone', { phone });

      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error validating phone:', error);
      }
      throw handleError(error);
    }
  }
}

export const profileService = new ProfileService();
export default ProfileService;
