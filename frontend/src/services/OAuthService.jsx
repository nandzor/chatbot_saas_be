/**
 * OAuth Service
 * Service untuk mengelola OAuth flow dengan Google services
 */

import api from './api';

class OAuthService {
  constructor() {
    this.baseUrl = '/oauth';
  }

  /**
   * Generate OAuth authorization URL
   */
  async generateAuthUrl(service, organizationId) {
    try {
      const response = await api.post(`${this.baseUrl}/generate-auth-url`, {
        service,
        organizationId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to generate OAuth URL');
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code, state, service, organizationId) {
    try {
      const response = await api.post(`${this.baseUrl}/callback`, {
        code,
        state,
        service,
        organizationId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to handle OAuth callback');
    }
  }

  /**
   * Test OAuth connection
   */
  async testConnection(service, organizationId) {
    try {
      const response = await api.post(`${this.baseUrl}/test-connection`, {
        service,
        organizationId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to test OAuth connection');
    }
  }

  /**
   * Get files from Google service
   */
  async getFiles(service, organizationId, pageSize = 100, pageToken = null) {
    try {
      const response = await api.get(`${this.baseUrl}/files`, {
        params: {
          service,
          organizationId,
          pageSize,
          pageToken
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get files');
    }
  }

  /**
   * Get file details
   */
  async getFileDetails(service, organizationId, fileId) {
    try {
      const response = await api.get(`${this.baseUrl}/file-details`, {
        params: {
          service,
          organizationId,
          fileId
        }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to get file details');
    }
  }

  /**
   * Create workflow with OAuth
   */
  async createWorkflow(service, organizationId, selectedFiles, workflowConfig) {
    try {
      const response = await api.post(`${this.baseUrl}/create-workflow`, {
        service,
        organizationId,
        selectedFiles,
        workflowConfig
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to create workflow');
    }
  }

  /**
   * Revoke OAuth credential
   */
  async revokeCredential(service, organizationId) {
    try {
      const response = await api.post(`${this.baseUrl}/revoke-credential`, {
        service,
        organizationId
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error, 'Failed to revoke credential');
    }
  }

  /**
   * Initiate Google OAuth flow
   */
  async initiateGoogleOAuth(service, organizationId) {
    try {
      const result = await this.generateAuthUrl(service, organizationId);

      if (result.success) {
        // Redirect to Google OAuth
        window.location.href = result.data.authUrl;
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      return this.handleError(error, 'Failed to initiate Google OAuth');
    }
  }

  /**
   * Handle OAuth callback from URL parameters
   */
  async handleOAuthCallbackFromUrl() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Parse state to get service and organizationId
      let service, organizationId;
      if (state) {
        try {
          const stateData = JSON.parse(state);
          service = stateData.service;
          organizationId = stateData.organization_id;
        } catch (e) {
          throw new Error('Invalid state parameter');
        }
      }

      if (!service || !organizationId) {
        throw new Error('Service and organization ID are required');
      }

      const result = await this.handleCallback(code, state, service, organizationId);

      if (result.success) {
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return result;
    } catch (error) {
      return this.handleError(error, 'Failed to handle OAuth callback from URL');
    }
  }

  /**
   * Error handler
   */
  handleError(error, defaultMessage) {
    console.error('OAuth Service Error:', error);

    let message = defaultMessage;
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;
      const errorData = error.response.data;

      if (errorData?.message) {
        message = errorData.message;
      } else if (errorData?.error) {
        message = errorData.error;
      } else if (typeof errorData === 'string') {
        message = errorData;
      }

      // Handle specific error cases
      if (statusCode === 401) {
        message = 'Authentication failed. Please reconnect your Google account.';
      } else if (statusCode === 403) {
        message = 'Access denied. Please check your permissions.';
      } else if (statusCode === 404) {
        message = 'OAuth service not found.';
      } else if (statusCode === 429) {
        message = 'Rate limit exceeded. Please try again later.';
      }
    } else if (error.request) {
      message = 'Network error. Please check your connection.';
    } else {
      message = error.message || defaultMessage;
    }

    return {
      success: false,
      error: message,
      statusCode,
      details: error.response?.data || null
    };
  }
}

export const oauthService = new OAuthService();
export default oauthService;
