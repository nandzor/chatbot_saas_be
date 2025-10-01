import { useState, useEffect, useCallback, useRef } from 'react';
import agentProfileService from '@/services/AgentProfileService';

/**
 * Custom hook for managing agent profile data
 */
export const useAgentProfile = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 60000, // 60 seconds
    onError = null,
    onSuccess = null
  } = options;

  // State management
  const [data, setData] = useState({
    userProfile: null,
    agentInfo: null,
    agentStatistics: null,
    notificationPreferences: null,
    personalTemplates: null,
    uiPreferences: null
  });

  const [loading, setLoading] = useState({
    userProfile: false,
    agentInfo: false,
    agentStatistics: false,
    notificationPreferences: false,
    personalTemplates: false,
    uiPreferences: false,
    all: false
  });

  const [errors, setErrors] = useState({
    userProfile: null,
    agentInfo: null,
    agentStatistics: null,
    notificationPreferences: null,
    personalTemplates: null,
    uiPreferences: null,
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
   * Fetch user profile
   */
  const fetchUserProfile = useCallback(async () => {
    try {
      updateLoading('userProfile', true);
      updateError('userProfile', null);

      const response = await agentProfileService.getCurrentUserProfile();

      if (response?.success) {
        updateData('userProfile', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      updateError('userProfile', error);
    } finally {
      updateLoading('userProfile', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch agent information
   */
  const fetchAgentInfo = useCallback(async () => {
    try {
      updateLoading('agentInfo', true);
      updateError('agentInfo', null);

      const response = await agentProfileService.getCurrentAgent();

      if (response?.success) {
        updateData('agentInfo', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch agent information');
      }
    } catch (error) {
      console.error('Error fetching agent info:', error);
      updateError('agentInfo', error);
    } finally {
      updateLoading('agentInfo', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch agent statistics
   */
  const fetchAgentStatistics = useCallback(async (params = {}) => {
    try {
      updateLoading('agentStatistics', true);
      updateError('agentStatistics', null);

      const response = await agentProfileService.getAgentStatistics(params);

      if (response?.success) {
        updateData('agentStatistics', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch agent statistics');
      }
    } catch (error) {
      console.error('Error fetching agent statistics:', error);
      updateError('agentStatistics', error);
    } finally {
      updateLoading('agentStatistics', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch notification preferences
   */
  const fetchNotificationPreferences = useCallback(async () => {
    try {
      updateLoading('notificationPreferences', true);
      updateError('notificationPreferences', null);

      const response = await agentProfileService.getNotificationPreferences();

      if (response?.success) {
        updateData('notificationPreferences', response.data.preferences);
      } else {
        throw new Error(response?.message || 'Failed to fetch notification preferences');
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      updateError('notificationPreferences', error);
    } finally {
      updateLoading('notificationPreferences', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch personal templates
   */
  const fetchPersonalTemplates = useCallback(async (params = {}) => {
    try {
      updateLoading('personalTemplates', true);
      updateError('personalTemplates', null);

      const response = await agentProfileService.getPersonalTemplates(params);

      if (response?.success) {
        updateData('personalTemplates', response.data);
      } else {
        throw new Error(response?.message || 'Failed to fetch personal templates');
      }
    } catch (error) {
      console.error('Error fetching personal templates:', error);
      updateError('personalTemplates', error);
    } finally {
      updateLoading('personalTemplates', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch UI preferences
   */
  const fetchUIPreferences = useCallback(async () => {
    try {
      updateLoading('uiPreferences', true);
      updateError('uiPreferences', null);

      const response = await agentProfileService.getUIPreferences();

      if (response?.success) {
        updateData('uiPreferences', response.data.preferences);
      } else {
        throw new Error(response?.message || 'Failed to fetch UI preferences');
      }
    } catch (error) {
      console.error('Error fetching UI preferences:', error);
      updateError('uiPreferences', error);
    } finally {
      updateLoading('uiPreferences', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Fetch all profile data
   */
  const fetchAllData = useCallback(async () => {
    try {
      updateLoading('all', true);
      updateError('all', null);

      const promises = [
        fetchUserProfile(),
        fetchAgentInfo(),
        fetchNotificationPreferences(),
        fetchUIPreferences()
      ];

      await Promise.allSettled(promises);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching all profile data:', error);
      updateError('all', error);
    } finally {
      updateLoading('all', false);
    }
  }, [fetchUserProfile, fetchAgentInfo, fetchNotificationPreferences, fetchUIPreferences, updateLoading, updateError]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      updateLoading('userProfile', true);
      updateError('userProfile', null);

      const formattedData = agentProfileService.formatProfileData(profileData);
      const response = await agentProfileService.updateProfile(formattedData);

      if (response?.success) {
        updateData('userProfile', response.data);
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      updateError('userProfile', error);
      throw error;
    } finally {
      updateLoading('userProfile', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Update agent availability
   */
  const updateAvailability = useCallback(async (availabilityData) => {
    try {
      updateLoading('agentInfo', true);
      updateError('agentInfo', null);

      const formattedData = agentProfileService.formatAvailabilityData(availabilityData);
      const response = await agentProfileService.updateAvailability(formattedData);

      if (response?.success) {
        updateData('agentInfo', response.data);
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to update availability');
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      updateError('agentInfo', error);
      throw error;
    } finally {
      updateLoading('agentInfo', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Upload avatar
   */
  const uploadAvatar = useCallback(async (file) => {
    try {
      updateLoading('userProfile', true);
      updateError('userProfile', null);

      const response = await agentProfileService.uploadAvatar(file);

      if (response?.success) {
        // Refresh user profile after avatar upload
        await fetchUserProfile();
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      updateError('userProfile', error);
      throw error;
    } finally {
      updateLoading('userProfile', false);
    }
  }, [fetchUserProfile, updateLoading, updateError]);

  /**
   * Change password
   */
  const changePassword = useCallback(async (passwordData) => {
    try {
      updateLoading('userProfile', true);
      updateError('userProfile', null);

      const response = await agentProfileService.changePassword(passwordData);

      if (response?.success) {
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      updateError('userProfile', error);
      throw error;
    } finally {
      updateLoading('userProfile', false);
    }
  }, [updateLoading, updateError]);

  /**
   * Update notification preferences
   */
  const updateNotificationPreferences = useCallback(async (preferences) => {
    try {
      updateLoading('notificationPreferences', true);
      updateError('notificationPreferences', null);

      const formattedData = agentProfileService.formatNotificationPreferences(preferences);
      const response = await agentProfileService.updateNotificationPreferences(formattedData);

      if (response?.success) {
        updateData('notificationPreferences', response.data);
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      updateError('notificationPreferences', error);
      throw error;
    } finally {
      updateLoading('notificationPreferences', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Create personal template
   */
  const createPersonalTemplate = useCallback(async (templateData) => {
    try {
      updateLoading('personalTemplates', true);
      updateError('personalTemplates', null);

      const formattedData = agentProfileService.formatTemplateData(templateData);
      const response = await agentProfileService.createPersonalTemplate(formattedData);

      if (response?.success) {
        // Refresh templates after creation
        await fetchPersonalTemplates();
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to create personal template');
      }
    } catch (error) {
      console.error('Error creating personal template:', error);
      updateError('personalTemplates', error);
      throw error;
    } finally {
      updateLoading('personalTemplates', false);
    }
  }, [fetchPersonalTemplates, updateLoading, updateError]);

  /**
   * Update personal template
   */
  const updatePersonalTemplate = useCallback(async (templateId, templateData) => {
    try {
      updateLoading('personalTemplates', true);
      updateError('personalTemplates', null);

      const formattedData = agentProfileService.formatTemplateData(templateData);
      const response = await agentProfileService.updatePersonalTemplate(templateId, formattedData);

      if (response?.success) {
        // Refresh templates after update
        await fetchPersonalTemplates();
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to update personal template');
      }
    } catch (error) {
      console.error('Error updating personal template:', error);
      updateError('personalTemplates', error);
      throw error;
    } finally {
      updateLoading('personalTemplates', false);
    }
  }, [fetchPersonalTemplates, updateLoading, updateError]);

  /**
   * Delete personal template
   */
  const deletePersonalTemplate = useCallback(async (templateId) => {
    try {
      updateLoading('personalTemplates', true);
      updateError('personalTemplates', null);

      const response = await agentProfileService.deletePersonalTemplate(templateId);

      if (response?.success) {
        // Refresh templates after deletion
        await fetchPersonalTemplates();
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to delete personal template');
      }
    } catch (error) {
      console.error('Error deleting personal template:', error);
      updateError('personalTemplates', error);
      throw error;
    } finally {
      updateLoading('personalTemplates', false);
    }
  }, [fetchPersonalTemplates, updateLoading, updateError]);

  /**
   * Update UI preferences
   */
  const updateUIPreferences = useCallback(async (preferences) => {
    try {
      updateLoading('uiPreferences', true);
      updateError('uiPreferences', null);

      const formattedData = agentProfileService.formatUIPreferences(preferences);
      const response = await agentProfileService.updateUIPreferences(formattedData);

      if (response?.success) {
        updateData('uiPreferences', response.data.preferences);
        return response.data.preferences;
      } else {
        throw new Error(response?.message || 'Failed to update UI preferences');
      }
    } catch (error) {
      console.error('Error updating UI preferences:', error);
      updateError('uiPreferences', error);
      throw error;
    } finally {
      updateLoading('uiPreferences', false);
    }
  }, [updateLoading, updateError, updateData]);

  /**
   * Export user data
   */
  const exportUserData = useCallback(async (format = 'json') => {
    try {
      const response = await agentProfileService.exportUserData(format);
      return response;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }, []);

  /**
   * Refresh specific data type
   */
  const refresh = useCallback(async (type = 'all', params = {}) => {
    switch (type) {
      case 'userProfile':
        await fetchUserProfile();
        break;
      case 'agentInfo':
        await fetchAgentInfo();
        break;
      case 'agentStatistics':
        await fetchAgentStatistics(params);
        break;
      case 'notificationPreferences':
        await fetchNotificationPreferences();
        break;
      case 'personalTemplates':
        await fetchPersonalTemplates(params);
        break;
      case 'uiPreferences':
        await fetchUIPreferences();
        break;
      case 'all':
      default:
        await fetchAllData();
        break;
    }
  }, [fetchUserProfile, fetchAgentInfo, fetchAgentStatistics, fetchNotificationPreferences, fetchPersonalTemplates, fetchUIPreferences, fetchAllData]);

  /**
   * Set up auto-refresh
   */
  const setupAutoRefresh = useCallback(() => {
    if (!autoRefresh || !isMountedRef.current) return;

    refreshTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        refresh('all');
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
    userProfile: data.userProfile,
    agentInfo: data.agentInfo,
    agentStatistics: data.agentStatistics,
    notificationPreferences: data.notificationPreferences,
    personalTemplates: data.personalTemplates,
    uiPreferences: data.uiPreferences,

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
    fetchUserProfile,
    fetchAgentInfo,
    fetchAgentStatistics,
    fetchNotificationPreferences,
    fetchPersonalTemplates,
    fetchUIPreferences,
    fetchAllData,

    // Action functions
    updateProfile,
    updateAvailability,
    uploadAvatar,
    changePassword,
    updateNotificationPreferences,
    createPersonalTemplate,
    updatePersonalTemplate,
    deletePersonalTemplate,
    updateUIPreferences,
    exportUserData,

    // Metadata
    lastUpdated,
    autoRefresh,
    refreshInterval
  };
};

export default useAgentProfile;
