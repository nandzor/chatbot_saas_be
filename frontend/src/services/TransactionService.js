import { authService } from '@/services/AuthService';

/**
 * Transaction Service
 * Handles all payment transaction related API calls
 */
class TransactionService {
  constructor() {
    this.baseURL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api'}/v1/payment-transactions`;
  }

  /**
   * Get all payment transactions with pagination and filtering
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.per_page - Items per page
   * @param {string} params.sort_by - Sort field
   * @param {string} params.sort_direction - Sort direction (asc/desc)
   * @param {string} params.search - Search term
   * @param {string} params.status - Transaction status filter
   * @param {string} params.payment_method - Payment method filter
   * @param {string} params.payment_gateway - Payment gateway filter
   * @param {string} params.organization_id - Organization filter
   * @param {string} params.plan_id - Plan filter
   * @param {number} params.amount_min - Minimum amount filter
   * @param {number} params.amount_max - Maximum amount filter
   * @param {string} params.date_from - Start date filter
   * @param {string} params.date_to - End date filter
   * @param {string} params.currency - Currency filter
   * @returns {Promise<Object>} API response with transactions data
   */
  async getTransactions(params = {}) {
    try {

      const queryParams = new URLSearchParams();

      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);

      // Add sorting params
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_direction) queryParams.append('sort_direction', params.sort_direction);

      // Add search param
      if (params.search) queryParams.append('search', params.search);

      // Add filter params
      if (params.status) queryParams.append('status', params.status);
      if (params.payment_method) queryParams.append('payment_method', params.payment_method);
      if (params.payment_gateway) queryParams.append('payment_gateway', params.payment_gateway);
      if (params.organization_id) queryParams.append('organization_id', params.organization_id);
      if (params.plan_id) queryParams.append('plan_id', params.plan_id);
      if (params.amount_min) queryParams.append('amount_min', params.amount_min);
      if (params.amount_max) queryParams.append('amount_max', params.amount_max);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.currency) queryParams.append('currency', params.currency);

      const url = `${this.baseURL}?${queryParams.toString()}`;

      const response = await authService.api.get(url);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} Transaction data
   */
  async getTransactionById(id) {
    try {

      const response = await authService.api.get(`${this.baseURL}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transaction statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getTransactionStatistics() {
    try {

      const response = await authService.api.get(`${this.baseURL}/statistics`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export transactions
   * @param {Object} params - Export parameters
   * @returns {Promise<Blob>} Export file blob
   */
  async exportTransactions(params = {}) {
    try {

      const queryParams = new URLSearchParams();

      // Add filter params for export
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const url = `${this.baseURL}/export?${queryParams.toString()}`;

      const response = await authService.api.get(url, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transactions by status
   * @param {string} status - Transaction status
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Filtered transactions
   */
  async getTransactionsByStatus(status, params = {}) {
    try {

      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const url = `${this.baseURL}/status/${status}?${queryParams.toString()}`;

      const response = await authService.api.get(url);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transactions by payment method
   * @param {string} method - Payment method
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Filtered transactions
   */
  async getTransactionsByPaymentMethod(method, params = {}) {
    try {

      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const url = `${this.baseURL}/payment-method/${method}?${queryParams.toString()}`;

      const response = await authService.api.get(url);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get transactions by payment gateway
   * @param {string} gateway - Payment gateway
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Filtered transactions
   */
  async getTransactionsByPaymentGateway(gateway, params = {}) {
    try {

      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const url = `${this.baseURL}/payment-gateway/${gateway}?${queryParams.toString()}`;

      const response = await authService.api.get(url);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get plan transaction history
   * @param {string} planId - Plan ID
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Plan transaction history
   */
  async getPlanTransactionHistory(planId, params = {}) {
    try {

      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const url = `${this.baseURL}/plan/${planId}/history?${queryParams.toString()}`;

      const response = await authService.api.get(url);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get organization transaction history
   * @param {string} organizationId - Organization ID
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Organization transaction history
   */
  async getOrganizationTransactionHistory(organizationId, params = {}) {
    try {

      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      const url = `${this.baseURL}/organization/${organizationId}/history?${queryParams.toString()}`;

      const response = await authService.api.get(url);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  handleError(error) {

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'An error occurred';

      return new Error(`API Error (${status}): ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network Error: Unable to connect to server');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Create and export singleton instance
const transactionService = new TransactionService();
export default transactionService;
