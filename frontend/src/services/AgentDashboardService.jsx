/* eslint-disable no-console */
import { authService } from './AuthService';
import { handleError } from '@/utils/errorHandler';

class AgentDashboardService {
  constructor() {
    this.authService = authService;
    this.initialized = false;
    this.initializeService();
  }

  /**
   * Initialize the service and verify dependencies
   */
  initializeService() {
    try {
      if (!this.authService) {
        throw new Error('AuthService is not available');
      }

      if (!this.authService.api) {
        throw new Error('AuthService API instance is not available');
      }

      // Test if the API instance is functional
      if (typeof this.authService.api.request !== 'function') {
        throw new Error('AuthService API request method is not available');
      }

      this.initialized = true;
      console.log('✅ AgentDashboardService initialized successfully');
    } catch (error) {
      console.error('❌ AgentDashboardService initialization failed:', error);
      this.initialized = false;
    }
  }

  /**
   * Check if service is ready for API calls
   */
  isReady() {
    return this.initialized && this.authService && this.authService.api;
  }

  /**
   * Wait for service to be ready
   */
  async waitForReady(timeout = 5000) {
    const startTime = Date.now();

    while (!this.isReady() && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.isReady()) {
      throw new Error('AgentDashboardService failed to initialize within timeout');
    }

    return true;
  }

  /**
   * Make API call with proper error handling
   */
  async _makeApiCall(apiCall, ...args) {
    try {
      await this.waitForReady();

      if (!this.isReady()) {
        throw new Error('AgentDashboardService is not ready');
      }

      const response = await apiCall(...args);

      if (response.status >= 400) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ AgentDashboardService API call failed:', error);
      handleError(error);
      throw error;
    }
  }

  /**
   * Get agent dashboard statistics
   */
  async getDashboardStats(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);

      const url = `/v1/inbox/agent-dashboard/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get agent's recent sessions
   */
  async getRecentSessions(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.status) queryParams.append('status', params.status);
      if (params.resolved !== undefined) queryParams.append('resolved', params.resolved);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.per_page) queryParams.append('per_page', params.per_page);

      const url = `/v1/inbox/agent-dashboard/recent-sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      throw error;
    }
  }

  /**
   * Get agent's performance metrics
   */
  async getPerformanceMetrics(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.days) queryParams.append('days', params.days);

      const url = `/v1/inbox/agent-dashboard/performance-metrics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get conversation analytics for a specific session
   */
  async getConversationAnalytics(sessionId) {
    try {
      const url = `/v1/inbox/agent-dashboard/conversation-analytics?session_id=${sessionId}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('Error fetching conversation analytics:', error);
      throw error;
    }
  }

  /**
   * Get agent's current workload
   */
  async getWorkload() {
    try {
      const url = '/v1/inbox/agent-dashboard/workload';

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('Error fetching workload:', error);
      throw error;
    }
  }

  /**
   * Get agent's real-time activity
   */
  // Realtime activity disabled
  // async getRealtimeActivity() {
  //   // Realtime messaging disabled
  // }

  /**
   * Get agent's conversation insights
   */
  async getConversationInsights(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `/v1/inbox/agent-dashboard/conversation-insights${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      return await this._makeApiCall(
        this.authService.api.get,
        url
      );
    } catch (error) {
      console.error('Error fetching conversation insights:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(params = {}) {
    try {
      const [
        stats,
        recentSessions,
        performanceMetrics,
        workload,
        // realtimeActivity, // Disabled - realtime removed
        conversationInsights
      ] = await Promise.allSettled([
        this.getDashboardStats(params),
        this.getRecentSessions({ per_page: 10 }),
        this.getPerformanceMetrics({ days: 7 }),
        this.getWorkload(),
        // this.getRealtimeActivity(), // Disabled - realtime removed
        this.getConversationInsights({ limit: 5 })
      ]);

      return {
        stats: stats.status === 'fulfilled' ? stats.value : null,
        recentSessions: recentSessions.status === 'fulfilled' ? recentSessions.value : null,
        performanceMetrics: performanceMetrics.status === 'fulfilled' ? performanceMetrics.value : null,
        workload: workload.status === 'fulfilled' ? workload.value : null,
        // realtimeActivity: realtimeActivity.status === 'fulfilled' ? realtimeActivity.value : null, // Disabled - realtime removed
        conversationInsights: conversationInsights.status === 'fulfilled' ? conversationInsights.value : null,
        errors: {
          stats: stats.status === 'rejected' ? stats.reason : null,
          recentSessions: recentSessions.status === 'rejected' ? recentSessions.reason : null,
          performanceMetrics: performanceMetrics.status === 'rejected' ? performanceMetrics.reason : null,
          workload: workload.status === 'rejected' ? workload.reason : null,
          // realtimeActivity: realtimeActivity.status === 'rejected' ? realtimeActivity.reason : null, // Disabled - realtime removed
          conversationInsights: conversationInsights.status === 'rejected' ? conversationInsights.reason : null,
        }
      };
    } catch (error) {
      console.error('Error fetching comprehensive dashboard data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const agentDashboardService = new AgentDashboardService();

export default agentDashboardService;
