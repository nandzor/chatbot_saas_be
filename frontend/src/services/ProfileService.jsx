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
      const response = await this.get('/me');
      return response.data.data;
    } catch (error) {
      console.error('Error getting current profile:', error);
      throw handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await this.put('/me/profile', profileData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw handleError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData) {
    try {
      const response = await this.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
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
      return response.data.data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw handleError(error);
    }
  }

  /**
   * Delete avatar
   */
  async deleteAvatar() {
    try {
      const response = await this.delete('/me/avatar');
      return response.data;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw handleError(error);
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions() {
    try {
      const response = await this.get('/me/sessions');
      return response.data.data;
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw handleError(error);
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices() {
    try {
      const response = await this.post('/auth/logout-all');
      return response.data;
    } catch (error) {
      console.error('Error logging out all devices:', error);
      throw handleError(error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await this.put('/me/preferences', preferences);
      return response.data.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw handleError(error);
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences() {
    try {
      const response = await this.get('/me/preferences');
      return response.data.data;
    } catch (error) {
      console.error('Error getting preferences:', error);
      throw handleError(error);
    }
  }

  /**
   * Validate email
   */
  async validateEmail(email) {
    try {
      const response = await this.post('/users/check-email', { email });
      return response.data;
    } catch (error) {
      console.error('Error validating email:', error);
      throw handleError(error);
    }
  }

  /**
   * Validate phone
   */
  async validatePhone(phone) {
    try {
      const response = await this.post('/users/check-phone', { phone });
      return response.data;
    } catch (error) {
      console.error('Error validating phone:', error);
      throw handleError(error);
    }
  }
}

export const profileService = new ProfileService();
export default ProfileService;
