/* eslint-disable no-console */
import { authService } from './AuthService';
import { handleError } from '@/utils/errorHandler';

class AgentProfileService {
  constructor() {
    this.authService = authService;
    this.initialized = false;
    this.initializeService();
  }

  /**
   * Initialize the service and verify dependencies
   */
  initializeService() {
    try {
      if (!this.authService) {
        throw new Error('AuthService is not available');
      }

      if (!this.authService.api) {
        throw new Error('AuthService API instance is not available');
      }

      // Test if the API instance is functional
      if (typeof this.authService.api.request !== 'function') {
        throw new Error('AuthService API request method is not available');
      }

      this.initialized = true;
      console.log('✅ AgentProfileService initialized successfully');
    } catch (error) {
      console.error('❌ AgentProfileService initialization failed:', error);
      this.initialized = false;
    }
  }

  /**
   * Check if service is ready for API calls
   */
  isReady() {
    return this.initialized && this.authService && this.authService.api;
  }

  /**
   * Wait for service to be ready
   */
  async waitForReady(timeout = 5000) {
    const startTime = Date.now();

    while (!this.isReady() && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.isReady()) {
      throw new Error('AgentProfileService failed to initialize within timeout');
    }

    return true;
  }

  /**
   * Get organization ID from auth context
   */
  getOrganizationId() {
    const user = this.authService.getCurrentUserSync();

    // Try multiple possible organization ID fields
    const organizationId = user?.organization_id ||
                          user?.organization?.id ||
                          user?.organization_id ||
                          user?.org_id ||
                          user?.organizationId;

    return organizationId;
  }

  /**
   * Make API call with proper error handling
   */
  async _makeApiCall(apiCall, ...args) {
    try {
      await this.waitForReady();

      if (!this.isReady()) {
        throw new Error('AgentProfileService is not ready');
      }

      const response = await apiCall(...args);

      if (response.status >= 400) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ AgentProfileService API call failed:', error);
      handleError(error);
      throw error;
    }
  }

  /**
   * Get current user profile information
   */
  async getCurrentUserProfile() {
    try {
      const url = '/auth/me';

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching current user profile:', error);
      throw handleError(error, 'Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      const url = '/auth/profile';

      return await this._makeApiCall(
        this.authService.api.put,
        url,
        profileData
      );
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw handleError(error, 'Failed to update profile');
    }
  }

  /**
   * Get current agent information
   */
  async getCurrentAgent() {
    try {
      const url = `/v1/inbox/agents/me`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching current agent:', error);
      throw handleError(error, 'Failed to fetch agent information');
    }
  }

  /**
   * Update agent availability status
   */
  async updateAvailability(availabilityData) {
    try {
      const url = `/v1/inbox/agents/me/availability`;

      return await this._makeApiCall(
        this.authService.api.put,
        url,
        availabilityData
      );
    } catch (error) {
      console.error('❌ Error updating availability:', error);
      throw handleError(error, 'Failed to update availability');
    }
  }

  /**
   * Get agent statistics
   */
  async getAgentStatistics(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);

      const url = `/v1/inbox/agents/me/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching agent statistics:', error);
      throw handleError(error, 'Failed to fetch agent statistics');
    }
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const url = `/v1/inbox/agents/me/avatar`;

      return await this._makeApiCall(
        this.authService.api.post,
        url,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      throw handleError(error, 'Failed to upload avatar');
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData) {
    try {
      const url = '/auth/change-password';

      return await this._makeApiCall(
        this.authService.api.post,
        url,
        passwordData
      );
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw handleError(error, 'Failed to change password');
    }
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences() {
    try {
      const url = `/v1/inbox/agents/me/notifications`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching notification preferences:', error);
      throw handleError(error, 'Failed to fetch notification preferences');
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences) {
    try {
      const url = `/v1/inbox/agents/me/notifications`;

      return await this._makeApiCall(
        this.authService.api.put,
        url,
        preferences
      );
    } catch (error) {
      console.error('❌ Error updating notification preferences:', error);
      throw handleError(error, 'Failed to update notification preferences');
    }
  }

  /**
   * Get personal templates
   */
  async getPersonalTemplates(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.page) queryParams.append('page', params.page);

      const url = `/v1/inbox/agents/me/templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching personal templates:', error);
      throw handleError(error, 'Failed to fetch personal templates');
    }
  }

  /**
   * Create personal template
   */
  async createPersonalTemplate(templateData) {
    try {
      const url = `/v1/inbox/agents/me/templates`;

      return await this._makeApiCall(
        this.authService.api.post,
        url,
        templateData
      );
    } catch (error) {
      console.error('❌ Error creating personal template:', error);
      throw handleError(error, 'Failed to create personal template');
    }
  }

  /**
   * Update personal template
   */
  async updatePersonalTemplate(templateId, templateData) {
    try {
      const url = `/v1/inbox/agents/me/templates/${templateId}`;

      return await this._makeApiCall(
        this.authService.api.put,
        url,
        templateData
      );
    } catch (error) {
      console.error('❌ Error updating personal template:', error);
      throw handleError(error, 'Failed to update personal template');
    }
  }

  /**
   * Delete personal template
   */
  async deletePersonalTemplate(templateId) {
    try {
      const url = `/v1/inbox/agents/me/templates/${templateId}`;

      return await this._makeApiCall(
        this.authService.api.delete,
        url
      );
    } catch (error) {
      console.error('❌ Error deleting personal template:', error);
      throw handleError(error, 'Failed to delete personal template');
    }
  }

  /**
   * Get UI preferences
   */
  async getUIPreferences() {
    try {
      const url = `/v1/inbox/agents/me/preferences`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error fetching UI preferences:', error);
      throw handleError(error, 'Failed to fetch UI preferences');
    }
  }

  /**
   * Update UI preferences
   */
  async updateUIPreferences(preferences) {
    try {
      const url = `/v1/inbox/agents/me/preferences`;

      return await this._makeApiCall(
        this.authService.api.put,
        url,
        preferences
      );
    } catch (error) {
      console.error('❌ Error updating UI preferences:', error);
      throw handleError(error, 'Failed to update UI preferences');
    }
  }

  /**
   * Export user data
   */
  async exportUserData(format = 'json') {
    try {
      const url = `/v1/inbox/agents/me/export?format=${format}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('❌ Error exporting user data:', error);
      throw handleError(error, 'Failed to export user data');
    }
  }

  /**
   * Helper method to format profile data
   */
  formatProfileData(data) {
    return {
      full_name: data.fullName || data.full_name,
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar || data.avatar_url,
      bio: data.bio,
      timezone: data.timezone,
      language: data.language,
      notifications: data.notifications || {}
    };
  }

  /**
   * Helper method to format availability data
   */
  formatAvailabilityData(data) {
    return {
      is_available: data.isAvailable !== undefined ? data.isAvailable : data.is_available,
      status: data.status,
      away_message: data.awayMessage || data.away_message,
      max_concurrent_chats: data.maxConcurrentChats || data.max_concurrent_chats,
      working_hours: data.workingHours || data.working_hours,
      working_days: data.workingDays || data.working_days
    };
  }

  /**
   * Helper method to format notification preferences
   */
  formatNotificationPreferences(data) {
    return {
      new_message: data.newMessage || data.new_message || {},
      session_assigned: data.sessionAssigned || data.session_assigned || {},
      urgent_message: data.urgentMessage || data.urgent_message || {},
      team_mention: data.teamMention || data.team_mention || {},
      system_alert: data.systemAlert || data.system_alert || {},
      sound_volume: data.soundVolume || data.sound_volume || 75,
      quiet_hours: data.quietHours || data.quiet_hours || {},
      email_digest: data.emailDigest || data.email_digest || {}
    };
  }

  /**
   * Helper method to format template data
   */
  formatTemplateData(data) {
    return {
      title: data.title,
      category: data.category,
      content: data.content,
      tags: Array.isArray(data.tags) ? data.tags : (data.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag)
    };
  }

  /**
   * Helper method to format UI preferences
   */
  formatUIPreferences(data) {
    return {
      theme: data.theme || 'light',
      language: data.language || 'id',
      font_size: data.fontSize || data.font_size || 'medium',
      density: data.density || 'comfortable',
      show_avatars: data.showAvatars !== undefined ? data.showAvatars : data.show_avatars !== undefined ? data.show_avatars : true,
      show_timestamps: data.showTimestamps !== undefined ? data.showTimestamps : data.show_timestamps !== undefined ? data.show_timestamps : true,
      auto_refresh: data.autoRefresh !== undefined ? data.autoRefresh : data.auto_refresh !== undefined ? data.auto_refresh : true,
      refresh_interval: data.refreshInterval || data.refresh_interval || 30,
      chat_layout: data.chatLayout || data.chat_layout || 'bubbles',
      sidebar_collapsed: data.sidebarCollapsed !== undefined ? data.sidebarCollapsed : data.sidebar_collapsed !== undefined ? data.sidebar_collapsed : false
    };
  }
}

// Create and export singleton instance
const agentProfileService = new AgentProfileService();
export default agentProfileService;
