import api from './api';
import { subscriptionPlansData, subscriptionPlansMetadata } from '@/data/sampleData';

class SubscriptionPlansService {
  constructor() {
    this.baseUrl = '/v1/subscription-plans';
  }

  /**
   * Transform backend subscription plan shape to frontend shape used by UI
   */
  transformBackendPlan(plan) {
    if (!plan) return null;

    const monthlyPrice = plan?.pricing?.monthly?.price;
    const yearlyPrice = plan?.pricing?.yearly?.price;

    const currency = plan?.pricing?.monthly?.currency || plan?.pricing?.yearly?.currency || 'IDR';

    const toNumber = (val, fallback = 0) => {
      if (val === null || val === undefined) return fallback;
      const n = typeof val === 'string' ? parseFloat(val) : Number(val);
      return Number.isFinite(n) ? n : fallback;
    };

    return {
      id: plan.id || '',
      name: plan.display_name || plan.name || 'Unknown Plan',
      tier: plan.tier || 'basic',
      description: plan.description || '',

      // Pricing normalized to numeric values
      priceMonthly: toNumber(monthlyPrice, 0),
      priceYearly: toNumber(yearlyPrice, 0),
      currency,

      // Limits mapping
      maxAgents: toNumber(plan?.limits?.max_agents, 0),
      maxChannels: toNumber(plan?.limits?.max_channels, 0),
      maxKnowledgeArticles: toNumber(plan?.limits?.max_knowledge_articles, 0),
      maxMonthlyMessages: toNumber(plan?.limits?.max_monthly_messages, 0),
      maxMonthlyAiRequests: toNumber(plan?.limits?.max_monthly_ai_requests, 0),
      maxStorageGb: toNumber(plan?.limits?.max_storage_gb, 0),
      maxApiCallsPerDay: toNumber(plan?.limits?.max_api_calls_per_day, 0),

      // Features and flags
      features: Array.isArray(plan?.features) ? plan.features : [],
      trialDays: toNumber(plan?.trial_days, 0),
      isPopular: Boolean(plan?.is_popular),
      isCustom: Boolean(plan?.is_custom),
      sortOrder: toNumber(plan?.sort_order, 0),
      status: plan?.status || 'inactive',
      isActive: plan?.status === 'active',

      // UI helpers
      highlights: plan?.is_popular ? ['Terpopuler'] : [],

      // Stats (backend may not provide; default to 0)
      activeSubscriptions: toNumber(plan?.active_subscriptions, 0),
      totalRevenue: toNumber(plan?.total_revenue, 0),

      createdAt: plan?.created_at || null,
      updatedAt: plan?.updated_at || null,
    };
  }

  /**
   * Get all subscription plans with pagination and filters
   */
  async getSubscriptionPlans(params = {}) {
    try {
      const response = await api.get(this.baseUrl, { params });
      // Extract array from various shapes
      const raw = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.data) ? response.data.data : null);

      const source = raw || subscriptionPlansData;
      // Map to FE shape
      return source.map((p) => this.transformBackendPlan(p)).filter(Boolean);
    } catch (error) {
      // Fallback to sample data if API is not available
      console.warn('API not available, using sample data:', error.message);
      return subscriptionPlansData.map((p) => this.transformBackendPlan(p)).filter(Boolean);
    }
  }

  /**
   * Get a specific subscription plan with details
   */
  async getPlan(id) {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      const raw = response?.data?.data ?? response?.data ?? null;
      return this.transformBackendPlan(raw);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new subscription plan
   */
  async createPlan(planData) {
    try {
      const response = await api.post(this.baseUrl, planData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing subscription plan
   */
  async updatePlan(id, planData) {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, planData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a subscription plan
   */
  async deletePlan(id) {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get popular subscription plans
   */
  async getPopularPlans() {
    try {
      const response = await api.get(`${this.baseUrl}/popular`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get plans by tier
   */
  async getPlansByTier(tier) {
    try {
      const response = await api.get(`${this.baseUrl}/tier/${tier}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get custom plans
   */
  async getCustomPlans() {
    try {
      const response = await api.get(`${this.baseUrl}/custom`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get subscription plans statistics
   */
  async getStatistics() {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Toggle popular status of a plan
   */
  async togglePopular(id) {
    try {
      const response = await api.patch(`${this.baseUrl}/${id}/toggle-popular`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update sort order of plans
   */
  async updateSortOrder(sortData) {
    try {
      const response = await api.patch(`${this.baseUrl}/sort-order`, sortData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get metadata for subscription plans
   */
  async getMetadata() {
    try {
      // For now, return sample metadata since this might not be implemented in backend yet
      return subscriptionPlansMetadata;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export subscription plans data to JSON
   */
  exportToJSON() {
    try {
      const exportData = {
        plans: subscriptionPlansData,
        metadata: subscriptionPlansMetadata,
        exportedAt: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `subscription-plans-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    console.error('SubscriptionPlansService Error:', error);

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'An error occurred';

      return {
        status,
        message,
        data: data?.data || null,
        errors: data?.errors || null
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        status: 0,
        message: 'Network error - please check your connection',
        data: null,
        errors: null
      };
    } else {
      // Something else happened
      return {
        status: 0,
        message: error.message || 'An unexpected error occurred',
        data: null,
        errors: null
      };
    }
  }
}

// Create and export a singleton instance
const subscriptionPlansService = new SubscriptionPlansService();
export default subscriptionPlansService;
