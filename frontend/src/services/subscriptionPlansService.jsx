import api from './api';
import { toFixedString, toInt } from '@/utils/number';
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

    const toNumber = (val, fallback = 0) => toInt(val, fallback);

    return {
      id: plan.id || '',
      name: plan.display_name || plan.name || 'Unknown Plan',
      tier: plan.tier || 'starter',
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
   * Build backend payload (snake_case, flat) from FE form/plan
   */
  buildBackendPayload(input) {
    const toStringNum = (val) => toFixedString(val, 2);

    return {
      name: input?.name ?? '',
      display_name: input?.display_name ?? input?.name ?? '',
      description: input?.description ?? '',
      tier: input?.tier ?? 'starter',
      price_monthly: toStringNum(input?.priceMonthly ?? input?.price_monthly),
      price_quarterly: toStringNum(input?.priceQuarterly ?? input?.price_quarterly),
      price_yearly: toStringNum(input?.priceYearly ?? input?.price_yearly),
      currency: input?.currency ?? 'IDR',
      max_agents: toInt(input?.maxAgents ?? input?.max_agents),
      max_channels: toInt(input?.maxChannels ?? input?.max_channels),
      max_knowledge_articles: toInt(input?.maxKnowledgeArticles ?? input?.max_knowledge_articles),
      max_monthly_messages: toInt(input?.maxMonthlyMessages ?? input?.maxMessagesPerMonth ?? input?.max_monthly_messages),
      max_monthly_ai_requests: toInt(input?.maxMonthlyAiRequests ?? input?.max_monthly_ai_requests),
      max_storage_gb: (input?.maxStorageGb ?? input?.max_storage_gb ?? 0).toString(),
      max_api_calls_per_day: toInt(input?.maxApiCallsPerDay ?? input?.max_api_calls_per_day),
      features: Array.isArray(input?.features) ? input.features : [],
      trial_days: toInt(input?.trialDays ?? input?.trial_days),
      is_popular: Boolean(input?.isPopular ?? input?.is_popular),
      is_custom: Boolean(input?.isCustom ?? input?.is_custom),
      sort_order: toInt(input?.sortOrder ?? input?.sort_order),
      status: input?.status ?? (input?.isActive ? 'active' : 'inactive'),
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
      const data = source.map((p) => this.transformBackendPlan(p)).filter(Boolean);

      return {
        data,
        message: response.data?.message || 'Data berhasil dimuat'
      };
    } catch (error) {
      // Fallback to sample data if API is not available
      console.warn('API not available, using sample data:', error.message);
      const data = subscriptionPlansData.map((p) => this.transformBackendPlan(p)).filter(Boolean);

      return {
        data,
        message: 'Menggunakan data sample'
      };
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
      const payload = this.buildBackendPayload(planData);
      const response = await api.post(this.baseUrl, payload);
      const raw = response?.data?.data ?? response?.data ?? null;
      const data = this.transformBackendPlan(raw);

      return {
        data,
        message: response.data?.message || 'Paket berlangganan berhasil dibuat'
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing subscription plan
   */
  async updatePlan(id, planData) {
    try {
      const payload = this.buildBackendPayload(planData);
      const response = await api.put(`${this.baseUrl}/${id}`, payload);
      const raw = response?.data?.data ?? response?.data ?? null;
      const data = this.transformBackendPlan(raw);

      return {
        data,
        message: response.data?.message || 'Paket berlangganan berhasil diperbarui'
      };
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
      return {
        data: response.data,
        message: response.data?.message || 'Paket berlangganan berhasil dihapus'
      };
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
