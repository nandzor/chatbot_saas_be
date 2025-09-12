/**
 * API Helper Functions
 * Reusable functions untuk API operations
 */

import { api } from '@/api/axios';
import { HTTP_STATUS, API_ENDPOINTS } from './constants';
import { getErrorMessage, retry } from './helpers';

/**
 * Generic API request handler
 */
export const apiRequest = async (method, endpoint, data = null, config = {}) => {
  try {
    const response = await api.request({
      method,
      url: endpoint,
      data,
      ...config
    });

    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
      status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      data: error.response?.data || null
    };
  }
};

/**
 * GET request helper
 */
export const apiGet = async (endpoint, config = {}) => {
  return apiRequest('GET', endpoint, null, config);
};

/**
 * POST request helper
 */
export const apiPost = async (endpoint, data = null, config = {}) => {
  return apiRequest('POST', endpoint, data, config);
};

/**
 * PUT request helper
 */
export const apiPut = async (endpoint, data = null, config = {}) => {
  return apiRequest('PUT', endpoint, data, config);
};

/**
 * PATCH request helper
 */
export const apiPatch = async (endpoint, data = null, config = {}) => {
  return apiRequest('PATCH', endpoint, data, config);
};

/**
 * DELETE request helper
 */
export const apiDelete = async (endpoint, config = {}) => {
  return apiRequest('DELETE', endpoint, null, config);
};

/**
 * API request with retry
 */
export const apiRequestWithRetry = async (method, endpoint, data = null, config = {}) => {
  return retry(
    () => apiRequest(method, endpoint, data, config),
    config.retries || 3,
    config.retryDelay || 1000
  );
};

/**
 * Paginated API request
 */
export const apiGetPaginated = async (endpoint, params = {}) => {
  const {
    page = 1,
    per_page = 10,
    search = '',
    sort_by = '',
    sort_direction = 'asc',
    filters = {},
    ...otherParams
  } = params;

  const queryParams = {
    page,
    per_page,
    search,
    sort_by,
    sort_direction,
    ...filters,
    ...otherParams
  };

  // Remove empty values
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
      delete queryParams[key];
    }
  });

  return apiGet(endpoint, { params: queryParams });
};

/**
 * Bulk operations helper
 */
export const apiBulkOperation = async (endpoint, operation, items, config = {}) => {
  return apiPost(`${endpoint}/bulk-${operation}`, { items }, config);
};

/**
 * Export data helper
 */
export const apiExport = async (endpoint, params = {}, format = 'csv') => {
  return apiGet(`${endpoint}/export`, {
    params: { ...params, format }
  });
};

/**
 * Import data helper
 */
export const apiImport = async (endpoint, file, config = {}) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiPost(`${endpoint}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config.headers
    },
    ...config
  });
};

/**
 * Search helper
 */
export const apiSearch = async (endpoint, query, params = {}) => {
  return apiGet(`${endpoint}/search`, {
    params: { q: query, ...params }
  });
};

/**
 * Statistics helper
 */
export const apiGetStatistics = async (endpoint, params = {}) => {
  return apiGet(`${endpoint}/statistics`, { params });
};

/**
 * Analytics helper
 */
export const apiGetAnalytics = async (endpoint, params = {}) => {
  return apiGet(`${endpoint}/analytics`, { params });
};

/**
 * Health check helper
 */
export const apiHealthCheck = async () => {
  return apiGet('/health');
};

/**
 * User management helpers
 */
export const userApi = {
  // Get users with pagination
  getUsers: (params = {}) => apiGetPaginated(API_ENDPOINTS.USERS.BASE, params),

  // Get user by ID
  getUser: (id) => apiGet(`${API_ENDPOINTS.USERS.BASE}/${id}`),

  // Create user
  createUser: (data) => apiPost(API_ENDPOINTS.USERS.BASE, data),

  // Update user
  updateUser: (id, data) => apiPut(`${API_ENDPOINTS.USERS.BASE}/${id}`, data),

  // Delete user
  deleteUser: (id) => apiDelete(`${API_ENDPOINTS.USERS.BASE}/${id}`),

  // Search users
  searchUsers: (query, params = {}) => apiSearch(API_ENDPOINTS.USERS.SEARCH, query, params),

  // Get user statistics
  getStatistics: (params = {}) => apiGetStatistics(API_ENDPOINTS.USERS.STATISTICS, params),

  // Check email availability
  checkEmail: (email) => apiPost(API_ENDPOINTS.USERS.CHECK_EMAIL, { email }),

  // Check username availability
  checkUsername: (username) => apiPost(API_ENDPOINTS.USERS.CHECK_USERNAME, { username }),

  // Bulk operations
  bulkUpdate: (items) => apiBulkOperation(API_ENDPOINTS.USERS.BASE, 'update', items),
  bulkDelete: (items) => apiBulkOperation(API_ENDPOINTS.USERS.BASE, 'delete', items),

  // Export users
  exportUsers: (params = {}) => apiExport(API_ENDPOINTS.USERS.BASE, params)
};

/**
 * Organization management helpers
 */
export const organizationApi = {
  // Get organizations with pagination
  getOrganizations: (params = {}) => apiGetPaginated(API_ENDPOINTS.ORGANIZATIONS.BASE, params),

  // Get organization by ID
  getOrganization: (id) => apiGet(`${API_ENDPOINTS.ORGANIZATIONS.BASE}/${id}`),

  // Create organization
  createOrganization: (data) => apiPost(API_ENDPOINTS.ORGANIZATIONS.BASE, data),

  // Update organization
  updateOrganization: (id, data) => apiPut(`${API_ENDPOINTS.ORGANIZATIONS.BASE}/${id}`, data),

  // Delete organization
  deleteOrganization: (id) => apiDelete(`${API_ENDPOINTS.ORGANIZATIONS.BASE}/${id}`),

  // Get active organizations
  getActiveOrganizations: (params = {}) => apiGet(API_ENDPOINTS.ORGANIZATIONS.ACTIVE, { params }),

  // Get trial organizations
  getTrialOrganizations: (params = {}) => apiGet(API_ENDPOINTS.ORGANIZATIONS.TRIAL, { params }),

  // Get organization statistics
  getStatistics: (params = {}) => apiGetStatistics(API_ENDPOINTS.ORGANIZATIONS.STATISTICS, params),

  // Get organization analytics
  getAnalytics: (params = {}) => apiGetAnalytics(API_ENDPOINTS.ORGANIZATIONS.ANALYTICS, params),

  // Export organizations
  exportOrganizations: (params = {}) => apiExport(API_ENDPOINTS.ORGANIZATIONS.EXPORT, params)
};

/**
 * Subscription management helpers
 */
export const subscriptionApi = {
  // Get subscriptions with pagination
  getSubscriptions: (params = {}) => apiGetPaginated(API_ENDPOINTS.SUBSCRIPTIONS.BASE, params),

  // Get subscription by ID
  getSubscription: (id) => apiGet(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}`),

  // Create subscription
  createSubscription: (data) => apiPost(API_ENDPOINTS.SUBSCRIPTIONS.BASE, data),

  // Update subscription
  updateSubscription: (id, data) => apiPut(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}`, data),

  // Delete subscription
  deleteSubscription: (id) => apiDelete(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}`),

  // Get subscription statistics
  getStatistics: (params = {}) => apiGetStatistics(API_ENDPOINTS.SUBSCRIPTIONS.STATISTICS, params),

  // Get subscription analytics
  getAnalytics: (params = {}) => apiGetAnalytics(API_ENDPOINTS.SUBSCRIPTIONS.ANALYTICS, params),

  // Export subscriptions
  exportSubscriptions: (params = {}) => apiExport(API_ENDPOINTS.SUBSCRIPTIONS.EXPORT, params),

  // Subscription lifecycle
  activate: (id) => apiPatch(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}/activate`),
  suspend: (id) => apiPatch(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}/suspend`),
  cancel: (id) => apiPatch(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}/cancel`),
  renew: (id) => apiPatch(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}/renew`),
  upgrade: (id, data) => apiPatch(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}/upgrade`, data),
  downgrade: (id, data) => apiPatch(`${API_ENDPOINTS.SUBSCRIPTIONS.BASE}/${id}/downgrade`, data)
};

/**
 * Analytics helpers
 */
export const analyticsApi = {
  // Get dashboard analytics
  getDashboard: (params = {}) => apiGet(API_ENDPOINTS.ANALYTICS.DASHBOARD, { params }),

  // Get realtime analytics
  getRealtime: (params = {}) => apiGet(API_ENDPOINTS.ANALYTICS.REALTIME, { params }),

  // Get usage analytics
  getUsage: (params = {}) => apiGet(API_ENDPOINTS.ANALYTICS.USAGE, { params }),

  // Get performance analytics
  getPerformance: (params = {}) => apiGet(API_ENDPOINTS.ANALYTICS.PERFORMANCE, { params }),

  // Get conversation analytics
  getConversations: (params = {}) => apiGet(API_ENDPOINTS.ANALYTICS.CONVERSATIONS, { params }),

  // Get user analytics
  getUsers: (params = {}) => apiGet(API_ENDPOINTS.ANALYTICS.USERS, { params }),

  // Get revenue analytics
  getRevenue: (params = {}) => apiGet(API_ENDPOINTS.ANALYTICS.REVENUE, { params })
};

/**
 * Chatbot management helpers
 */
export const chatbotApi = {
  // Get chatbots with pagination
  getChatbots: (params = {}) => apiGetPaginated(API_ENDPOINTS.CHATBOTS.BASE, params),

  // Get chatbot by ID
  getChatbot: (id) => apiGet(`${API_ENDPOINTS.CHATBOTS.BASE}/${id}`),

  // Create chatbot
  createChatbot: (data) => apiPost(API_ENDPOINTS.CHATBOTS.BASE, data),

  // Update chatbot
  updateChatbot: (id, data) => apiPut(`${API_ENDPOINTS.CHATBOTS.BASE}/${id}`, data),

  // Delete chatbot
  deleteChatbot: (id) => apiDelete(`${API_ENDPOINTS.CHATBOTS.BASE}/${id}`),

  // Get chatbot statistics
  getStatistics: (params = {}) => apiGetStatistics(API_ENDPOINTS.CHATBOTS.STATISTICS, params),

  // Test chatbot
  testChatbot: (id, data) => apiPost(`${API_ENDPOINTS.CHATBOTS.BASE}/${id}/test`, data),

  // Train chatbot
  trainChatbot: (id, data) => apiPost(`${API_ENDPOINTS.CHATBOTS.BASE}/${id}/train`, data),

  // Chat with chatbot
  chat: (id, data) => apiPost(`${API_ENDPOINTS.CHATBOTS.BASE}/${id}/chat`, data)
};

/**
 * Conversation management helpers
 */
export const conversationApi = {
  // Get conversations with pagination
  getConversations: (params = {}) => apiGetPaginated(API_ENDPOINTS.CONVERSATIONS.BASE, params),

  // Get conversation by ID
  getConversation: (id) => apiGet(`${API_ENDPOINTS.CONVERSATIONS.BASE}/${id}`),

  // Create conversation
  createConversation: (data) => apiPost(API_ENDPOINTS.CONVERSATIONS.BASE, data),

  // Update conversation
  updateConversation: (id, data) => apiPut(`${API_ENDPOINTS.CONVERSATIONS.BASE}/${id}`, data),

  // Delete conversation
  deleteConversation: (id) => apiDelete(`${API_ENDPOINTS.CONVERSATIONS.BASE}/${id}`),

  // Get conversation statistics
  getStatistics: (params = {}) => apiGetStatistics(API_ENDPOINTS.CONVERSATIONS.STATISTICS, params),

  // Get conversation history
  getHistory: (params = {}) => apiGet(API_ENDPOINTS.CONVERSATIONS.HISTORY, { params }),

  // Get conversation messages
  getMessages: (id, params = {}) => apiGet(`${API_ENDPOINTS.CONVERSATIONS.BASE}/${id}/messages`, { params }),

  // Send message
  sendMessage: (id, data) => apiPost(`${API_ENDPOINTS.CONVERSATIONS.BASE}/${id}/messages`, data),

  // End conversation
  endConversation: (id) => apiPost(`${API_ENDPOINTS.CONVERSATIONS.BASE}/${id}/end`),

  // Transfer conversation
  transferConversation: (id, data) => apiPost(`${API_ENDPOINTS.CONVERSATIONS.BASE}/${id}/transfer`, data)
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiRequestWithRetry,
  apiGetPaginated,
  apiBulkOperation,
  apiExport,
  apiImport,
  apiSearch,
  apiGetStatistics,
  apiGetAnalytics,
  apiHealthCheck,
  userApi,
  organizationApi,
  subscriptionApi,
  analyticsApi,
  chatbotApi,
  conversationApi
};
