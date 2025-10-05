/**
 * OAuth Error Handler
 * Comprehensive error handling untuk OAuth flow di frontend
 */

class OAuthErrorHandler {
  constructor() {
    this.errorCodes = {
      // OAuth 2.0 Standard Errors
      'invalid_request': 'The request is missing a required parameter or is otherwise malformed.',
      'invalid_client': 'Client authentication failed.',
      'invalid_grant': 'The provided authorization grant is invalid, expired, or revoked.',
      'unauthorized_client': 'The client is not authorized to request an authorization code.',
      'unsupported_grant_type': 'The authorization grant type is not supported.',
      'invalid_scope': 'The requested scope is invalid, unknown, or malformed.',
      'access_denied': 'The resource owner or authorization server denied the request.',
      'server_error': 'The authorization server encountered an unexpected condition.',
      'temporarily_unavailable': 'The authorization server is temporarily unable to handle the request.',
      
      // Google API Specific Errors
      'quota_exceeded': 'The request cannot be completed because you have exceeded your quota.',
      'rate_limit_exceeded': 'The request rate limit has been exceeded.',
      'insufficient_permissions': 'The request requires higher privileges than provided.',
      'invalid_credentials': 'The provided credentials are invalid.',
      'token_expired': 'The access token has expired.',
      'refresh_token_expired': 'The refresh token has expired.',
      'invalid_token': 'The provided token is invalid or malformed.',
      
      // N8N Integration Errors
      'n8n_connection_failed': 'Failed to connect to N8N server.',
      'n8n_credential_creation_failed': 'Failed to create credential in N8N.',
      'n8n_workflow_creation_failed': 'Failed to create workflow in N8N.',
      'n8n_credential_test_failed': 'Failed to test N8N credential.',
      
      // Network Errors
      'network_timeout': 'Network request timed out.',
      'network_unreachable': 'Network is unreachable.',
      'dns_resolution_failed': 'DNS resolution failed.',
      'ssl_certificate_error': 'SSL certificate verification failed.',
      
      // Application Errors
      'configuration_error': 'Application configuration error.',
      'service_unavailable': 'Service is temporarily unavailable.',
      'maintenance_mode': 'Service is in maintenance mode.',
      'feature_disabled': 'Feature is disabled.',
    };

    this.userFriendlyMessages = {
      'invalid_request': 'The request is invalid. Please check your input and try again.',
      'invalid_client': 'Authentication failed. Please contact support.',
      'invalid_grant': 'Your authorization has expired. Please reconnect your Google account.',
      'unauthorized_client': 'You are not authorized to perform this action.',
      'unsupported_grant_type': 'This authorization method is not supported.',
      'invalid_scope': 'The requested permissions are invalid.',
      'access_denied': 'Access denied. Please grant the required permissions.',
      'server_error': 'Google services are temporarily unavailable. Please try again later.',
      'temporarily_unavailable': 'Google services are temporarily unavailable. Please try again later.',
      'quota_exceeded': 'You have exceeded your Google API quota. Please try again later.',
      'rate_limit_exceeded': 'Too many requests. Please wait a moment and try again.',
      'insufficient_permissions': 'Insufficient permissions. Please check your Google account settings.',
      'invalid_credentials': 'Your Google credentials are invalid. Please reconnect your account.',
      'token_expired': 'Your session has expired. Please reconnect your Google account.',
      'refresh_token_expired': 'Your authorization has expired. Please reconnect your Google account.',
      'invalid_token': 'Your session is invalid. Please reconnect your Google account.',
      'n8n_connection_failed': 'Unable to connect to automation service. Please try again later.',
      'n8n_credential_creation_failed': 'Failed to create automation credential. Please try again.',
      'n8n_workflow_creation_failed': 'Failed to create automation workflow. Please try again.',
      'n8n_credential_test_failed': 'Failed to test automation credential. Please check your settings.',
      'network_timeout': 'Request timed out. Please check your internet connection and try again.',
      'network_unreachable': 'Network error. Please check your internet connection.',
      'dns_resolution_failed': 'Network error. Please check your internet connection.',
      'ssl_certificate_error': 'Security error. Please contact support.',
      'configuration_error': 'System configuration error. Please contact support.',
      'service_unavailable': 'Service is temporarily unavailable. Please try again later.',
      'maintenance_mode': 'Service is under maintenance. Please try again later.',
      'feature_disabled': 'This feature is currently disabled.',
    };

    this.retryableErrors = [
      'server_error',
      'temporarily_unavailable',
      'network_timeout',
      'network_unreachable',
      'n8n_connection_failed',
      'service_unavailable',
    ];

    this.errorSuggestions = {
      'invalid_credentials': [
        'Reconnect your Google account',
        'Check your Google account permissions',
        'Ensure your Google account is active'
      ],
      'quota_exceeded': [
        'Wait a few minutes before trying again',
        'Check your Google API quota limits',
        'Contact support if the issue persists'
      ],
      'access_denied': [
        'Grant the required permissions',
        'Check your Google account settings',
        'Ensure you have the necessary access rights'
      ],
      'network_timeout': [
        'Check your internet connection',
        'Try again in a few moments',
        'Contact your network administrator if the issue persists'
      ],
      'n8n_connection_failed': [
        'Check N8N server status',
        'Verify N8N configuration',
        'Contact support for assistance'
      ],
      'default': [
        'Try again in a few moments',
        'Contact support if the issue persists'
      ]
    };
  }

  /**
   * Handle OAuth errors dengan comprehensive error handling
   */
  handleOAuthError(error, context = 'OAuth operation') {
    const errorCode = this.determineErrorCode(error);
    const userMessage = this.getUserFriendlyMessage(errorCode);
    const technicalMessage = this.getTechnicalMessage(error);
    const isRetryable = this.isRetryableError(errorCode);
    const retryAfter = isRetryable ? this.calculateRetryAfter(error) : null;

    // Log error untuk debugging
    this.logError(error, context, errorCode, technicalMessage);

    // Store error untuk analytics
    this.storeErrorMetrics(errorCode, context);

    return {
      success: false,
      error_code: errorCode,
      user_message: userMessage,
      technical_message: technicalMessage,
      is_retryable: isRetryable,
      retry_after: retryAfter,
      context: context,
      timestamp: new Date().toISOString(),
      suggestions: this.getErrorSuggestions(errorCode),
    };
  }

  /**
   * Handle API response errors
   */
  handleApiError(response, context = 'API call') {
    const errorData = response.data || {};
    const errorCode = errorData.error_code || this.determineErrorCodeFromResponse(response);
    const userMessage = errorData.user_message || this.getUserFriendlyMessage(errorCode);
    const technicalMessage = errorData.technical_message || errorData.message || 'API error';

    return {
      success: false,
      error_code: errorCode,
      user_message: userMessage,
      technical_message: technicalMessage,
      is_retryable: errorData.is_retryable || this.isRetryableError(errorCode),
      retry_after: errorData.retry_after || null,
      context: context,
      timestamp: new Date().toISOString(),
      suggestions: errorData.suggestions || this.getErrorSuggestions(errorCode),
      status_code: response.status,
      response_data: errorData
    };
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error, context = 'Network request') {
    const errorCode = this.determineNetworkErrorCode(error);
    const userMessage = this.getUserFriendlyMessage(errorCode);
    const technicalMessage = this.getTechnicalMessage(error);
    const isRetryable = this.isRetryableError(errorCode);

    return {
      success: false,
      error_code: errorCode,
      user_message: userMessage,
      technical_message: technicalMessage,
      is_retryable: isRetryable,
      retry_after: isRetryable ? 30 : null,
      context: context,
      timestamp: new Date().toISOString(),
      suggestions: this.getErrorSuggestions(errorCode),
    };
  }

  /**
   * Determine error code dari error object
   */
  determineErrorCode(error) {
    const message = error.message || '';
    const code = error.code || error.status || 0;

    // Check untuk specific error patterns
    for (const [errorCode, description] of Object.entries(this.errorCodes)) {
      if (message.toLowerCase().includes(errorCode.replace('_', ' '))) {
        return errorCode;
      }
    }

    // Check untuk HTTP status codes
    if (code >= 400 && code < 500) {
      switch (code) {
        case 400: return 'invalid_request';
        case 401: return 'invalid_credentials';
        case 403: return 'access_denied';
        case 404: return 'invalid_request';
        case 429: return 'rate_limit_exceeded';
        default: return 'invalid_request';
      }
    }

    if (code >= 500) {
      return 'server_error';
    }

    // Default error code
    return 'server_error';
  }

  /**
   * Determine error code dari API response
   */
  determineErrorCodeFromResponse(response) {
    const status = response.status;
    const data = response.data || {};

    // Check untuk specific error codes dalam response
    if (data.error_code) {
      return data.error_code;
    }

    // Check untuk OAuth errors
    if (data.error) {
      return data.error;
    }

    // Check untuk HTTP status codes
    if (status >= 400 && status < 500) {
      switch (status) {
        case 400: return 'invalid_request';
        case 401: return 'invalid_credentials';
        case 403: return 'access_denied';
        case 404: return 'invalid_request';
        case 429: return 'rate_limit_exceeded';
        default: return 'invalid_request';
      }
    }

    if (status >= 500) {
      return 'server_error';
    }

    return 'server_error';
  }

  /**
   * Determine network error code
   */
  determineNetworkErrorCode(error) {
    const message = error.message || '';

    if (message.includes('timeout')) {
      return 'network_timeout';
    } else if (message.includes('Network Error') || message.includes('ERR_NETWORK')) {
      return 'network_unreachable';
    } else if (message.includes('DNS')) {
      return 'dns_resolution_failed';
    } else if (message.includes('SSL') || message.includes('certificate')) {
      return 'ssl_certificate_error';
    }

    return 'network_unreachable';
  }

  /**
   * Get user-friendly message
   */
  getUserFriendlyMessage(errorCode) {
    return this.userFriendlyMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get technical message untuk logging
   */
  getTechnicalMessage(error) {
    return `${error.message} (Stack: ${error.stack || 'No stack trace'})`;
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(errorCode) {
    return this.retryableErrors.includes(errorCode);
  }

  /**
   * Calculate retry after time
   */
  calculateRetryAfter(error) {
    const code = error.code || error.status || 0;
    
    switch (code) {
      case 429: return 60; // Rate limit - wait 1 minute
      case 503: return 300; // Service unavailable - wait 5 minutes
      case 500:
      case 502:
      case 504: return 30; // Server errors - wait 30 seconds
      default: return this.isRetryableError(this.determineErrorCode(error)) ? 30 : null;
    }
  }

  /**
   * Get error suggestions
   */
  getErrorSuggestions(errorCode) {
    return this.errorSuggestions[errorCode] || this.errorSuggestions.default;
  }

  /**
   * Log error untuk debugging
   */
  logError(error, context, errorCode, technicalMessage) {
    console.error(`OAuth Error in ${context}:`, {
      error_code: errorCode,
      technical_message: technicalMessage,
      context: context,
      error: error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Store error metrics untuk analytics
   */
  storeErrorMetrics(errorCode, context) {
    const key = `oauth_errors:${errorCode}:${context}`;
    const existing = localStorage.getItem(key);
    const count = existing ? parseInt(existing) + 1 : 1;
    localStorage.setItem(key, count.toString());
    
    // Set expiration (24 hours)
    const expirationKey = `${key}:expires`;
    localStorage.setItem(expirationKey, (Date.now() + 24 * 60 * 60 * 1000).toString());
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(context = null) {
    const statistics = {};
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('oauth_errors:') && !key.includes(':expires')) {
        const parts = key.split(':');
        const errorCode = parts[1];
        const errorContext = parts[2];
        
        // Check expiration
        const expirationKey = `${key}:expires`;
        const expiration = localStorage.getItem(expirationKey);
        if (expiration && Date.now() > parseInt(expiration)) {
          localStorage.removeItem(key);
          localStorage.removeItem(expirationKey);
          continue;
        }
        
        if (!context || errorContext === context) {
          if (!statistics[errorCode]) {
            statistics[errorCode] = {
              error_code: errorCode,
              total_count: 0,
              contexts: {}
            };
          }
          
          const count = parseInt(localStorage.getItem(key) || '0');
          statistics[errorCode].total_count += count;
          statistics[errorCode].contexts[errorContext] = count;
        }
      }
    }
    
    return Object.values(statistics);
  }

  /**
   * Clear error statistics
   */
  clearErrorStatistics() {
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      if (key.startsWith('oauth_errors:')) {
        localStorage.removeItem(key);
      }
    }
  }

  /**
   * Show error notification
   */
  showErrorNotification(errorResult, options = {}) {
    const {
      showRetry = true,
      showSuggestions = true,
      duration = 5000
    } = options;

    const notification = {
      type: 'error',
      title: 'OAuth Error',
      message: errorResult.user_message,
      duration: duration,
      actions: []
    };

    if (showRetry && errorResult.is_retryable) {
      notification.actions.push({
        label: 'Retry',
        action: 'retry',
        retryAfter: errorResult.retry_after
      });
    }

    if (showSuggestions && errorResult.suggestions.length > 0) {
      notification.actions.push({
        label: 'View Suggestions',
        action: 'show_suggestions',
        suggestions: errorResult.suggestions
      });
    }

    // Emit notification event
    window.dispatchEvent(new CustomEvent('oauth-error', {
      detail: notification
    }));

    return notification;
  }

  /**
   * Handle retry logic
   */
  async handleRetry(operation, errorResult, maxRetries = 3) {
    if (!errorResult.is_retryable) {
      throw new Error('Error is not retryable');
    }

    const retryAfter = errorResult.retry_after || 30;
    const retryCount = errorResult.retry_count || 0;

    if (retryCount >= maxRetries) {
      throw new Error('Maximum retry attempts exceeded');
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));

    try {
      return await operation();
    } catch (error) {
      const newErrorResult = this.handleOAuthError(error, errorResult.context);
      newErrorResult.retry_count = retryCount + 1;
      
      if (newErrorResult.is_retryable && retryCount + 1 < maxRetries) {
        return this.handleRetry(operation, newErrorResult, maxRetries);
      }
      
      throw newErrorResult;
    }
  }
}

// Export singleton instance
export const oauthErrorHandler = new OAuthErrorHandler();
export default oauthErrorHandler;
