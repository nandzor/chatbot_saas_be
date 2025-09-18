import api from './api';

class OrganizationManagementService {
  /**
   * Get all organizations with pagination, sorting, and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.per_page - Items per page (default: 15)
   * @param {string} params.status - Filter by status (active, trial, suspended, etc.)
   * @param {string} params.subscription_status - Filter by subscription status
   * @param {string} params.business_type - Filter by business type
   * @param {string} params.industry - Filter by industry
   * @param {string} params.company_size - Filter by company size
   * @param {string} params.sort_by - Sort field (created_at, name, etc.)
   * @param {string} params.sort_order - Sort order (asc, desc)
   * @param {string} params.search - Search term
   */
  async getOrganizations(params = {}) {
    try {

      // Set default parameters
      const defaultParams = {
        page: 1,
        per_page: 15,
        sort_by: 'created_at',
        sort_order: 'desc',
        ...params
      };

      const response = await api.get('/v1/organizations', {
        params: defaultParams
      });


      return {
        success: true,
        data: response.data.data,
        pagination: {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
          from: response.data.from,
          to: response.data.to
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organizations',
        data: []
      };
    }
  }

  /**
   * Get organization by ID
   * @param {string} id - Organization ID
   * @param {Array} includes - Relations to include
   */
  async getOrganizationById(id, includes = []) {
    try {

      const params = includes.length > 0 ? { include: includes.join(',') } : {};

      const response = await api.get(`/v1/organizations/${id}`, {
        params
      });


      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organization',
        data: null
      };
    }
  }

  /**
   * Create new organization
   * @param {Object} organizationData - Organization data
   */
  async createOrganization(organizationData) {
    try {

      const response = await api.post('/v1/organizations', organizationData);


      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create organization',
        data: null
      };
    }
  }

  /**
   * Update organization
   * @param {string} id - Organization ID
   * @param {Object} organizationData - Updated organization data
   */
  async updateOrganization(id, organizationData) {
    try {

      const response = await api.put(`/v1/organizations/${id}`, organizationData);


      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update organization',
        data: null
      };
    }
  }

  /**
   * Delete organization
   * @param {string} id - Organization ID
   */
  async deleteOrganization(id) {
    try {

      const response = await api.delete(`/v1/organizations/${id}`);


      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete organization',
      };
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStatistics() {
    try {

      const response = await api.get('/v1/organizations/statistics');


      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch statistics',
        data: {}
      };
    }
  }

  /**
   * Get organization users
   * @param {string} id - Organization ID
   * @param {Object} params - Query parameters
   */
  async getOrganizationUsers(id, params = {}) {
    try {

      const response = await api.get(`/v1/organizations/${id}/users`, {
        params
      });


      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organization users',
        data: []
      };
    }
  }

  /**
   * Add user to organization
   * @param {string} organizationId - Organization ID
   * @param {Object} userData - User data
   */
  async addUserToOrganization(organizationId, userData) {
    try {

      const response = await api.post(`/v1/organizations/${organizationId}/users`, userData);


      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add user to organization',
        data: null
      };
    }
  }

  /**
   * Remove user from organization
   * @param {string} organizationId - Organization ID
   * @param {string} userId - User ID
   */
  async removeUserFromOrganization(organizationId, userId) {
    try {

      const response = await api.delete(`/v1/organizations/${organizationId}/users/${userId}`);


      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove user from organization',
      };
    }
  }

  /**
   * Update organization subscription
   * @param {string} id - Organization ID
   * @param {Object} subscriptionData - Subscription data
   */
  async updateOrganizationSubscription(id, subscriptionData) {
    try {

      const response = await api.patch(`/v1/organizations/${id}/subscription`, subscriptionData);


      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update subscription',
        data: null
      };
    }
  }

  /**
   * Update organization status
   * @param {string} id - Organization ID
   * @param {string} status - New status
   */
  async updateOrganizationStatus(id, status) {
    try {

      const response = await api.patch(`/v1/organizations/${id}/status`, { status });


      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update organization status',
        data: null
      };
    }
  }

  /**
   * Get organization activity logs
   * @param {string} id - Organization ID
   * @param {Object} params - Query parameters
   */
  async getOrganizationActivityLogs(id, params = {}) {
    try {

      const response = await api.get(`/v1/organizations/${id}/activity-logs`, {
        params
      });


      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch activity logs',
        data: []
      };
    }
  }

  /**
   * Export organizations
   * @param {Object} params - Export parameters
   */
  async exportOrganizations(params = {}) {
    try {

      const response = await api.get('/v1/organizations/export', {
        params,
        responseType: 'blob'
      });


      return {
        success: true,
        data: response.data,
        filename: `organizations_${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export organizations',
        data: null
      };
    }
  }

  /**
   * Import organizations
   * @param {File} file - Import file
   */
  async importOrganizations(file) {
    try {

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/v1/organizations/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });


      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to import organizations',
        data: null
      };
    }
  }

  /**
   * Bulk action on organizations
   * @param {Object} actionData - Action data
   */
  async bulkAction(actionData) {
    try {

      const response = await api.post('/v1/organizations/bulk-action', actionData);


      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to perform bulk action',
        data: null
      };
    }
  }

  /**
   * Get organizations by business type
   * @param {string} businessType - Business type
   */
  async getOrganizationsByBusinessType(businessType) {
    try {

      const response = await api.get(`/v1/organizations/business-type/${businessType}`);


      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organizations by business type',
        data: []
      };
    }
  }

  /**
   * Get organizations by industry
   * @param {string} industry - Industry
   */
  async getOrganizationsByIndustry(industry) {
    try {

      const response = await api.get(`/v1/organizations/industry/${industry}`);


      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organizations by industry',
        data: []
      };
    }
  }

  /**
   * Get organizations by company size
   * @param {string} companySize - Company size
   */
  async getOrganizationsByCompanySize(companySize) {
    try {

      const response = await api.get(`/v1/organizations/company-size/${companySize}`);


      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organizations by company size',
        data: []
      };
    }
  }

  /**
   * Get active organizations
   */
  async getActiveOrganizations() {
    try {

      const response = await api.get('/v1/organizations/active');


      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch active organizations',
        data: []
      };
    }
  }

  /**
   * Get trial organizations
   */
  async getTrialOrganizations() {
    try {

      const response = await api.get('/v1/organizations/trial');


      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch trial organizations',
        data: []
      };
    }
  }

  /**
   * Get expired trial organizations
   */
  async getExpiredTrialOrganizations() {
    try {

      const response = await api.get('/v1/organizations/expired-trial');


      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch expired trial organizations',
        data: []
      };
    }
  }

  /**
   * Get organization settings
   */
  async getOrganizationSettings(organizationId) {
    try {

      const response = await api.get(`/v1/organizations/${organizationId}/settings`);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get organization settings'
      };
    }
  }

  /**
   * Save organization settings
   */
  async saveOrganizationSettings(organizationId, settings) {
    try {

      const response = await api.put(`/v1/organizations/${organizationId}/settings`, settings);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to save organization settings'
      };
    }
  }

  /**
   * Test webhook
   */
  async testWebhook(organizationId, webhookUrl) {
    try {

      const response = await api.post(`/v1/organizations/${organizationId}/webhook/test`, {
        webhook_url: webhookUrl
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Webhook test failed'
      };
    }
  }

  /**
   * Get organization analytics
   */
  async getOrganizationAnalytics(organizationId, params = {}) {
    try {

      const response = await api.get(`/v1/organizations/${organizationId}/analytics`, { params });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
    return {
        success: false,
        error: error.response?.data?.message || 'Failed to get organization analytics'
      };
    }
  }

  /**
   * Get organization roles
   */
  async getOrganizationRoles(organizationId) {
    try {

      const response = await api.get(`/v1/organizations/${organizationId}/roles`);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
    return {
        success: false,
        error: error.response?.data?.message || 'Failed to get organization roles'
      };
    }
  }

  /**
   * Get permissions
   */
  async getPermissions() {
    try {

      const response = await api.get('/v1/permissions');

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get permissions'
      };
    }
  }

  /**
   * Save role permissions
   */
  async saveRolePermissions(organizationId, roleId, permissions) {
    try {

      const response = await api.put(`/v1/organizations/${organizationId}/roles/${roleId}/permissions`, {
        permissions
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to save role permissions'
      };
    }
  }

  /**
   * Save all permissions
   */
  async saveAllPermissions(organizationId, rolePermissions) {
    try {

      const response = await api.put(`/v1/organizations/${organizationId}/permissions`, {
        rolePermissions
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to save all permissions'
      };
    }
  }

  /**
   * Update user
   */
  async updateUser(organizationId, userId, userData) {
    try {

      const response = await api.put(`/v1/organizations/${organizationId}/users/${userId}`, userData);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user'
      };
    }
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(organizationId, userId, status) {
    try {

      const response = await api.patch(`/v1/organizations/${organizationId}/users/${userId}/status`, {
        status
      });

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle user status'
      };
    }
  }
}

export default new OrganizationManagementService();
