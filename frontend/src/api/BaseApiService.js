/**
 * Base API Service
 * Generic API service dengan reusable methods
 */

import { api } from './axios';
import { HTTP_STATUS, API_ENDPOINTS } from '@/utils/constants';
import { getErrorMessage, retry } from '@/utils/helpers';

/**
 * Base API Service Class
 */
export class BaseApiService {
  constructor(baseEndpoint = '') {
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * Generic API request handler
   */
  async request(method, endpoint, data = null, config = {}) {
    try {
      const response = await api.request({
        method,
        url: `${this.baseEndpoint}${endpoint}`,
        data,
        ...config
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
        status: error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
        data: error.response?.data || null
      };
    }
  }

  /**
   * GET request
   */
  async get(endpoint = '', config = {}) {
    return this.request('GET', endpoint, null, config);
  }

  /**
   * POST request
   */
  async post(endpoint = '', data = null, config = {}) {
    return this.request('POST', endpoint, data, config);
  }

  /**
   * PUT request
   */
  async put(endpoint = '', data = null, config = {}) {
    return this.request('PUT', endpoint, data, config);
  }

  /**
   * PATCH request
   */
  async patch(endpoint = '', data = null, config = {}) {
    return this.request('PATCH', endpoint, data, config);
  }

  /**
   * DELETE request
   */
  async delete(endpoint = '', config = {}) {
    return this.request('DELETE', endpoint, null, config);
  }

  /**
   * Paginated GET request
   */
  async getPaginated(params = {}) {
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

    return this.get('', { params: queryParams });
  }

  /**
   * Search request
   */
  async search(query, params = {}) {
    return this.get('/search', {
      params: { q: query, ...params }
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(params = {}) {
    return this.get('/statistics', { params });
  }

  /**
   * Get analytics
   */
  async getAnalytics(params = {}) {
    return this.get('/analytics', { params });
  }

  /**
   * Export data
   */
  async export(params = {}, format = 'csv') {
    return this.get('/export', {
      params: { ...params, format }
    });
  }

  /**
   * Import data
   */
  async import(file, config = {}) {
    const formData = new FormData();
    formData.append('file', file);

    return this.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      },
      ...config
    });
  }

  /**
   * Bulk operation
   */
  async bulkOperation(operation, items, config = {}) {
    return this.post(`/bulk-${operation}`, { items }, config);
  }

  /**
   * Get by ID
   */
  async getById(id, params = {}) {
    return this.get(`/${id}`, { params });
  }

  /**
   * Create
   */
  async create(data) {
    return this.post('', data);
  }

  /**
   * Update
   */
  async update(id, data) {
    return this.put(`/${id}`, data);
  }

  /**
   * Partial update
   */
  async partialUpdate(id, data) {
    return this.patch(`/${id}`, data);
  }

  /**
   * Delete
   */
  async deleteById(id) {
    return this.delete(`/${id}`);
  }

  /**
   * Toggle status
   */
  async toggleStatus(id) {
    return this.patch(`/${id}/toggle-status`);
  }

  /**
   * Activate
   */
  async activate(id) {
    return this.patch(`/${id}/activate`);
  }

  /**
   * Deactivate
   */
  async deactivate(id) {
    return this.patch(`/${id}/deactivate`);
  }

  /**
   * Suspend
   */
  async suspend(id) {
    return this.patch(`/${id}/suspend`);
  }

  /**
   * Restore
   */
  async restore(id) {
    return this.patch(`/${id}/restore`);
  }

  /**
   * Clone
   */
  async clone(id) {
    return this.post(`/${id}/clone`);
  }

  /**
   * Duplicate
   */
  async duplicate(id) {
    return this.post(`/${id}/duplicate`);
  }

  /**
   * Request with retry
   */
  async requestWithRetry(method, endpoint, data = null, config = {}) {
    return retry(
      () => this.request(method, endpoint, data, config),
      config.retries || 3,
      config.retryDelay || 1000
    );
  }
}

/**
 * User API Service
 */
export class UserApiService extends BaseApiService {
  constructor() {
    super(API_ENDPOINTS.USERS.BASE);
  }

  // User-specific methods
  async checkEmail(email) {
    return this.post('/check-email', { email });
  }

  async checkUsername(username) {
    return this.post('/check-username', { username });
  }

  async getActivity(id) {
    return this.get(`/${id}/activity`);
  }

  async getSessions(id) {
    return this.get(`/${id}/sessions`);
  }

  async getPermissions(id) {
    return this.get(`/${id}/permissions`);
  }

  async bulkUpdate(items) {
    return this.bulkOperation('update', items);
  }
}

/**
 * Organization API Service
 */
export class OrganizationApiService extends BaseApiService {
  constructor() {
    super(API_ENDPOINTS.ORGANIZATIONS.BASE);
  }

  // Organization-specific methods
  async getActive(params = {}) {
    return this.get('/active', { params });
  }

  async getTrial(params = {}) {
    return this.get('/trial', { params });
  }

  async getExpiredTrial(params = {}) {
    return this.get('/expired-trial', { params });
  }

  async getByBusinessType(businessType, params = {}) {
    return this.get(`/business-type/${businessType}`, { params });
  }

  async getByIndustry(industry, params = {}) {
    return this.get(`/industry/${industry}`, { params });
  }

  async getByCompanySize(companySize, params = {}) {
    return this.get(`/company-size/${companySize}`, { params });
  }

  async getByCode(orgCode) {
    return this.get(`/code/${orgCode}`);
  }

  async getUsers(id, params = {}) {
    return this.get(`/${id}/users`, { params });
  }

  async addUser(id, userData) {
    return this.post(`/${id}/users`, userData);
  }

  async removeUser(id, userId) {
    return this.delete(`/${id}/users/${userId}`);
  }

  async updateSubscription(id, subscriptionData) {
    return this.patch(`/${id}/subscription`, subscriptionData);
  }

  async getActivityLogs(id, params = {}) {
    return this.get(`/${id}/activity-logs`, { params });
  }

  async getHealth(id) {
    return this.get(`/${id}/health`);
  }

  async getMetrics(id, params = {}) {
    return this.get(`/${id}/metrics`, { params });
  }

  async restore(id) {
    return this.post(`/${id}/restore`);
  }

  async updateStatus(id, status) {
    return this.patch(`/${id}/status`, { status });
  }

  async getSettings(id) {
    return this.get(`/${id}/settings`);
  }

  async saveSettings(id, settings) {
    return this.put(`/${id}/settings`, settings);
  }

  async testWebhook(id, webhookData) {
    return this.post(`/${id}/webhook/test`, webhookData);
  }

  async getRoles(id) {
    return this.get(`/${id}/roles`);
  }

  async saveRolePermissions(id, roleId, permissions) {
    return this.put(`/${id}/roles/${roleId}/permissions`, { permissions });
  }

  async saveAllPermissions(id, permissions) {
    return this.put(`/${id}/permissions`, { permissions });
  }

  async getAuditLogs(id, params = {}) {
    return this.get(`/${id}/audit-logs`, { params });
  }

  async getAuditLogStatistics(id) {
    return this.get(`/${id}/audit-logs/statistics`);
  }

  async getAuditLog(id, auditLogId) {
    return this.get(`/${id}/audit-logs/${auditLogId}`);
  }

  async getNotifications(id, params = {}) {
    return this.get(`/${id}/notifications`, { params });
  }

  async sendNotification(id, notificationData) {
    return this.post(`/${id}/notifications`, notificationData);
  }

  async markNotificationAsRead(id, notificationId) {
    return this.patch(`/${id}/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(id) {
    return this.patch(`/${id}/notifications/read-all`);
  }

  async deleteNotification(id, notificationId) {
    return this.delete(`/${id}/notifications/${notificationId}`);
  }
}

/**
 * Subscription API Service
 */
export class SubscriptionApiService extends BaseApiService {
  constructor() {
    super(API_ENDPOINTS.SUBSCRIPTIONS.BASE);
  }

  // Subscription-specific methods
  async activate(id) {
    return this.patch(`/${id}/activate`);
  }

  async suspend(id) {
    return this.patch(`/${id}/suspend`);
  }

  async cancel(id) {
    return this.patch(`/${id}/cancel`);
  }

  async renew(id) {
    return this.patch(`/${id}/renew`);
  }

  async upgrade(id, data) {
    return this.patch(`/${id}/upgrade`, data);
  }

  async downgrade(id, data) {
    return this.patch(`/${id}/downgrade`, data);
  }

  async getBilling(id) {
    return this.get(`/${id}/billing`);
  }

  async processBilling(id, billingData) {
    return this.post(`/${id}/billing/process`, billingData);
  }

  async getInvoices(id, params = {}) {
    return this.get(`/${id}/invoices`, { params });
  }

  async getInvoice(id, invoiceId) {
    return this.get(`/${id}/invoices/${invoiceId}`);
  }

  async getHistory(id, params = {}) {
    return this.get(`/${id}/history`, { params });
  }

  async getUsage(id, params = {}) {
    return this.get(`/${id}/usage`, { params });
  }

  async getMetrics(id, params = {}) {
    return this.get(`/${id}/metrics`, { params });
  }

  async getByOrganization(organizationId, params = {}) {
    return this.get(`/organization/${organizationId}`, { params });
  }

  async getByPlan(planId, params = {}) {
    return this.get(`/plan/${planId}`, { params });
  }

  async getByStatus(status, params = {}) {
    return this.get(`/status/${status}`, { params });
  }

  async getByBillingCycle(billingCycle, params = {}) {
    return this.get(`/billing-cycle/${billingCycle}`, { params });
  }

  async getActiveTrials(params = {}) {
    return this.get('/trial/active', { params });
  }

  async getExpiredTrials(params = {}) {
    return this.get('/trial/expired', { params });
  }

  async getExpiringSubscriptions(params = {}) {
    return this.get('/expiring', { params });
  }

  async getUsageOverview(params = {}) {
    return this.get('/usage/overview', { params });
  }

  async bulkUpdate(items) {
    return this.bulkOperation('update', items);
  }

  async bulkCancel(items) {
    return this.bulkOperation('cancel', items);
  }

  async bulkRenew(items) {
    return this.bulkOperation('renew', items);
  }

  // Organization-scoped methods
  async getMySubscription(params = {}) {
    return this.get('/my-subscription', { params });
  }

  async getMyUsage(params = {}) {
    return this.get('/my-subscription/usage', { params });
  }

  async getMyBilling(params = {}) {
    return this.get('/my-subscription/billing', { params });
  }

  async getMyInvoices(params = {}) {
    return this.get('/my-subscription/invoices', { params });
  }

  async getMyHistory(params = {}) {
    return this.get('/my-subscription/history', { params });
  }

  async getMyMetrics(params = {}) {
    return this.get('/my-subscription/metrics', { params });
  }

  async requestUpgrade(data) {
    return this.patch('/my-subscription/upgrade', data);
  }

  async requestDowngrade(data) {
    return this.patch('/my-subscription/downgrade', data);
  }

  async requestCancellation(data) {
    return this.patch('/my-subscription/cancel', data);
  }

  async requestRenewal(data) {
    return this.patch('/my-subscription/renew', data);
  }

  async comparePlans(params = {}) {
    return this.get('/plans/compare', { params });
  }

  async getAvailablePlans(params = {}) {
    return this.get('/plans/available', { params });
  }

  async getRecommendedPlans(params = {}) {
    return this.get('/plans/recommended', { params });
  }

  async getUpgradeOptions(params = {}) {
    return this.get('/plans/upgrade-options', { params });
  }
}

/**
 * Analytics API Service
 */
export class AnalyticsApiService extends BaseApiService {
  constructor() {
    super(API_ENDPOINTS.ANALYTICS.BASE);
  }

  // Analytics-specific methods
  async getDashboard(params = {}) {
    return this.get('/dashboard', { params });
  }

  async getRealtime(params = {}) {
    return this.get('/realtime', { params });
  }

  async getUsage(params = {}) {
    return this.get('/usage', { params });
  }

  async getPerformance(params = {}) {
    return this.get('/performance', { params });
  }

  async getConversations(params = {}) {
    return this.get('/conversations', { params });
  }

  async getUsers(params = {}) {
    return this.get('/users', { params });
  }

  async getRevenue(params = {}) {
    return this.get('/revenue', { params });
  }

  async getWorkflowExecution(data) {
    return this.post('/workflow-execution', data);
  }

  async getAiAgentWorkflow(params = {}) {
    return this.get('/ai-agent-workflow', { params });
  }

  async getWorkflowPerformance(params = {}) {
    return this.get('/workflow-performance', { params });
  }

  async getChatbot(chatbotId, params = {}) {
    return this.get(`/chatbot/${chatbotId}`, { params });
  }
}

/**
 * Chatbot API Service
 */
export class ChatbotApiService extends BaseApiService {
  constructor() {
    super(API_ENDPOINTS.CHATBOTS.BASE);
  }

  // Chatbot-specific methods
  async test(id, data) {
    return this.post(`/${id}/test`, data);
  }

  async train(id, data) {
    return this.post(`/${id}/train`, data);
  }

  async chat(id, data) {
    return this.post(`/${id}/chat`, data);
  }
}

/**
 * Conversation API Service
 */
export class ConversationApiService extends BaseApiService {
  constructor() {
    super(API_ENDPOINTS.CONVERSATIONS.BASE);
  }

  // Conversation-specific methods
  async getHistory(params = {}) {
    return this.get('/history', { params });
  }

  async logConversation(data) {
    return this.post('/log', data);
  }

  async getMessages(id, params = {}) {
    return this.get(`/${id}/messages`, { params });
  }

  async sendMessage(id, data) {
    return this.post(`/${id}/messages`, data);
  }

  async endConversation(id) {
    return this.post(`/${id}/end`);
  }

  async transferConversation(id, data) {
    return this.post(`/${id}/transfer`, data);
  }
}

// Export service instances
export const userApi = new UserApiService();
export const organizationApi = new OrganizationApiService();
export const subscriptionApi = new SubscriptionApiService();
export const analyticsApi = new AnalyticsApiService();
export const chatbotApi = new ChatbotApiService();
export const conversationApi = new ConversationApiService();

export default {
  BaseApiService,
  UserApiService,
  OrganizationApiService,
  SubscriptionApiService,
  AnalyticsApiService,
  ChatbotApiService,
  ConversationApiService,
  userApi,
  organizationApi,
  subscriptionApi,
  analyticsApi,
  chatbotApi,
  conversationApi
};
