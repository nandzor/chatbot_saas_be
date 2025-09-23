/* eslint-disable no-console */
import { authService } from './AuthService';
import { handleError } from '@/utils/errorHandler';

class BotPersonalityService {
  constructor() {
    this.authService = authService;
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
      // Always try to get fresh user data to ensure we have the latest organization_id
      const user = await this.authService.getCurrentUser();
      const organizationId = user?.organization_id || user?.organization?.id || user?.org_id || user?.organizationId;

      if (!organizationId) {
        throw new Error('Organization ID not found. Please ensure you are logged in and have an organization assigned.');
      }

      const response = await this.authService.api.request({
        method,
        url: `/v1${endpoint}`,
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
   * Get list of bot personalities
   */
  async getList(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/bot-personalities', null, { params });
      return response;
    } catch (error) {
      console.error('❌ Error fetching bot personalities:', error);
      throw handleError(error, 'Failed to fetch bot personalities');
    }
  }

  /**
   * Get bot personality by ID
   */
  async getById(id) {
    try {
      const response = await this._makeApiCall('GET', `/bot-personalities/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Error fetching bot personality:', error);
      throw handleError(error, 'Failed to fetch bot personality');
    }
  }

  /**
   * Create new bot personality
   */
  async create(data) {
    try {
      const response = await this._makeApiCall('POST', '/bot-personalities', data);
      return response;
    } catch (error) {
      console.error('❌ Error creating bot personality:', error);
      throw handleError(error, 'Failed to create bot personality');
    }
  }

  /**
   * Update bot personality
   */
  async update(id, data) {
    try {
      const response = await this._makeApiCall('PUT', `/bot-personalities/${id}`, data);
      return response;
    } catch (error) {
      console.error('❌ Error updating bot personality:', error);
      throw handleError(error, 'Failed to update bot personality');
    }
  }

  /**
   * Delete bot personality
   */
  async delete(id) {
    try {
      const response = await this._makeApiCall('DELETE', `/bot-personalities/${id}`);
      return response;
    } catch (error) {
      console.error('❌ Error deleting bot personality:', error);
      throw handleError(error, 'Failed to delete bot personality');
    }
  }

  /**
   * Get waha sessions for selection
   */
  async getWahaSessions(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/waha-sessions', null, { params });
      return response;
    } catch (error) {
      console.error('❌ Error fetching WhatsApp sessions:', error);
      throw handleError(error, 'Failed to fetch WhatsApp sessions');
    }
  }

  /**
   * Get knowledge base items for selection
   */
  async getKnowledgeBaseItems(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/knowledge-base', null, { params });
      return response;
    } catch (error) {
      console.error('❌ Error fetching knowledge base items:', error);
      throw handleError(error, 'Failed to fetch knowledge base items');
    }
  }

  /**
   * Get n8n workflows for selection
   */
  async getN8nWorkflows(params = {}) {
    try {
      const response = await this._makeApiCall('GET', '/n8n-workflows', null, { params });
      return response;
    } catch (error) {
      console.error('❌ Error fetching n8n workflows:', error);
      throw handleError(error, 'Failed to fetch n8n workflows');
    }
  }

  /**
   * Search bot personalities
   */
  async search(query, params = {}) {
    try {
      const searchParams = { ...params, search: query };
      const response = await this._makeApiCall('GET', '/bot-personalities', null, { params: searchParams });
      return response;
    } catch (error) {
      console.error('❌ Error searching bot personalities:', error);
      throw handleError(error, 'Failed to search bot personalities');
    }
  }

  /**
   * Filter bot personalities by status
   */
  async filterByStatus(status, params = {}) {
    try {
      const filterParams = { ...params, status };
      const response = await this._makeApiCall('GET', '/bot-personalities', null, { params: filterParams });
      return response;
    } catch (error) {
      console.error('❌ Error filtering bot personalities by status:', error);
      throw handleError(error, 'Failed to filter bot personalities by status');
    }
  }

  /**
   * Filter bot personalities by language
   */
  async filterByLanguage(language, params = {}) {
    try {
      const filterParams = { ...params, language };
      const response = await this._makeApiCall('GET', '/bot-personalities', null, { params: filterParams });
      return response;
    } catch (error) {
      console.error('❌ Error filtering bot personalities by language:', error);
      throw handleError(error, 'Failed to filter bot personalities by language');
    }
  }

  /**
   * Filter bot personalities by formality level
   */
  async filterByFormalityLevel(formalityLevel, params = {}) {
    try {
      const filterParams = { ...params, formality_level: formalityLevel };
      const response = await this._makeApiCall('GET', '/bot-personalities', null, { params: filterParams });
      return response;
    } catch (error) {
      console.error('❌ Error filtering bot personalities by formality level:', error);
      throw handleError(error, 'Failed to filter bot personalities by formality level');
    }
  }

  /**
   * Get bot personalities with n8n workflow
   */
  async getWithN8nWorkflow(params = {}) {
    try {
      const filterParams = { ...params, with_n8n_workflow: true };
      const response = await this._makeApiCall('GET', '/bot-personalities', null, { params: filterParams });
      return response;
    } catch (error) {
      console.error('❌ Error fetching bot personalities with n8n workflow:', error);
      throw handleError(error, 'Failed to fetch bot personalities with n8n workflow');
    }
  }

  /**
   * Get bot personalities with WhatsApp session
   */
  async getWithWahaSession(params = {}) {
    try {
      const filterParams = { ...params, with_waha_session: true };
      const response = await this._makeApiCall('GET', '/bot-personalities', null, { params: filterParams });
      return response;
    } catch (error) {
      console.error('❌ Error fetching bot personalities with WhatsApp session:', error);
      throw handleError(error, 'Failed to fetch bot personalities with WhatsApp session');
    }
  }

  /**
   * Get bot personalities with knowledge base item
   */
  async getWithKnowledgeBaseItem(params = {}) {
    try {
      const filterParams = { ...params, with_knowledge_base_item: true };
      const response = await this._makeApiCall('GET', '/bot-personalities', null, { params: filterParams });
      return response;
    } catch (error) {
      console.error('❌ Error fetching bot personalities with knowledge base item:', error);
      throw handleError(error, 'Failed to fetch bot personalities with knowledge base item');
    }
  }

  /**
   * Set bot personality as default
   */
  async setAsDefault(id) {
    try {
      const response = await this._makeApiCall('PATCH', `/bot-personalities/${id}/set-default`);
      return response;
    } catch (error) {
      console.error('❌ Error setting bot personality as default:', error);
      throw handleError(error, 'Failed to set bot personality as default');
    }
  }

  /**
   * Duplicate bot personality
   */
  async duplicate(id, newName = null) {
    try {
      const data = newName ? { name: newName } : {};
      const response = await this._makeApiCall('POST', `/bot-personalities/${id}/duplicate`, data);
      return response;
    } catch (error) {
      console.error('❌ Error duplicating bot personality:', error);
      throw handleError(error, 'Failed to duplicate bot personality');
    }
  }

  /**
   * Export bot personalities
   */
  async export(format = 'csv', params = {}) {
    try {
      const exportParams = { ...params, format };
      const response = await this._makeApiCall('GET', '/bot-personalities/export', null, {
        params: exportParams,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.error('❌ Error exporting bot personalities:', error);
      throw handleError(error, 'Failed to export bot personalities');
    }
  }

  /**
   * Get bot personality statistics
   */
  async getStatistics() {
    try {
      const response = await this._makeApiCall('GET', '/bot-personalities/statistics');
      return response;
    } catch (error) {
      console.error('❌ Error fetching bot personality statistics:', error);
      throw handleError(error, 'Failed to fetch bot personality statistics');
    }
  }
}

export default BotPersonalityService;
