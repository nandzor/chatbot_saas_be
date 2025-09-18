/* eslint-disable no-console */
import { BaseApiService } from '@/api/BaseApiService';
import { handleError } from '@/utils/errorHandler';

class ProfileService extends BaseApiService {
  constructor() {
    super();
    this.baseURL = '/api/v1';
  }

  /**
   * Get current user profile
   */
  async getCurrentProfile() {
    try {
      // Use the /auth/me endpoint
      const response = await this.get('/auth/me');

      // BaseApiService wraps response in { success, data, status, headers }
      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      // Return the data, handling both response.data.data and response.data structures
      return response.data.data || response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error getting current profile:', error);
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      throw handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await this.put('/me/profile', profileData);

      // BaseApiService wraps response in { success, data, status, headers }
      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      // Return the data, handling both response.data.data and response.data structures
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
      const response = await this.post('/auth/change-password', passwordData);

      // BaseApiService wraps response in { success, data, status, headers }
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

      const response = await this.post('/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // BaseApiService wraps response in { success, data, status, headers }
      if (!response || !response.success) {
        throw new Error(response?.error || 'No data received from server');
      }

      // Return the data, handling both response.data.data and response.data structures
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
      const response = await this.delete('/me/avatar');

      // BaseApiService wraps response in { success, data, status, headers }
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
   * Logout from all devices
   */
  async logoutAllDevices() {
    try {
      const response = await this.post('/auth/logout-all');

      // BaseApiService wraps response in { success, data, status, headers }
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
      const response = await this.post('/users/check-email', { email });

      // BaseApiService wraps response in { success, data, status, headers }
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
      const response = await this.post('/users/check-phone', { phone });

      // BaseApiService wraps response in { success, data, status, headers }
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
