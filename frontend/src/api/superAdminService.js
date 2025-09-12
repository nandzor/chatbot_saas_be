import { api } from './axios';

/**
 * SuperAdmin API Service
 * Comprehensive service layer for SuperAdmin functionality
 * Following Backend API structure with proper error handling
 */

class SuperAdminService {
  // ============================================================================
  // ANALYTICS & DASHBOARD
  // ============================================================================

  // Get dashboard analytics
  async getDashboardAnalytics() {
    try {
      const response = await api.get('/api/v1/analytics/dashboard');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard analytics'
      };
    }
  }

  // Get real-time analytics
  async getRealtimeAnalytics() {
    try {
      const response = await api.get('/api/v1/analytics/realtime');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch realtime analytics'
      };
    }
  }

  // Get usage analytics
  async getUsageAnalytics(params = {}) {
    try {
      const response = await api.get('/api/v1/analytics/usage', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch usage analytics'
      };
    }
  }

  // Get performance analytics
  async getPerformanceAnalytics(params = {}) {
    try {
      const response = await api.get('/api/v1/analytics/performance', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch performance analytics'
      };
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(params = {}) {
    try {
      const response = await api.get('/api/v1/analytics/revenue', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch revenue analytics'
      };
    }
  }

  // Export analytics data
  async exportAnalytics(format = 'csv', params = {}) {
    try {
      const response = await api.post('/api/v1/analytics/export', { format, ...params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export analytics data'
      };
    }
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  // Get all users
  async getUsers(params = {}) {
    try {
      const response = await api.get('/api/v1/users', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users'
      };
    }
  }

  // Get user by ID
  async getUser(userId) {
    try {
      const response = await api.get(`/api/v1/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user'
      };
    }
  }

  // Create user
  async createUser(userData) {
    try {
      const response = await api.post('/api/v1/users', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create user'
      };
    }
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const response = await api.put(`/api/v1/users/${userId}`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user'
      };
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/api/v1/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      };
    }
  }

  // Toggle user status
  async toggleUserStatus(userId) {
    try {
      const response = await api.patch(`/api/v1/users/${userId}/toggle-status`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to toggle user status'
      };
    }
  }

  // Search users
  async searchUsers(query, params = {}) {
    try {
      const response = await api.get('/api/v1/users/search', {
        params: { q: query, ...params }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search users'
      };
    }
  }

  // Get user statistics
  async getUserStatistics() {
    try {
      const response = await api.get('/api/v1/users/statistics');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user statistics'
      };
    }
  }

  // Bulk update users
  async bulkUpdateUsers(userIds, updateData) {
    try {
      const response = await api.patch('/api/v1/users/bulk-update', {
        user_ids: userIds,
        ...updateData
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to bulk update users'
      };
    }
  }

  // ============================================================================
  // ORGANIZATION MANAGEMENT
  // ============================================================================

  // Get all organizations
  async getOrganizations(params = {}) {
    try {
      const response = await api.get('/api/v1/organizations', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organizations'
      };
    }
  }

  // Get organization by ID
  async getOrganization(organizationId) {
    try {
      const response = await api.get(`/api/v1/organizations/${organizationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organization'
      };
    }
  }

  // Create organization
  async createOrganization(organizationData) {
    try {
      const response = await api.post('/api/v1/organizations', organizationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create organization'
      };
    }
  }

  // Update organization
  async updateOrganization(organizationId, organizationData) {
    try {
      const response = await api.put(`/api/v1/organizations/${organizationId}`, organizationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update organization'
      };
    }
  }

  // Delete organization
  async deleteOrganization(organizationId) {
    try {
      const response = await api.delete(`/api/v1/organizations/${organizationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete organization'
      };
    }
  }

  // Get organization statistics
  async getOrganizationStatistics() {
    try {
      const response = await api.get('/api/v1/organizations/statistics');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organization statistics'
      };
    }
  }

  // Search organizations
  async searchOrganizations(query, params = {}) {
    try {
      const response = await api.get('/api/v1/organizations/search', {
        params: { q: query, ...params }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search organizations'
      };
    }
  }

  // Get organization analytics
  async getOrganizationAnalytics(organizationId) {
    try {
      const response = await api.get(`/api/v1/organizations/${organizationId}/analytics`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organization analytics'
      };
    }
  }

  // Get organization users
  async getOrganizationUsers(organizationId, params = {}) {
    try {
      const response = await api.get(`/api/v1/organizations/${organizationId}/users`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch organization users'
      };
    }
  }

  // Add user to organization
  async addUserToOrganization(organizationId, userId) {
    try {
      const response = await api.post(`/api/v1/organizations/${organizationId}/users`, {
        user_id: userId
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add user to organization'
      };
    }
  }

  // Remove user from organization
  async removeUserFromOrganization(organizationId, userId) {
    try {
      const response = await api.delete(`/api/v1/organizations/${organizationId}/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove user from organization'
      };
    }
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  // Get all subscriptions
  async getSubscriptions(params = {}) {
    try {
      const response = await api.get('/api/v1/subscriptions', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscriptions'
      };
    }
  }

  // Get subscription by ID
  async getSubscription(subscriptionId) {
    try {
      const response = await api.get(`/api/v1/subscriptions/${subscriptionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription'
      };
    }
  }

  // Create subscription
  async createSubscription(subscriptionData) {
    try {
      const response = await api.post('/api/v1/subscriptions', subscriptionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create subscription'
      };
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, subscriptionData) {
    try {
      const response = await api.put(`/api/v1/subscriptions/${subscriptionId}`, subscriptionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update subscription'
      };
    }
  }

  // Delete subscription
  async deleteSubscription(subscriptionId) {
    try {
      const response = await api.delete(`/api/v1/subscriptions/${subscriptionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete subscription'
      };
    }
  }

  // Activate subscription
  async activateSubscription(subscriptionId) {
    try {
      const response = await api.patch(`/api/v1/subscriptions/${subscriptionId}/activate`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to activate subscription'
      };
    }
  }

  // Suspend subscription
  async suspendSubscription(subscriptionId) {
    try {
      const response = await api.patch(`/api/v1/subscriptions/${subscriptionId}/suspend`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to suspend subscription'
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await api.patch(`/api/v1/subscriptions/${subscriptionId}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel subscription'
      };
    }
  }

  // Get subscription statistics
  async getSubscriptionStatistics() {
    try {
      const response = await api.get('/api/v1/subscriptions/statistics');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription statistics'
      };
    }
  }

  // ============================================================================
  // SUBSCRIPTION PLANS
  // ============================================================================

  // Get all subscription plans
  async getSubscriptionPlans(params = {}) {
    try {
      const response = await api.get('/api/v1/subscription-plans', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription plans'
      };
    }
  }

  // Get subscription plan by ID
  async getSubscriptionPlan(planId) {
    try {
      const response = await api.get(`/api/v1/subscription-plans/${planId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription plan'
      };
    }
  }

  // Create subscription plan
  async createSubscriptionPlan(planData) {
    try {
      const response = await api.post('/api/v1/subscription-plans', planData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create subscription plan'
      };
    }
  }

  // Update subscription plan
  async updateSubscriptionPlan(planId, planData) {
    try {
      const response = await api.put(`/api/v1/subscription-plans/${planId}`, planData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update subscription plan'
      };
    }
  }

  // Delete subscription plan
  async deleteSubscriptionPlan(planId) {
    try {
      const response = await api.delete(`/api/v1/subscription-plans/${planId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete subscription plan'
      };
    }
  }

  // ============================================================================
  // PAYMENT TRANSACTIONS
  // ============================================================================

  // Get all payment transactions
  async getPaymentTransactions(params = {}) {
    try {
      const response = await api.get('/api/v1/payment-transactions', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment transactions'
      };
    }
  }

  // Get payment transaction by ID
  async getPaymentTransaction(transactionId) {
    try {
      const response = await api.get(`/api/v1/payment-transactions/${transactionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment transaction'
      };
    }
  }

  // Refund payment transaction
  async refundPaymentTransaction(transactionId) {
    try {
      const response = await api.patch(`/api/v1/payment-transactions/${transactionId}/refund`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to refund payment transaction'
      };
    }
  }

  // Get payment transaction statistics
  async getPaymentTransactionStatistics() {
    try {
      const response = await api.get('/api/v1/payment-transactions/statistics');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch payment transaction statistics'
      };
    }
  }

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  // Get all roles
  async getRoles(params = {}) {
    try {
      const response = await api.get('/api/v1/roles', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch roles'
      };
    }
  }

  // Get role by ID
  async getRole(roleId) {
    try {
      const response = await api.get(`/api/v1/roles/${roleId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch role'
      };
    }
  }

  // Create role
  async createRole(roleData) {
    try {
      const response = await api.post('/api/v1/roles', roleData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create role'
      };
    }
  }

  // Update role
  async updateRole(roleId, roleData) {
    try {
      const response = await api.put(`/api/v1/roles/${roleId}`, roleData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update role'
      };
    }
  }

  // Delete role
  async deleteRole(roleId) {
    try {
      const response = await api.delete(`/api/v1/roles/${roleId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete role'
      };
    }
  }

  // Assign role to user
  async assignRole(roleId, userId) {
    try {
      const response = await api.post('/api/v1/roles/assign', {
        role_id: roleId,
        user_id: userId
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign role'
      };
    }
  }

  // Revoke role from user
  async revokeRole(roleId, userId) {
    try {
      const response = await api.post('/api/v1/roles/revoke', {
        role_id: roleId,
        user_id: userId
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to revoke role'
      };
    }
  }

  // ============================================================================
  // PERMISSION MANAGEMENT
  // ============================================================================

  // Get all permissions
  async getPermissions(params = {}) {
    try {
      const response = await api.get('/api/v1/permissions', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch permissions'
      };
    }
  }

  // Get permission by ID
  async getPermission(permissionId) {
    try {
      const response = await api.get(`/api/v1/permissions/${permissionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch permission'
      };
    }
  }

  // Create permission
  async createPermission(permissionData) {
    try {
      const response = await api.post('/api/v1/permissions', permissionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create permission'
      };
    }
  }

  // Update permission
  async updatePermission(permissionId, permissionData) {
    try {
      const response = await api.put(`/api/v1/permissions/${permissionId}`, permissionData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update permission'
      };
    }
  }

  // Delete permission
  async deletePermission(permissionId) {
    try {
      const response = await api.delete(`/api/v1/permissions/${permissionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete permission'
      };
    }
  }

  // ============================================================================
  // SYSTEM HEALTH & MONITORING
  // ============================================================================

  // Get system health
  async getSystemHealth() {
    try {
      const response = await api.get('/api/health');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch system health'
      };
    }
  }

  // Get detailed health check
  async getDetailedHealthCheck() {
    try {
      const response = await api.get('/api/health/detailed');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch detailed health check'
      };
    }
  }

  // Get system metrics
  async getSystemMetrics() {
    try {
      const response = await api.get('/api/health/metrics');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch system metrics'
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  // Check if user has permission
  async checkPermission(permission) {
    try {
      const response = await api.post('/api/v1/permissions/users/check-permission', {
        permission
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check permission'
      };
    }
  }

  // Get current user info
  async getCurrentUser() {
    try {
      const response = await api.get('/api/v1/me');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch current user'
      };
    }
  }

  // Update current user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/api/v1/me/profile', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile'
      };
    }
  }
}

export default new SuperAdminService();
