import api from './api';

class ClientManagementService {
  /**
   * Get all organizations with pagination, sorting, and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.per_page - Items per page (default: 15)
   * @param {string} params.status - Filter by status (active, trial, suspended, etc.)
   * @param {string} params.sort_by - Sort field (created_at, name, etc.)
   * @param {string} params.sort_order - Sort order (asc, desc)
   * @param {string} params.search - Search term
   * @param {string} params.business_type - Filter by business type
   * @param {string} params.industry - Filter by industry
   * @param {string} params.company_size - Filter by company size
   */
  async getOrganizations(params = {}) {
    try {

      // Set default parameters
      const defaultParams = {
        page: 1,
        per_page: 15,
        status: 'active',
        sort_by: 'created_at',
        sort_order: 'desc',
        ...params
      };

      const response = await api.get('/v1/organizations', { params: defaultParams });

      // Handle different response structures from backend
      const responseData = response.data;

      let organizationsData, paginationData;

      // Handle different response structures from backend
      if (responseData.success && responseData.data) {
        // Success response with data
        if (Array.isArray(responseData.data)) {
          organizationsData = responseData.data;
          paginationData = responseData.pagination || { total: responseData.data.length, last_page: 1, current_page: 1 };
        } else if (responseData.data.data && Array.isArray(responseData.data.data)) {
          organizationsData = responseData.data.data;
          paginationData = responseData.data.pagination || responseData.pagination || { total: responseData.data.data.length, last_page: 1, current_page: 1 };
        } else {
          organizationsData = [];
          paginationData = { total: 0, last_page: 1, current_page: 1 };
        }
      } else if (responseData.data && responseData.pagination) {
        // Custom pagination response with nested pagination object
        organizationsData = responseData.data;
        paginationData = responseData.pagination;
      } else if (responseData.data && responseData.total) {
        // Standard Laravel pagination response
        organizationsData = responseData.data;
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
        organizationsData = responseData;
        paginationData = { total: responseData.length, last_page: 1, current_page: 1 };
      } else {
        // Fallback - check for organizations key
        organizationsData = responseData.organizations || [];
        paginationData = responseData.pagination || { total: 0, last_page: 1, current_page: 1 };
      }

      // Transform organizations data to frontend format
      const transformedOrganizations = Array.isArray(organizationsData)
        ? organizationsData.map(org => this.transformOrganizationDataForFrontend(org))
        : [];


      // Check if we have valid data
      if (!Array.isArray(organizationsData) || organizationsData.length === 0) {
        // Silently handle invalid data format
      }

      return {
        success: true,
        data: {
          data: transformedOrganizations,
          pagination: paginationData
        },
        message: responseData.message || 'Organizations retrieved successfully'
      };
    } catch (error) {

      return this.handleError(error, 'Failed to fetch organizations');
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id) {
    try {
      const response = await api.get(`/v1/organizations/${id}`);

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch organization');
    }
  }

  /**
   * Update organization status
   */
  async updateOrganizationStatus(id, status) {
    try {
      const response = await api.patch(`/v1/organizations/${id}/status`, { status });

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update organization status');
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStatistics() {
    try {
      console.log('Fetching organization statistics...');
      const response = await api.get('/v1/organizations/statistics');
      console.log('Statistics API response:', response);

      const statisticsData = response.data.data || response.data;
      console.log('Processed statistics data:', statisticsData);

      return {
        success: true,
        data: statisticsData,
        message: response.data.message || 'Statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Statistics API error:', error);
      return this.handleError(error, 'Failed to fetch organization statistics');
    }
  }

  /**
   * Get organization analytics
   */
  async getOrganizationAnalytics(params = {}) {
    try {
      console.log('Fetching organization analytics...', params);
      const response = await api.get('/v1/organizations/analytics', { params });
      console.log('Analytics API response:', response);

      const analyticsData = response.data.data || response.data;
      console.log('Processed analytics data:', analyticsData);

      return {
        success: true,
        data: analyticsData,
        message: response.data.message || 'Analytics retrieved successfully'
      };
    } catch (error) {
      console.error('Analytics API error:', error);
      return this.handleError(error, 'Failed to fetch organization analytics');
    }
  }

  /**
   * Get organizations by status
   */
  async getOrganizationsByStatus(status) {
    try {
      const response = await api.get(`/v1/organizations/status/${status}`);

      const organizationsData = response.data.data || response.data;
      const transformedOrganizations = Array.isArray(organizationsData)
        ? organizationsData.map(org => this.transformOrganizationDataForFrontend(org))
        : [];

      return {
        success: true,
        data: transformedOrganizations,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to fetch organizations by status');
    }
  }

  /**
   * Search organizations
   */
  async searchOrganizations(searchTerm, filters = {}) {
    try {

      const params = {
        search: searchTerm,
        ...filters
      };

      const response = await api.get('/v1/organizations', { params });

      const responseData = response.data;
      const organizationsData = responseData.data || responseData.organizations || responseData || [];
      const transformedOrganizations = Array.isArray(organizationsData)
        ? organizationsData.map(org => this.transformOrganizationDataForFrontend(org))
        : [];

      return {
        success: true,
        data: transformedOrganizations,
        message: response.data.message || 'Search completed successfully'
      };
    } catch (error) {
      return this.handleError(error, 'Failed to search organizations');
    }
  }

  /**
   * Create new organization
   */
  async createOrganization(organizationData) {
    try {

      const transformedData = this.transformOrganizationDataForBackend(organizationData);

      const response = await api.post('/v1/organizations', transformedData);

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create organization');
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(id, organizationData) {
    try {

      const transformedData = this.transformOrganizationDataForBackend(organizationData);

      const response = await api.put(`/v1/organizations/${id}`, transformedData);

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to update organization');
    }
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id) {
    try {
      const response = await api.delete(`/v1/organizations/${id}`);

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error, 'Failed to delete organization');
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
   * Transform frontend organization data to backend format
   */
  transformOrganizationDataForBackend(organizationData) {
    return {
      name: organizationData.name,
      display_name: organizationData.displayName || organizationData.display_name,
      email: organizationData.email,
      phone: organizationData.phone,
      address: organizationData.address,
      website: organizationData.website,
      tax_id: organizationData.taxId || organizationData.tax_id,
      business_type: organizationData.businessType || organizationData.business_type,
      industry: organizationData.industry,
      company_size: organizationData.companySize || organizationData.company_size,
      timezone: organizationData.timezone || 'Asia/Jakarta',
      locale: organizationData.locale || 'id',
      currency: organizationData.currency || 'IDR',
      subscription_plan_id: organizationData.subscriptionPlanId || organizationData.subscription_plan_id,
      subscription_status: organizationData.subscriptionStatus || organizationData.subscription_status || 'trial',
      trial_ends_at: organizationData.trialEndsAt || organizationData.trial_ends_at,
      subscription_starts_at: organizationData.subscriptionStartsAt || organizationData.subscription_starts_at,
      subscription_ends_at: organizationData.subscriptionEndsAt || organizationData.subscription_ends_at,
      billing_cycle: organizationData.billingCycle || organizationData.billing_cycle,
      theme_config: organizationData.themeConfig || organizationData.theme_config,
      branding_config: organizationData.brandingConfig || organizationData.branding_config,
      feature_flags: organizationData.featureFlags || organizationData.feature_flags,
      ui_preferences: organizationData.uiPreferences || organizationData.ui_preferences,
      business_hours: organizationData.businessHours || organizationData.business_hours,
      contact_info: organizationData.contactInfo || organizationData.contact_info,
      social_media: organizationData.socialMedia || organizationData.social_media,
      security_settings: organizationData.securitySettings || organizationData.security_settings,
      api_enabled: organizationData.apiEnabled || organizationData.api_enabled,
      webhook_url: organizationData.webhookUrl || organizationData.webhook_url,
      webhook_secret: organizationData.webhookSecret || organizationData.webhook_secret,
      settings: organizationData.settings,
      metadata: organizationData.metadata,
      status: organizationData.status || 'active'
    };
  }

  /**
   * Transform backend organization data to frontend format
   */
  transformOrganizationDataForFrontend(organizationData) {

    return {
      id: organizationData.id,
      orgCode: organizationData.org_code,
      name: organizationData.name,
      displayName: organizationData.display_name,
      email: organizationData.email,
      phone: organizationData.phone,
      address: organizationData.address,
      website: organizationData.website,
      taxId: organizationData.tax_id,
      businessType: organizationData.business_type,
      industry: organizationData.industry,
      companySize: organizationData.company_size,
      timezone: organizationData.timezone,
      locale: organizationData.locale,
      currency: organizationData.currency,
      subscriptionPlan: organizationData.subscription_plan,
      subscriptionPlanId: organizationData.subscription_plan_id,
      subscriptionStatus: organizationData.subscription_status,
      trialEndsAt: organizationData.trial_ends_at,
      subscriptionStartsAt: organizationData.subscription_starts_at,
      subscriptionEndsAt: organizationData.subscription_ends_at,
      billingCycle: organizationData.billing_cycle,
      currentUsage: organizationData.current_usage,
      themeConfig: organizationData.theme_config,
      brandingConfig: organizationData.branding_config,
      featureFlags: organizationData.feature_flags,
      uiPreferences: organizationData.ui_preferences,
      businessHours: organizationData.business_hours,
      contactInfo: organizationData.contact_info,
      socialMedia: organizationData.social_media,
      securitySettings: organizationData.security_settings,
      apiEnabled: organizationData.api_enabled,
      webhookUrl: organizationData.webhook_url,
      webhookSecret: organizationData.webhook_secret,
      settings: organizationData.settings,
      metadata: organizationData.metadata,
      status: organizationData.status,
      users: organizationData.users || [],
      usersCount: organizationData.users?.length || 0,
      agentsCount: organizationData.agents_count || 0,
      messagesSent: organizationData.messages_sent || 0,
      createdAt: organizationData.created_at,
      updatedAt: organizationData.updated_at,
      deletedAt: organizationData.deleted_at
    };
  }

  /**
   * Get client analytics
   * @param {Object} params - Query parameters
   * @param {string} params.time_range - Time range for analytics (7d, 30d, 90d, 1y)
   */
  async getAnalytics(params = {}) {
    try {

      const response = await api.get('/v1/organizations/analytics', { params });

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to get analytics'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get analytics'
      };
    }
  }
}

export default new ClientManagementService();
