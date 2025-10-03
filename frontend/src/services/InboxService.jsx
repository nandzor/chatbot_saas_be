/* eslint-disable no-console */
import { authService } from './AuthService';
import { handleError } from '@/utils/errorHandler';

class InboxService {
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
      console.log('✅ InboxService initialized successfully');
    } catch (error) {
      console.error('❌ InboxService initialization failed:', error);
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
      this.initializeService();
    }

    if (!this.isReady()) {
      throw new Error('InboxService failed to initialize within timeout period');
    }

    return true;
  }

  /**
   * Get service status for debugging
   */
  getServiceStatus() {
    return {
      initialized: this.initialized,
      authServiceExists: !!this.authService,
      authServiceApiExists: !!(this.authService && this.authService.api),
      authServiceRequestExists: !!(this.authService && this.authService.api && typeof this.authService.api.request === 'function'),
      isReady: this.isReady(),
      timestamp: new Date().toISOString()
    };
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
   * Helper method to make API calls using AuthService
   */
  async _makeApiCall(method, endpoint, data = null, config = {}) {
    try {
      // Wait for service to be ready
      await this.waitForReady();

      // Verify authService and its API instance
      if (!this.authService || !this.authService.api) {
        throw new Error('Authentication service is not available. Please log in again.');
      }

      // Double-check that the request method exists
      if (typeof this.authService.api.request !== 'function') {
        throw new Error('API request method is not available. Please refresh the page.');
      }

      // Always try to get fresh user data to ensure we have the latest organization_id
      const user = await this.authService.getCurrentUser();
      const organizationId = user?.organization_id || user?.organization?.id || user?.org_id || user?.organizationId;

      if (!organizationId) {
        throw new Error('Organization ID not found. Please ensure you are logged in and have an organization assigned.');
      }

      // Handle different endpoint prefixes
      // Since AuthService baseURL already includes '/api', we only need to add '/v1' for API endpoints
      const url = endpoint.startsWith('/waha/') ? endpoint :
                  endpoint.startsWith('/api/') ? endpoint :
                  endpoint.startsWith('/v1/') ? endpoint :
                  `/v1${endpoint}`;

      const response = await this.authService.api.request({
        method,
        url,
        data,
        ...config
      });

      // Ensure we return the response data properly
      return response.data || response;
    } catch (error) {
      // Re-throw with more specific error handling
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      throw error;
    }
  }

  /**
   * Get inbox statistics
   */
  async getStatistics(filters = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/statistics', null, { params: filters });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching inbox statistics:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch inbox statistics')
      };
    }
  }

  /**
   * Get all sessions with pagination and filters
   */
  async getSessions(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/sessions', null, {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 15,
          sort_by: params.sort_by || 'last_activity_at',
          sort_direction: params.sort_direction || 'desc',
          ...params.filters
        }
      });
      return response; // API already returns { success: true, data: [...], pagination: {...} }
    } catch (error) {
      console.error('❌ Error fetching sessions:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch sessions')
      };
    }
  }

  /**
   * Get active sessions
   */
  async getActiveSessions(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/sessions/active', null, {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 15,
          sort_by: params.sort_by || 'last_activity_at',
          sort_direction: params.sort_direction || 'desc',
          ...params.filters
        }
      });
      return response; // API already returns { success: true, data: [...], pagination: {...} }
    } catch (error) {
      console.error('❌ Error fetching active sessions:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch active sessions')
      };
    }
  }

  /**
   * Get pending sessions
   */
  async getPendingSessions(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/sessions/pending', null, {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 15,
          sort_by: params.sort_by || 'created_at',
          sort_direction: params.sort_direction || 'asc',
          ...params.filters
        }
      });
      return response; // API already returns { success: true, data: [...], pagination: {...} }
    } catch (error) {
      console.error('❌ Error fetching pending sessions:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch pending sessions')
      };
    }
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId) {
    try {
      const response = await this._makeApiCall('GET', `/v1/inbox/sessions/${sessionId}`);
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching session:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch session')
      };
    }
  }

  /**
   * Get session messages
   */
  async getSessionMessages(sessionId, params = {}) {
    try {
      const response = await this._makeApiCall('GET', `/v1/inbox/sessions/${sessionId}/messages`, null, {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 50,
          sort_by: params.sort_by || 'created_at',
          sort_direction: params.sort_direction || 'desc',
          ...params.filters
        }
      });
      return response; // API already returns { success: true, data: [...], pagination: {...} }
    } catch (error) {
      console.error('❌ Error fetching session messages:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch session messages')
      };
    }
  }

  /**
   * Get session analytics
   */
  async getSessionAnalytics(sessionId, params = {}) {
    try {
      const response = await this._makeApiCall('GET', `/v1/inbox/sessions/${sessionId}/analytics`, null, {
        params: {
          period: params.period || '7d',
          ...params.filters
        }
      });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching session analytics:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch session analytics')
      };
    }
  }

  /**
   * Update session status
   */
  async updateSessionStatus(sessionId, status) {
    try {
      const response = await this._makeApiCall('PATCH', `/v1/inbox/sessions/${sessionId}/status`, { status });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error updating session status:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to update session status')
      };
    }
  }

  /**
   * Assign session to agent
   */
  async assignSession(sessionId, agentId) {
    try {
      const response = await this._makeApiCall('POST', `/v1/inbox/sessions/${sessionId}/assign`, { agent_id: agentId });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error assigning session:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to assign session')
      };
    }
  }

  /**
   * Unassign session
   */
  async unassignSession(sessionId) {
    try {
      const response = await this._makeApiCall('POST', `/v1/inbox/sessions/${sessionId}/unassign`);
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error unassigning session:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to unassign session')
      };
    }
  }

  /**
   * Send message to session
   */
  async sendMessage(sessionId, message, type = 'text') {
    try {
      const response = await this._makeApiCall('POST', `/v1/inbox/sessions/${sessionId}/messages`, {
        content: message,
        message_type: type
      });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to send message')
      };
    }
  }

  /**
   * Export inbox data
   */
  async exportData(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/export', null, {
        params: {
          format: params.format || 'csv',
          ...params.filters
        }
      });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to export data')
      };
    }
  }

  // Bot Personality related methods

  /**
   * Get bot personalities for inbox
   */
  async getBotPersonalities(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/bot-personalities', null, { params });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching bot personalities:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch bot personalities')
      };
    }
  }

  /**
   * Get available bot personalities for session assignment
   */
  async getAvailableBotPersonalities(filters = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/bot-personalities/available', null, { params: filters });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching available bot personalities:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch available bot personalities')
      };
    }
  }

  /**
   * Assign bot personality to session
   */
  async assignBotPersonality(sessionId, personalityId) {
    try {
      const response = await this._makeApiCall('POST', `/v1/inbox/sessions/${sessionId}/assign-personality`, {
        personality_id: personalityId
      });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error assigning bot personality:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to assign bot personality')
      };
    }
  }

  /**
   * Generate AI response using bot personality
   */
  async generateAiResponse(sessionId, message, personalityId, context = {}) {
    try {
      const response = await this._makeApiCall('POST', `/v1/inbox/sessions/${sessionId}/generate-ai-response`, {
        message: message,
        personality_id: personalityId,
        context: context
      });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error generating AI response:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to generate AI response')
      };
    }
  }

  /**
   * Get bot personality statistics
   */
  async getBotPersonalityStatistics(filters = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/bot-personalities/statistics', null, { params: filters });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching bot personality statistics:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch bot personality statistics')
      };
    }
  }

  /**
   * Get bot personality performance
   */
  async getBotPersonalityPerformance(personalityId, days = 30) {
    try {
      const response = await this._makeApiCall('GET', `/v1/inbox/bot-personalities/${personalityId}/performance`, null, {
        params: { days }
      });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching bot personality performance:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch bot personality performance')
      };
    }
  }

  /**
   * Get inbox settings
   */
  async getSettings() {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/settings');
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching inbox settings:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch inbox settings')
      };
    }
  }

  /**
   * Update inbox settings
   */
  async updateSettings(settings) {
    try {
      const response = await this._makeApiCall('PUT', '/v1/inbox/settings', settings);
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error updating inbox settings:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to update inbox settings')
      };
    }
  }

  /**
   * Get inbox agents
   */
  async getAgents(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/agents', null, { params });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch agents')
      };
    }
  }

  /**
   * Get inbox customers
   */
  async getCustomers(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/customers', null, { params });
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching customers:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch customers')
      };
    }
  }

  /**
   * Get session filters
   */
  async getSessionFilters() {
    try {
      const response = await this._makeApiCall('GET', '/v1/inbox/session-filters');
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error fetching session filters:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to fetch session filters')
      };
    }
  }

  /**
   * Transfer session to another agent
   */
  async transferSession(sessionId, transferData) {
    try {
      const response = await this._makeApiCall('POST', `/v1/inbox/sessions/${sessionId}/transfer`, transferData);
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error transferring session:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to transfer session')
      };
    }
  }

  /**
   * End session
   */
  async endSession(sessionId, endData) {
    try {
      const response = await this._makeApiCall('POST', `/v1/inbox/sessions/${sessionId}/end`, endData);
      return response; // API already returns { success: true, data: {...} }
    } catch (error) {
      console.error('❌ Error ending session:', error);
      return {
        success: false,
        error: handleError(error, 'Failed to end session')
      };
    }
  }
}

// Create and export a singleton instance
const inboxService = new InboxService();

export { inboxService };
export default inboxService;
