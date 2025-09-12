import { useState, useEffect, useCallback } from 'react';
import ClientManagementService from '@/services/ClientManagementService';

export const useClientAnalytics = (timeRange = '30d') => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get analytics from API
      const response = await ClientManagementService.getAnalytics({
        time_range: timeRange
      });

      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        throw new Error(response.error || 'Failed to load analytics');
      }
    } catch (error) {
      setError(error.message);

      // Fallback to mock data if API fails
      const mockAnalytics = {
        overview: {
          totalOrganizations: 156,
          activeOrganizations: 142,
          trialOrganizations: 14,
          suspendedOrganizations: 8,
          totalUsers: 2341,
          totalRevenue: 45600,
          growthRate: 12.5,
          churnRate: 2.3
        },
        trends: [
          { month: 'Jan', organizations: 120, users: 1800, revenue: 35000 },
          { month: 'Feb', organizations: 135, users: 1950, revenue: 38000 },
          { month: 'Mar', organizations: 142, users: 2100, revenue: 41000 },
          { month: 'Apr', organizations: 156, users: 2341, revenue: 45600 }
        ],
        topPerformingOrgs: [
          { name: 'TechCorp Solutions', users: 245, revenue: 12500, growth: 18.5 },
          { name: 'Digital Innovators', users: 189, revenue: 9800, growth: 15.2 },
          { name: 'Smart Business Ltd', users: 156, revenue: 8200, growth: 12.8 },
          { name: 'Future Systems', users: 134, revenue: 7100, growth: 10.5 },
          { name: 'CloudTech Inc', users: 112, revenue: 6300, growth: 8.9 }
        ],
        industryDistribution: [
          { name: 'Technology', count: 45, percentage: 28.8 },
          { name: 'Healthcare', count: 32, percentage: 20.5 },
          { name: 'Finance', count: 28, percentage: 17.9 },
          { name: 'Education', count: 24, percentage: 15.4 },
          { name: 'Retail', count: 18, percentage: 11.5 },
          { name: 'Other', count: 9, percentage: 5.8 }
        ],
        subscriptionBreakdown: [
          { plan: 'Enterprise', count: 42, revenue: 25200, percentage: 26.9 },
          { plan: 'Professional', count: 68, revenue: 15300, percentage: 43.6 },
          { plan: 'Basic', count: 32, revenue: 3200, percentage: 20.5 },
          { plan: 'Trial', count: 14, revenue: 0, percentage: 9.0 }
        ],
        recentActivity: [
          {
            id: 1,
            type: 'new_signup',
            organization: 'InnovateTech Solutions',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            details: 'New organization signup - Professional plan'
          },
          {
            id: 2,
            type: 'upgrade',
            organization: 'Digital Dynamics',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            details: 'Upgraded from Basic to Professional plan'
          },
          {
            id: 3,
            type: 'user_added',
            organization: 'TechCorp Solutions',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            details: 'Added 5 new users to organization'
          },
          {
            id: 4,
            type: 'payment',
            organization: 'Smart Business Ltd',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            details: 'Monthly payment processed successfully'
          },
          {
            id: 5,
            type: 'trial_started',
            organization: 'NextGen Enterprises',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
            details: 'Started 14-day trial period'
          }
        ],
        metrics: {
          avgUsersPerOrg: 15.0,
          avgRevenuePerOrg: 292.31,
          customerSatisfaction: 4.6,
          apiUsage: 89.2,
          uptime: 99.9,
          supportTickets: 23
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setAnalyticsData(mockAnalytics);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const refreshAnalytics = useCallback(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analyticsData,
    loading,
    error,
    refreshAnalytics
  };
};
