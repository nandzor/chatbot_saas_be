import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/AuthService';

const useClientSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { isAuthenticated } = useAuth();

  // Get token from localStorage
  const getToken = () => {
    const jwtToken = localStorage.getItem('jwt_token');
    const sanctumToken = localStorage.getItem('sanctum_token');
    const accessToken = localStorage.getItem('access_token');

    console.log('🔑 Token check:', {
      jwtToken: jwtToken ? jwtToken.substring(0, 20) + '...' : 'none',
      sanctumToken: sanctumToken ? sanctumToken.substring(0, 20) + '...' : 'none',
      accessToken: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
      allKeys: Object.keys(localStorage).filter(key => key.includes('token'))
    });

    return jwtToken || sanctumToken || accessToken;
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api';

  // Load settings from API
  const loadSettings = useCallback(async () => {
    const token = getToken();
    console.log('🔧 ClientSettings: loadSettings called', {
      hasToken: !!token,
      isAuthenticated,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none'
    });

    if (!token || !isAuthenticated) {
      console.log('❌ ClientSettings: No token or not authenticated, skipping load');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🌐 Making API call using AuthService');

      // Use AuthService API instance which handles authentication automatically
      const response = await authService.api.get('/settings/client-management');

      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      const data = response.data;

      if (data.success) {
        console.log('✅ ClientSettings: Settings loaded successfully', data.data);
        setSettings(data.data);
        setHasChanges(false);
      } else {
        throw new Error(data.message || 'Failed to load settings');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError(err.message);
      // Set default settings if API fails
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, API_BASE_URL]);

  // Save settings to API
  const saveSettings = useCallback(async (updatedSettings) => {
    const token = getToken();
    if (!token || !isAuthenticated) return;

    setSaving(true);
    setError(null);

    try {
      const response = await authService.api.put('/settings/client-management', updatedSettings);
      const data = response.data;

      if (data.success) {
        setSettings(data.data);
        setHasChanges(false);
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [isAuthenticated, API_BASE_URL]);

  // Reset settings to defaults
  const resetToDefaults = useCallback(async () => {
    const token = getToken();
    if (!token || !isAuthenticated) return;

    setSaving(true);
    setError(null);

    try {
      const response = await authService.api.post('/settings/client-management/reset');
      const data = response.data;

      if (data.success) {
        setSettings(data.data);
        setHasChanges(false);
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to reset settings');
      }
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [isAuthenticated, API_BASE_URL]);

  // Export settings
  const exportSettings = useCallback(async () => {
    const token = getToken();
    if (!token || !isAuthenticated) return;

    try {
      const response = await authService.api.get('/settings/client-management/export');
      const data = response.data;

      if (data.success) {
        // Download the settings file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `client-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to export settings');
      }
    } catch (err) {
      console.error('Error exporting settings:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [isAuthenticated, API_BASE_URL]);

  // Import settings
  const importSettings = useCallback(async (file) => {
    const token = getToken();
    if (!token || !isAuthenticated) return;

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('settings_file', file);

      const response = await authService.api.post('/settings/client-management/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = response.data;

      if (data.success) {
        setSettings(data.data);
        setHasChanges(false);
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message || 'Failed to import settings');
      }
    } catch (err) {
      console.error('Error importing settings:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [isAuthenticated, API_BASE_URL]);

  // Update a specific setting
  const updateSetting = useCallback((section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  }, []);

  // Update multiple settings at once
  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      Object.keys(updates).forEach(section => {
        newSettings[section] = {
          ...newSettings[section],
          ...updates[section]
        };
      });
      return newSettings;
    });
    setHasChanges(true);
  }, []);

  // Get default settings (fallback)
  const getDefaultSettings = () => ({
    general: {
      defaultOrganizationStatus: 'active',
      autoApproveOrganizations: false,
      requireEmailVerification: true,
      allowSelfRegistration: true,
      maxOrganizationsPerUser: 5,
      defaultTrialDays: 14,
      organizationNamePattern: '^[a-zA-Z0-9\\s\\-_&.()]+$',
      organizationDescriptionMaxLength: 500
    },
    userManagement: {
      allowUserInvitations: true,
      requireAdminApproval: false,
      defaultUserRole: 'member',
      allowRoleChanges: true,
      maxUsersPerOrganization: 100,
      userSessionTimeout: 24,
      requireStrongPasswords: true,
      passwordMinLength: 8,
      enableTwoFactorAuth: false,
      allowPasswordReset: true
    },
    security: {
      enableApiRateLimiting: true,
      apiRateLimitPerMinute: 100,
      enableIpWhitelisting: false,
      allowedIpAddresses: '',
      enableAuditLogging: true,
      logRetentionDays: 90,
      enableDataEncryption: true,
      requireHttps: true,
      enableCors: true,
      corsOrigins: '*'
    },
    notifications: {
      enableEmailNotifications: true,
      notifyOnNewOrganization: true,
      notifyOnUserRegistration: true,
      notifyOnSuspiciousActivity: true,
      notifyOnSystemMaintenance: true,
      emailFromAddress: 'noreply@chatbot-saas.com',
      emailFromName: 'ChatBot SaaS',
      enableSmsNotifications: false,
      smsProvider: 'twilio'
    },
    dataManagement: {
      enableDataBackup: true,
      backupFrequency: 'daily',
      backupRetentionDays: 30,
      enableDataExport: true,
      allowBulkOperations: true,
      enableSoftDelete: true,
      dataRetentionPolicy: 'standard',
      enableGdprCompliance: true,
      allowDataAnonymization: true
    },
    integrations: {
      enableWebhooks: true,
      webhookTimeout: 30,
      enableApiKeys: true,
      apiKeyExpirationDays: 365,
      enableSso: false,
      ssoProvider: 'oauth2',
      enableThirdPartyIntegrations: true,
      allowedIntegrations: ['slack', 'microsoft-teams', 'discord']
    }
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    hasChanges,
    loadSettings,
    saveSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    updateSetting,
    updateSettings,
    clearError: () => setError(null)
  };
};

export default useClientSettings;
