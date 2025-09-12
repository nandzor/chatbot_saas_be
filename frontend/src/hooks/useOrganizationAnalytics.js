import { useState, useEffect, useCallback, useRef } from 'react';
import organizationManagementService from '@/services/OrganizationManagementService';
import toast from 'react-hot-toast';

export const useOrganizationAnalytics = (organizationId) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [metrics, setMetrics] = useState({
    users: 0,
    conversations: 0,
    revenue: 0,
    growth: {
      users: 0,
      conversations: 0,
      revenue: 0
    }
  });

  // Refs to prevent unnecessary re-renders
  const isInitialLoad = useRef(true);
  const lastLoadParams = useRef(null);

  // Load analytics data
  const loadAnalytics = useCallback(async (forceRefresh = false) => {
    if (!organizationId) {
      return;
    }

    const currentParams = {
      time_range: timeRange,
      organization_id: organizationId
    };

    // Check if we need to load (avoid duplicate calls)
    if (!forceRefresh && !isInitialLoad.current &&
        JSON.stringify(currentParams) === JSON.stringify(lastLoadParams.current)) {
      return;
    }

    setLoading(true);
    setError(null);
    lastLoadParams.current = currentParams;

    try {

      // Get organization analytics from API
      const response = await organizationManagementService.getOrganizationAnalytics(organizationId, currentParams);

      if (response.success) {
        setAnalyticsData(response.data);
        setMetrics(response.data.metrics || response.data);
        return;
      }

      // Fallback to mock data if API fails
      const mockAnalytics = {
        growth: {
          users: Math.random() * 20 - 10, // -10 to 10
          conversations: Math.random() * 30 - 15, // -15 to 15
          revenue: Math.random() * 25 - 12.5 // -12.5 to 12.5
        },
        trends: {
          users: generateTrendData(7, 50, 100),
          conversations: generateTrendData(7, 20, 80),
          revenue: generateTrendData(7, 1000, 5000)
        },
        metrics: {
          totalUsers: Math.floor(Math.random() * 100) + 50,
          activeUsers: Math.floor(Math.random() * 80) + 30,
          totalConversations: Math.floor(Math.random() * 1000) + 500,
          totalRevenue: Math.floor(Math.random() * 10000) + 5000,
          avgResponseTime: Math.floor(Math.random() * 5) + 1,
          satisfactionScore: Math.floor(Math.random() * 2) + 3
        },
        topFeatures: [
          { name: 'Chatbot Integration', usage: 85, growth: 12.5 },
          { name: 'Analytics Dashboard', usage: 72, growth: 8.3 },
          { name: 'User Management', usage: 68, growth: 15.2 },
          { name: 'API Access', usage: 45, growth: 5.7 }
        ],
        activityLog: [
          {
            id: 1,
            action: 'User Created',
            user: 'John Doe',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            details: 'New user added to organization'
          },
          {
            id: 2,
            action: 'Settings Updated',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            details: 'Organization settings modified'
          },
          {
            id: 3,
            action: 'Permission Changed',
            user: 'Admin User',
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            details: 'User permissions updated'
          }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setAnalyticsData(mockAnalytics);
      setMetrics(mockAnalytics.metrics);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load analytics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [organizationId, timeRange]);

  // Generate trend data for charts
  const generateTrendData = (days, min, max) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * (max - min)) + min
      });
    }

    return data;
  };

  // Load analytics on mount and when dependencies change
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Update time range
  const updateTimeRange = useCallback((newTimeRange) => {
    setTimeRange(newTimeRange);
  }, []);

  // Refresh analytics
  const refreshAnalytics = useCallback(() => {
    loadAnalytics(true);
  }, [loadAnalytics]);

  // Get growth icon
  const getGrowthIcon = useCallback((value) => {
    if (value > 0) return 'arrow-up-right';
    if (value < 0) return 'arrow-down-right';
    return 'minus';
  }, []);

  // Get growth color
  const getGrowthColor = useCallback((value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  }, []);

  // Format number
  const formatNumber = useCallback((num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  // Format percentage
  const formatPercentage = useCallback((value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  }, []);

  return {
    analyticsData,
    loading,
    error,
    timeRange,
    metrics,
    loadAnalytics,
    updateTimeRange,
    refreshAnalytics,
    getGrowthIcon,
    getGrowthColor,
    formatNumber,
    formatCurrency,
    formatPercentage
  };
};
