import api from './api';

class OrganizationManagementService {
  /**
   * Get all organizations with pagination and filters
   */
  async getOrganizations(params = {}) {
    try {
      console.log('🔍 OrganizationManagementService: Getting organizations with params:', params);
      console.log('🔍 OrganizationManagementService: API base URL:', api.defaults.baseURL);

      const response = await api.get('/v1/organizations', { params });
      console.log('✅ OrganizationManagementService: Organizations retrieved successfully:', response.data);

      // Handle different response structures from backend
      const responseData = response.data;
      let organizationsData, paginationData;

      if (responseData.data && responseData.pagination) {
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
        // Fallback
        organizationsData = responseData.organizations || [];
        paginationData = responseData.pagination || { total: 0, last_page: 1, current_page: 1 };
      }

      // Transform organizations data to frontend format
      const transformedOrganizations = Array.isArray(organizationsData)
        ? organizationsData.map(org => this.transformOrganizationDataForFrontend(org))
        : [];

      console.log('🔍 OrganizationManagementService: Processed organizations data:', organizationsData);
      console.log('🔍 OrganizationManagementService: Transformed organizations data:', transformedOrganizations);
      console.log('🔍 OrganizationManagementService: Processed pagination data:', paginationData);

      return {
        success: true,
        data: {
          data: transformedOrganizations,
          pagination: paginationData
        },
        message: responseData.message || 'Organizations retrieved successfully'
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to get organizations:', error);
      console.error('❌ OrganizationManagementService: Error response:', error.response);
      console.error('❌ OrganizationManagementService: Error status:', error.response?.status);
      console.error('❌ OrganizationManagementService: Error data:', error.response?.data);

      return this.handleError(error, 'Failed to fetch organizations');
    }
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id) {
    try {
      console.log('🔍 OrganizationManagementService: Fetching organization by ID:', id);
      const response = await api.get(`/v1/organizations/${id}`);
      console.log('✅ OrganizationManagementService: Organization retrieved successfully:', response.data);

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to get organization:', error);
      return this.handleError(error, 'Failed to fetch organization');
    }
  }

  /**
   * Get organization by code
   */
  async getOrganizationByCode(orgCode) {
    try {
      console.log('🔍 OrganizationManagementService: Fetching organization by code:', orgCode);
      const response = await api.get(`/v1/organizations/code/${orgCode}`);
      console.log('✅ OrganizationManagementService: Organization retrieved successfully:', response.data);

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to get organization by code:', error);
      return this.handleError(error, 'Failed to fetch organization by code');
    }
  }

  /**
   * Create new organization
   */
  async createOrganization(organizationData) {
    try {
      console.log('🔍 OrganizationManagementService: Creating organization with data:', organizationData);

      const transformedData = this.transformOrganizationDataForBackend(organizationData);
      console.log('🔍 OrganizationManagementService: Transformed data for backend:', transformedData);

      const response = await api.post('/v1/organizations', transformedData);
      console.log('✅ OrganizationManagementService: Organization created successfully:', response.data);

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to create organization:', error);
      return this.handleError(error, 'Failed to create organization');
    }
  }

  /**
   * Update organization
   */
  async updateOrganization(id, organizationData) {
    try {
      console.log('🔍 OrganizationManagementService: Updating organization:', id, 'with data:', organizationData);

      const transformedData = this.transformOrganizationDataForBackend(organizationData);
      console.log('🔍 OrganizationManagementService: Transformed data for backend:', transformedData);

      const response = await api.put(`/v1/organizations/${id}`, transformedData);
      console.log('✅ OrganizationManagementService: Organization updated successfully:', response.data);

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to update organization:', error);
      return this.handleError(error, 'Failed to update organization');
    }
  }

  /**
   * Delete organization
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
      console.error('❌ OrganizationManagementService: Failed to delete organization:', error);
      return this.handleError(error, 'Failed to delete organization');
    }
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStatistics() {
    try {
      console.log('🔍 OrganizationManagementService: Fetching statistics from /v1/organizations/statistics');
      const response = await api.get('/v1/organizations/statistics');

      console.log('🔍 OrganizationManagementService: Raw API response:', response);
      console.log('🔍 OrganizationManagementService: Response data:', response.data);

      const statisticsData = response.data.data || response.data;
      console.log('🔍 OrganizationManagementService: Final statistics data:', statisticsData);

      return {
        success: true,
        data: statisticsData,
        message: response.data.message || 'Statistics retrieved successfully'
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to get statistics:', error);
      console.error('❌ OrganizationManagementService: Error response:', error.response);
      return this.handleError(error, 'Failed to fetch organization statistics');
    }
  }

  /**
   * Get organization users
   */
  async getOrganizationUsers(id) {
    try {
      console.log('🔍 OrganizationManagementService: Fetching users for organization:', id);
      const response = await api.get(`/v1/organizations/${id}/users`);
      console.log('🔍 OrganizationManagementService: Users response:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to get organization users:', error);
      return this.handleError(error, 'Failed to fetch organization users');
    }
  }

  /**
   * Add user to organization
   */
  async addUserToOrganization(organizationId, userId, role = 'member') {
    try {
      console.log('🔍 OrganizationManagementService: Adding user to organization:', { organizationId, userId, role });
      const response = await api.post(`/v1/organizations/${organizationId}/users`, {
        user_id: userId,
        role: role
      });
      console.log('✅ OrganizationManagementService: User added successfully:', response.data);

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to add user to organization:', error);
      return this.handleError(error, 'Failed to add user to organization');
    }
  }

  /**
   * Remove user from organization
   */
  async removeUserFromOrganization(organizationId, userId) {
    try {
      console.log('🔍 OrganizationManagementService: Removing user from organization:', { organizationId, userId });
      const response = await api.delete(`/v1/organizations/${organizationId}/users/${userId}`);
      console.log('✅ OrganizationManagementService: User removed successfully:', response.data);

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to remove user from organization:', error);
      return this.handleError(error, 'Failed to remove user from organization');
    }
  }

  /**
   * Update organization subscription
   */
  async updateOrganizationSubscription(id, subscriptionData) {
    try {
      console.log('🔍 OrganizationManagementService: Updating subscription for organization:', id, 'with data:', subscriptionData);
      const response = await api.patch(`/v1/organizations/${id}/subscription`, subscriptionData);
      console.log('✅ OrganizationManagementService: Subscription updated successfully:', response.data);

      return {
        success: true,
        data: this.transformOrganizationDataForFrontend(response.data.data),
        message: response.data.message
      };
    } catch (error) {
      console.error('❌ OrganizationManagementService: Failed to update subscription:', error);
      return this.handleError(error, 'Failed to update organization subscription');
    }
  }

  /**
   * Get organizations by business type
   */
  async getOrganizationsByBusinessType(businessType) {
    try {
      console.log('🔍 OrganizationManagementService: Fetching organizations by business type:', businessType);
      const response = await api.get(`/v1/organizations/business-type/${businessType}`);
      console.log('✅ OrganizationManagementService: Organizations retrieved successfully:', response.data);

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
      console.error('❌ OrganizationManagementService: Failed to get organizations by business type:', error);
      return this.handleError(error, 'Failed to fetch organizations by business type');
    }
  }

  /**
   * Get organizations by industry
   */
  async getOrganizationsByIndustry(industry) {
    try {
      console.log('🔍 OrganizationManagementService: Fetching organizations by industry:', industry);
      const response = await api.get(`/v1/organizations/industry/${industry}`);
      console.log('✅ OrganizationManagementService: Organizations retrieved successfully:', response.data);

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
      console.error('❌ OrganizationManagementService: Failed to get organizations by industry:', error);
      return this.handleError(error, 'Failed to fetch organizations by industry');
    }
  }

  /**
   * Get organizations by company size
   */
  async getOrganizationsByCompanySize(companySize) {
    try {
      console.log('🔍 OrganizationManagementService: Fetching organizations by company size:', companySize);
      const response = await api.get(`/v1/organizations/company-size/${companySize}`);
      console.log('✅ OrganizationManagementService: Organizations retrieved successfully:', response.data);

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
      console.error('❌ OrganizationManagementService: Failed to get organizations by company size:', error);
      return this.handleError(error, 'Failed to fetch organizations by company size');
    }
  }

  /**
   * Get active organizations
   */
  async getActiveOrganizations() {
    try {
      console.log('🔍 OrganizationManagementService: Fetching active organizations');
      const response = await api.get('/v1/organizations/active');
      console.log('✅ OrganizationManagementService: Active organizations retrieved successfully:', response.data);

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
      console.error('❌ OrganizationManagementService: Failed to get active organizations:', error);
      return this.handleError(error, 'Failed to fetch active organizations');
    }
  }

  /**
   * Get trial organizations
   */
  async getTrialOrganizations() {
    try {
      console.log('🔍 OrganizationManagementService: Fetching trial organizations');
      const response = await api.get('/v1/organizations/trial');
      console.log('✅ OrganizationManagementService: Trial organizations retrieved successfully:', response.data);

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
      console.error('❌ OrganizationManagementService: Failed to get trial organizations:', error);
      return this.handleError(error, 'Failed to fetch trial organizations');
    }
  }

  /**
   * Get expired trial organizations
   */
  async getExpiredTrialOrganizations() {
    try {
      console.log('🔍 OrganizationManagementService: Fetching expired trial organizations');
      const response = await api.get('/v1/organizations/expired-trial');
      console.log('✅ OrganizationManagementService: Expired trial organizations retrieved successfully:', response.data);

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
      console.error('❌ OrganizationManagementService: Failed to get expired trial organizations:', error);
      return this.handleError(error, 'Failed to fetch expired trial organizations');
    }
  }

  /**
   * Handle API errors
   */
  handleError(error, defaultMessage) {
    console.error('OrganizationManagementService Error:', error);

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
      createdAt: organizationData.created_at,
      updatedAt: organizationData.updated_at,
      deletedAt: organizationData.deleted_at
    };
  }
}

export default new OrganizationManagementService();
