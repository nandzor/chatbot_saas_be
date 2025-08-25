import { api } from './api';

/**
 * Base Service Class
 * Provides common CRUD operations and error handling for all API services
 * Implements professional error handling, request/response interceptors, and consistent patterns
 */
export class BaseService {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCache: false,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      ...options
    };

    // Cache storage for GET requests
    this.cache = new Map();
  }

  /**
   * Generic GET request with caching support
   */
  async get(params = {}, options = {}) {
    const cacheKey = this.generateCacheKey('GET', params);

    // Check cache first
    if (this.options.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.options.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    const response = await this.request('GET', '', { params }, options);

    // Cache successful GET responses
    if (this.options.enableCache && response.success) {
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
    }

    return response;
  }

  /**
   * Generic GET by ID request
   */
  async getById(id, options = {}) {
    return this.request('GET', `/${id}`, {}, options);
  }

  /**
   * Generic POST request for creating resources
   */
  async create(data, options = {}) {
    const response = await this.request('POST', '', { data }, options);

    // Clear cache on successful creation
    if (response.success) {
      this.clearCache();
    }

    return response;
  }

  /**
   * Generic PUT request for updating resources
   */
  async update(id, data, options = {}) {
    const response = await this.request('PUT', `/${id}`, { data }, options);

    // Clear cache on successful update
    if (response.success) {
      this.clearCache();
    }

    return response;
  }

  /**
   * Generic PATCH request for partial updates
   */
  async patch(id, data, options = {}) {
    const response = await this.request('PATCH', `/${id}`, { data }, options);

    // Clear cache on successful update
    if (response.success) {
      this.clearCache();
    }

    return response;
  }

  /**
   * Generic DELETE request
   */
  async delete(id, options = {}) {
    const response = await this.request('DELETE', `/${id}`, {}, options);

    // Clear cache on successful deletion
    if (response.success) {
      this.clearCache();
    }

    return response;
  }

  /**
   * Bulk delete operation
   */
  async bulkDelete(ids, options = {}) {
    const response = await this.request('POST', '/bulk-delete', { data: { ids } }, options);

    // Clear cache on successful bulk deletion
    if (response.success) {
      this.clearCache();
    }

    return response;
  }

  /**
   * Generic request method with retry logic and comprehensive error handling
   */
  async request(method, path, config = {}, options = {}) {
    const requestOptions = {
      method,
      url: `${this.baseUrl}${path}`,
      timeout: this.options.timeout,
      ...config,
      ...options
    };

    let lastError;

    // Retry logic
    for (let attempt = 1; attempt <= this.options.retryAttempts; attempt++) {
      try {
        const response = await api.request(requestOptions);

        // Standardize response format
        return this.formatResponse(response);

      } catch (error) {
        lastError = error;

        // Don't retry on AbortError (canceled requests)
        if (error.name === 'AbortError' || error.message === 'canceled') {
          throw error; // Re-throw immediately
        }

        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          break;
        }

        // Don't retry on last attempt
        if (attempt === this.options.retryAttempts) {
          break;
        }

        // Wait before retry
        await this.delay(this.options.retryDelay * attempt);
      }
    }

    throw this.handleError(lastError);
  }

  /**
   * Format API response to consistent structure
   */
  formatResponse(response) {
    const { data, status, statusText } = response;

    // Handle different response formats
    if (data && typeof data === 'object') {
      return {
        success: true,
        data: data.data || data,
        meta: data.meta || {},
        message: data.message || statusText || 'Success',
        status,
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: true,
      data: data,
      meta: {},
      message: statusText || 'Success',
      status,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Comprehensive error handling with detailed error information
   */
  handleError(error) {
    // Don't log or handle AbortError (canceled requests)
    if (error.name === 'AbortError' || error.message === 'canceled') {
      return error; // Return the original error for proper handling
    }

    console.error(`${this.constructor.name} error:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
      timestamp: new Date().toISOString()
    });

    // Network errors
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please check your connection and try again.');
    }

    if (error.message === 'Network Error') {
      return new Error('Network connection failed. Please check your internet connection.');
    }

    // HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = this.extractErrorMessage(data);

      switch (status) {
        case 400:
          return new Error(`Bad Request: ${errorMessage}`);
        case 401:
          return new Error('Authentication required. Please log in again.');
        case 403:
          return new Error('Access denied. You don\'t have permission to perform this action.');
        case 404:
          return new Error('Resource not found or has been removed.');
        case 409:
          return new Error(`Conflict: ${errorMessage}`);
        case 422:
          return new Error(`Validation Error: ${errorMessage}`);
        case 429:
          return new Error('Too many requests. Please wait a moment and try again.');
        case 500:
          return new Error('Internal server error. Please try again later.');
        case 502:
          return new Error('Bad gateway. Please try again later.');
        case 503:
          return new Error('Service temporarily unavailable. Please try again later.');
        case 504:
          return new Error('Gateway timeout. Please try again later.');
        default:
          return new Error(`Server Error (${status}): ${errorMessage}`);
      }
    }

    // Request errors
    if (error.request) {
      return new Error('No response received from server. Please check your connection.');
    }

    // Other errors
    return new Error(error.message || 'An unexpected error occurred');
  }

  /**
   * Extract error message from various response formats
   */
  extractErrorMessage(data) {
    if (!data) return 'Unknown error';

    if (typeof data === 'string') {
      return data;
    }

    if (typeof data === 'object') {
      // Laravel validation errors
      if (data.errors && typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        return Array.isArray(firstError) ? firstError[0] : firstError;
      }

      // Standard error message
      if (data.message) {
        return data.message;
      }

      // Error array
      if (Array.isArray(data)) {
        return data[0] || 'Validation error';
      }

      // Fallback
      return data.error || data.reason || 'Unknown error';
    }

    return 'Unknown error';
  }

  /**
   * Generate cache key for requests
   */
  generateCacheKey(method, params) {
    return `${method}:${this.baseUrl}:${JSON.stringify(params)}`;
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear specific cached items
   */
  clearCacheByPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Utility method for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile(file, onProgress, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
      ...options
    };

    return this.request('POST', '/upload', config);
  }

  /**
   * Download file
   */
  async downloadFile(id, filename, options = {}) {
    const config = {
      responseType: 'blob',
      ...options
    };

    const response = await this.request('GET', `/${id}/download`, config);

    if (response.success) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }

    return response;
  }
}
