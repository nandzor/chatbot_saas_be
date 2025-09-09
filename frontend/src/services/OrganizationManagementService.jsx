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
      console.log('🔍 OrganizationManagementService: Getting organizations with params:', params);

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

      console.log('✅ OrganizationManagementService: Organizations fetched successfully:', response.data);

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
      console.error('❌ OrganizationManagementService: Error fetching organizations:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organization by ID:', id);

      const params = includes.length > 0 ? { include: includes.join(',') } : {};

      const response = await api.get(`/v1/organizations/${id}`, {
        params
      });

      console.log('✅ OrganizationManagementService: Organization fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching organization:', error);
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
      console.log('🔍 OrganizationManagementService: Creating organization:', organizationData);

      const response = await api.post('/v1/organizations', organizationData);

      console.log('✅ OrganizationManagementService: Organization created successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error creating organization:', error);
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
      console.log('🔍 OrganizationManagementService: Updating organization:', id, organizationData);

      const response = await api.put(`/v1/organizations/${id}`, organizationData);

      console.log('✅ OrganizationManagementService: Organization updated successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error updating organization:', error);
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
      console.log('🔍 OrganizationManagementService: Deleting organization:', id);

      const response = await api.delete(`/v1/organizations/${id}`);

      console.log('✅ OrganizationManagementService: Organization deleted successfully:', response.data);

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error deleting organization:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organization statistics');

      const response = await api.get('/v1/organizations/statistics');

      console.log('✅ OrganizationManagementService: Statistics fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching statistics:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organization users:', id);

      const response = await api.get(`/v1/organizations/${id}/users`, {
        params
      });

      console.log('✅ OrganizationManagementService: Organization users fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching organization users:', error);
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
      console.log('🔍 OrganizationManagementService: Adding user to organization:', organizationId, userData);

      const response = await api.post(`/v1/organizations/${organizationId}/users`, userData);

      console.log('✅ OrganizationManagementService: User added successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error adding user:', error);
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
      console.log('🔍 OrganizationManagementService: Removing user from organization:', organizationId, userId);

      const response = await api.delete(`/v1/organizations/${organizationId}/users/${userId}`);

      console.log('✅ OrganizationManagementService: User removed successfully:', response.data);

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error removing user:', error);
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
      console.log('🔍 OrganizationManagementService: Updating organization subscription:', id, subscriptionData);

      const response = await api.patch(`/v1/organizations/${id}/subscription`, subscriptionData);

      console.log('✅ OrganizationManagementService: Subscription updated successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error updating subscription:', error);
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
      console.log('🔍 OrganizationManagementService: Updating organization status:', id, status);

      const response = await api.patch(`/v1/organizations/${id}/status`, { status });

      console.log('✅ OrganizationManagementService: Status updated successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error updating status:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organization activity logs:', id);

      const response = await api.get(`/v1/organizations/${id}/activity-logs`, {
        params
      });

      console.log('✅ OrganizationManagementService: Activity logs fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination || null
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching activity logs:', error);
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
      console.log('🔍 OrganizationManagementService: Exporting organizations:', params);

      const response = await api.get('/v1/organizations/export', {
        params,
        responseType: 'blob'
      });

      console.log('✅ OrganizationManagementService: Organizations exported successfully');

      return {
        success: true,
        data: response.data,
        filename: `organizations_${new Date().toISOString().split('T')[0]}.xlsx`
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error exporting organizations:', error);
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
      console.log('🔍 OrganizationManagementService: Importing organizations');

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/v1/organizations/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ OrganizationManagementService: Organizations imported successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error importing organizations:', error);
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
      console.log('🔍 OrganizationManagementService: Performing bulk action:', actionData);

      const response = await api.post('/v1/organizations/bulk-action', actionData);

      console.log('✅ OrganizationManagementService: Bulk action completed successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error performing bulk action:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organizations by business type:', businessType);

      const response = await api.get(`/v1/organizations/business-type/${businessType}`);

      console.log('✅ OrganizationManagementService: Organizations by business type fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching organizations by business type:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organizations by industry:', industry);

      const response = await api.get(`/v1/organizations/industry/${industry}`);

      console.log('✅ OrganizationManagementService: Organizations by industry fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching organizations by industry:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organizations by company size:', companySize);

      const response = await api.get(`/v1/organizations/company-size/${companySize}`);

      console.log('✅ OrganizationManagementService: Organizations by company size fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching organizations by company size:', error);
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
      console.log('🔍 OrganizationManagementService: Getting active organizations');

      const response = await api.get('/v1/organizations/active');

      console.log('✅ OrganizationManagementService: Active organizations fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching active organizations:', error);
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
      console.log('🔍 OrganizationManagementService: Getting trial organizations');

      const response = await api.get('/v1/organizations/trial');

      console.log('✅ OrganizationManagementService: Trial organizations fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching trial organizations:', error);
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
      console.log('🔍 OrganizationManagementService: Getting expired trial organizations');

      const response = await api.get('/v1/organizations/expired-trial');

      console.log('✅ OrganizationManagementService: Expired trial organizations fetched successfully:', response.data);

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error fetching expired trial organizations:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organization settings:', organizationId);

      const response = await api.get(`/v1/organizations/${organizationId}/settings`);

      console.log('✅ OrganizationManagementService: Settings retrieved successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error getting settings:', error);
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
      console.log('🔍 OrganizationManagementService: Saving organization settings:', organizationId, settings);

      const response = await api.put(`/v1/organizations/${organizationId}/settings`, settings);

      console.log('✅ OrganizationManagementService: Settings saved successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error saving settings:', error);
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
      console.log('🔍 OrganizationManagementService: Testing webhook:', organizationId, webhookUrl);

      const response = await api.post(`/v1/organizations/${organizationId}/webhook/test`, {
        url: webhookUrl
      });

      console.log('✅ OrganizationManagementService: Webhook test successful:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error testing webhook:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organization analytics:', organizationId, params);

      const response = await api.get(`/v1/organizations/${organizationId}/analytics`, { params });

      console.log('✅ OrganizationManagementService: Analytics retrieved successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error getting analytics:', error);
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
      console.log('🔍 OrganizationManagementService: Getting organization roles:', organizationId);

      const response = await api.get(`/v1/organizations/${organizationId}/roles`);

      console.log('✅ OrganizationManagementService: Roles retrieved successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error getting roles:', error);
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
      console.log('🔍 OrganizationManagementService: Getting permissions');

      const response = await api.get('/v1/permissions');

      console.log('✅ OrganizationManagementService: Permissions retrieved successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error getting permissions:', error);
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
      console.log('🔍 OrganizationManagementService: Saving role permissions:', organizationId, roleId, permissions);

      const response = await api.put(`/v1/organizations/${organizationId}/roles/${roleId}/permissions`, {
        permissions
      });

      console.log('✅ OrganizationManagementService: Role permissions saved successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error saving role permissions:', error);
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
      console.log('🔍 OrganizationManagementService: Saving all permissions:', organizationId, rolePermissions);

      const response = await api.put(`/v1/organizations/${organizationId}/permissions`, {
        rolePermissions
      });

      console.log('✅ OrganizationManagementService: All permissions saved successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error saving all permissions:', error);
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
      console.log('🔍 OrganizationManagementService: Updating user:', organizationId, userId, userData);

      const response = await api.put(`/v1/organizations/${organizationId}/users/${userId}`, userData);

      console.log('✅ OrganizationManagementService: User updated successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error updating user:', error);
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
      console.log('🔍 OrganizationManagementService: Toggling user status:', organizationId, userId, status);

      const response = await api.patch(`/v1/organizations/${organizationId}/users/${userId}/status`, {
        status
      });

      console.log('✅ OrganizationManagementService: User status toggled successfully:', response.data);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Error toggling user status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle user status'
      };
    }
  }
}

export default new OrganizationManagementService();
