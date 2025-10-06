import { useState, useEffect, useCallback, useRef } from 'react';
import agentDashboardService from '@/services/AgentDashboardService';

/**
 * Custom hook for managing agent dashboard data
 */
export const useAgentDashboard = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    dateRange = { days: 7 },
    onError = null,
    onSuccess = null
  } = options;

  // State management
  const [data, setData] = useState({
    stats: null,
    recentSessions: null,
    performanceMetrics: null,
    workload: null,
    realtimeActivity: null,
    conversationInsights: null
  });

  const [loading, setLoading] = useState({
    stats: false,
    recentSessions: false,
    performanceMetrics: false,
    workload: false,
    realtimeActivity: false,
    conversationInsights: false,
    all: false
  });

  const [errors, setErrors] = useState({
    stats: null,
    recentSessions: null,
    performanceMetrics: null,
    workload: null,
    realtimeActivity: null,
    conversationInsights: null,
    all: null
  });

  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Update loading state for specific data type
   */
  const updateLoading = useCallback((type, isLoading) => {
    if (!isMountedRef.current) return;

    setLoading(prev => ({
      ...prev,
      [type]: isLoading
    }));
  }, []);

  /**
   * Update error state for specific data type
   */
  const updateError = useCallback((type, error) => {
    if (!isMountedRef.current) return;

    setErrors(prev => ({
      ...prev,
      [type]: error
    }));

    if (error && onError) {
      onError(type, error);
    }
  }, [onError]);

  /**
   * Update data state for specific data type
   */
  const updateData = useCallback((type, newData) => {
    if (!isMountedRef.current) return;

    setData(prev => ({
      ...prev,
      [type]: newData
    }));

    if (onSuccess) {
      onSuccess(type, newData);
    }
  }, [onSuccess]);

  /**
   * Fetch dashboard statistics
   */
  const fetchStats = useCallback(async (params = {}) => {
    try {
      updateLoading('stats', true);
      updateError('stats', null);

      const response = await agentDashboardService.getDashboardStats({
        ...dateRange,
        ...params
      });

      if (response?.success) {
        updateData('stats', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      updateError('stats', error);
    } finally {
      updateLoading('stats', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch recent sessions
   */
  const fetchRecentSessions = useCallback(async (params = {}) => {
    try {
      updateLoading('recentSessions', true);
      updateError('recentSessions', null);

      const response = await agentDashboardService.getRecentSessions(params);

      if (response?.success) {
        updateData('recentSessions', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch recent sessions');
      }
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      updateError('recentSessions', error);
    } finally {
      updateLoading('recentSessions', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch performance metrics
   */
  const fetchPerformanceMetrics = useCallback(async (params = {}) => {
    try {
      updateLoading('performanceMetrics', true);
      updateError('performanceMetrics', null);

      const response = await agentDashboardService.getPerformanceMetrics(params);

      if (response?.success) {
        updateData('performanceMetrics', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch performance metrics');
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      updateError('performanceMetrics', error);
    } finally {
      updateLoading('performanceMetrics', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch workload data
   */
  const fetchWorkload = useCallback(async () => {
    try {
      updateLoading('workload', true);
      updateError('workload', null);

      const response = await agentDashboardService.getWorkload();

      if (response?.success) {
        updateData('workload', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch workload');
      }
    } catch (error) {
      console.error('Error fetching workload:', error);
      updateError('workload', error);
    } finally {
      updateLoading('workload', false);
    }
  }, [updateLoading, updateError, updateData]);

  // Realtime activity disabled
  // /**
  //  * Fetch real-time activity
  //  */
  // const fetchRealtimeActivity = useCallback(async () => {
  //   // Realtime messaging disabled
  // }, []);

  /**
   * Fetch conversation insights
   */
  const fetchConversationInsights = useCallback(async (params = {}) => {
    try {
      updateLoading('conversationInsights', true);
      updateError('conversationInsights', null);

      const response = await agentDashboardService.getConversationInsights(params);

      if (response?.success) {
        updateData('conversationInsights', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch conversation insights');
      }
    } catch (error) {
      console.error('Error fetching conversation insights:', error);
      updateError('conversationInsights', error);
    } finally {
      updateLoading('conversationInsights', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch all dashboard data
   */
  const fetchAllData = useCallback(async (params = {}) => {
    try {
      updateLoading('all', true);
      updateError('all', null);

      const response = await agentDashboardService.getDashboardData({
        ...dateRange,
        ...params
      });

      if (response) {
        // Update individual data states
        if (response.stats) updateData('stats', response.stats.data);
        if (response.recentSessions) updateData('recentSessions', response.recentSessions.data);
        if (response.performanceMetrics) updateData('performanceMetrics', response.performanceMetrics.data);
        if (response.workload) updateData('workload', response.workload.data);
        // if (response.realtimeActivity) updateData('realtimeActivity', response.realtimeActivity.data); // Disabled - realtime removed
        if (response.conversationInsights) updateData('conversationInsights', response.conversationInsights.data);

        // Update individual error states
        if (response.errors) {
          Object.keys(response.errors).forEach(key => {
            if (response.errors[key]) {
              updateError(key, response.errors[key]);
            }
          });
        }

        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      updateError('all', error);
    } finally {
      updateLoading('all', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Refresh specific data type
   */
  const refresh = useCallback(async (type = 'all', params = {}) => {
    switch (type) {
      case 'stats':
        await fetchStats(params);
        break;
      case 'recentSessions':
        await fetchRecentSessions(params);
        break;
      case 'performanceMetrics':
        await fetchPerformanceMetrics(params);
        break;
      case 'workload':
        await fetchWorkload();
        break;
      // case 'realtimeActivity': // Disabled - realtime removed
      //   await fetchRealtimeActivity();
      //   break;
      case 'conversationInsights':
        await fetchConversationInsights(params);
        break;
      case 'all':
      default:
        await fetchAllData(params);
        break;
    }
  }, [fetchStats, fetchRecentSessions, fetchPerformanceMetrics, fetchWorkload, /* fetchRealtimeActivity, */ fetchConversationInsights, fetchAllData]);

  /**
   * Set up auto-refresh
   */
  const setupAutoRefresh = useCallback(() => {
    if (!autoRefresh || !isMountedRef.current) return;

    refreshTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        // refresh('realtimeActivity'); // Disabled - realtime removed
        setupAutoRefresh();
      }
    }, refreshInterval);
  }, [autoRefresh, refreshInterval, refresh]);

  /**
   * Clear auto-refresh timeout
   */
  const clearAutoRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  /**
   * Initialize data fetching
   */
  useEffect(() => {
    if (isMountedRef.current) {
      fetchAllData();
    }

    return () => {
      clearAutoRefresh();
    };
  }, []); // Remove dependencies to prevent infinite loop

  /**
   * Set up auto-refresh
   */
  useEffect(() => {
    if (autoRefresh) {
      setupAutoRefresh();
    }

    return () => {
      clearAutoRefresh();
    };
  }, [autoRefresh]); // Remove setupAutoRefresh and clearAutoRefresh dependencies

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearAutoRefresh();
    };
  }, []); // Remove clearAutoRefresh dependency

  /**
   * Check if any data is loading
   */
  const isLoading = Object.values(loading).some(Boolean);

  /**
   * Check if any data has errors
   */
  const hasErrors = Object.values(errors).some(Boolean);

  /**
   * Get loading state for specific data type
   */
  const isLoadingType = useCallback((type) => {
    return loading[type] || false;
  }, [loading]);

  /**
   * Get error for specific data type
   */
  const getError = useCallback((type) => {
    return errors[type] || null;
  }, [errors]);

  /**
   * Get data for specific data type
   */
  const getData = useCallback((type) => {
    return data[type] || null;
  }, [data]);

  return {
    // Data
    data,
    stats: data.stats,
    recentSessions: data.recentSessions,
    performanceMetrics: data.performanceMetrics,
    workload: data.workload,
    // realtimeActivity: data.realtimeActivity, // Disabled - realtime removed
    conversationInsights: data.conversationInsights,

    // Loading states
    loading,
    isLoading,
    isLoadingType,

    // Error states
    errors,
    hasErrors,
    getError,

    // Utility functions
    getData,
    refresh,
    fetchStats,
    fetchRecentSessions,
    fetchPerformanceMetrics,
    fetchWorkload,
    // fetchRealtimeActivity, // Disabled - realtime removed
    fetchConversationInsights,
    fetchAllData,

    // Metadata
    lastUpdated,
    autoRefresh,
    refreshInterval
  };
};

export default useAgentDashboard;
