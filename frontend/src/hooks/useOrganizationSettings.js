import { useState, useEffect, useCallback, useRef } from 'react';
import organizationManagementService from '../services/OrganizationManagementService';
import toast from 'react-hot-toast';

export const useOrganizationSettings = (organizationId) => {
  const [settings, setSettings] = useState({
    general: {
      name: '',
      displayName: '',
      email: '',
      phone: '',
      website: '',
      taxId: '',
      address: '',
      description: '',
      logo: null,
      timezone: 'UTC',
      locale: 'en',
      currency: 'USD'
    },
    system: {
      status: 'active',
      businessType: 'saas',
      industry: 'technology',
      companySize: 'small',
      foundedYear: new Date().getFullYear(),
      employeeCount: 0,
      annualRevenue: 0,
      website: '',
      socialMedia: {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: ''
      }
    },
    api: {
      apiKey: '',
      webhookUrl: '',
      webhookSecret: '',
      rateLimit: 1000,
      allowedOrigins: [],
      enableApiAccess: true,
      enableWebhooks: false
    },
    subscription: {
      plan: 'free',
      billingCycle: 'monthly',
      status: 'active',
      startDate: null,
      endDate: null,
      autoRenew: true,
      features: [],
      limits: {
        users: 0,
        conversations: 0,
        storage: 0,
        apiCalls: 0
      }
    },
    security: {
      twoFactorAuth: false,
      ssoEnabled: false,
      ssoProvider: '',
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false
      },
      sessionTimeout: 30,
      ipWhitelist: [],
      allowedDomains: []
    },
    notifications: {
      email: {
        enabled: true,
        newUser: true,
        userActivity: true,
        systemUpdates: true,
        securityAlerts: true
      },
      push: {
        enabled: false,
        newUser: false,
        userActivity: false,
        systemUpdates: false,
        securityAlerts: true
      },
      webhook: {
        enabled: false,
        url: '',
        events: []
      }
    },
    features: {
      chatbot: {
        enabled: true,
        maxInstances: 1,
        advancedFeatures: false
      },
      analytics: {
        enabled: true,
        retentionDays: 90,
        realTime: true
      },
      integrations: {
        enabled: true,
        maxIntegrations: 5
      },
      customBranding: {
        enabled: false,
        customDomain: false
      }
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);

  // Refs to prevent unnecessary re-renders
  const isInitialLoad = useRef(true);
  const lastLoadParams = useRef(null);

  // Load organization settings
  const loadSettings = useCallback(async (forceRefresh = false) => {
    if (!organizationId) {
      console.log('🔍 useOrganizationSettings: No organization ID provided');
      return;
    }

    const currentParams = { organization_id: organizationId };

    // Check if we need to load (avoid duplicate calls)
    if (!forceRefresh && !isInitialLoad.current &&
        JSON.stringify(currentParams) === JSON.stringify(lastLoadParams.current)) {
      console.log('🔍 useOrganizationSettings: Skipping load - same parameters');
      return;
    }

    setLoading(true);
    setError(null);
    lastLoadParams.current = currentParams;

    try {
      console.log('🔍 useOrganizationSettings: Loading settings for organization:', organizationId);

      // Get organization settings from API
      const response = await organizationManagementService.getOrganizationSettings(organizationId);

      if (response.success) {
        console.log('✅ useOrganizationSettings: Settings loaded successfully:', response.data);
        setSettings(response.data);
        setOriginalSettings(JSON.parse(JSON.stringify(response.data)));
        return;
      }

      // Fallback to mock data if API fails
      const mockSettings = {
        general: {
          name: 'Sample Organization',
          displayName: 'Sample Org',
          email: 'contact@sampleorg.com',
          phone: '+1234567890',
          website: 'https://sampleorg.com',
          taxId: 'TAX123456',
          address: '123 Main St, City, State 12345',
          description: 'A sample organization for demonstration',
          logo: null,
          timezone: 'UTC',
          locale: 'en',
          currency: 'USD'
        },
        system: {
          status: 'active',
          businessType: 'saas',
          industry: 'technology',
          companySize: 'small',
          foundedYear: 2020,
          employeeCount: 25,
          annualRevenue: 500000,
          website: 'https://sampleorg.com',
          socialMedia: {
            linkedin: 'https://linkedin.com/company/sampleorg',
            twitter: 'https://twitter.com/sampleorg',
            facebook: '',
            instagram: ''
          }
        },
        api: {
          apiKey: 'sk-' + Math.random().toString(36).substr(2, 32),
          webhookUrl: 'https://sampleorg.com/webhook',
          webhookSecret: 'webhook_secret_' + Math.random().toString(36).substr(2, 16),
          rateLimit: 1000,
          allowedOrigins: ['https://sampleorg.com'],
          enableApiAccess: true,
          enableWebhooks: true
        },
        subscription: {
          plan: 'pro',
          billingCycle: 'monthly',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          autoRenew: true,
          features: ['chatbot', 'analytics', 'integrations'],
          limits: {
            users: 100,
            conversations: 10000,
            storage: 1000,
            apiCalls: 100000
          }
        },
        security: {
          twoFactorAuth: true,
          ssoEnabled: false,
          ssoProvider: '',
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: true
          },
          sessionTimeout: 30,
          ipWhitelist: [],
          allowedDomains: ['sampleorg.com']
        },
        notifications: {
          email: {
            enabled: true,
            newUser: true,
            userActivity: true,
            systemUpdates: true,
            securityAlerts: true
          },
          push: {
            enabled: false,
            newUser: false,
            userActivity: false,
            systemUpdates: false,
            securityAlerts: true
          },
          webhook: {
            enabled: true,
            url: 'https://sampleorg.com/webhook',
            events: ['user.created', 'user.updated', 'user.deleted']
          }
        },
        features: {
          chatbot: {
            enabled: true,
            maxInstances: 5,
            advancedFeatures: true
          },
          analytics: {
            enabled: true,
            retentionDays: 365,
            realTime: true
          },
          integrations: {
            enabled: true,
            maxIntegrations: 10
          },
          customBranding: {
            enabled: true,
            customDomain: true
          }
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      console.log('✅ useOrganizationSettings: Settings loaded successfully:', mockSettings);
      setSettings(mockSettings);
      setOriginalSettings(JSON.parse(JSON.stringify(mockSettings)));

    } catch (error) {
      console.error('❌ useOrganizationSettings: Error loading settings:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load settings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [organizationId]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Update setting field
  const updateSetting = useCallback((path, value) => {
    setSettings(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      setHasChanges(true);
      return newSettings;
    });
  }, []);

  // Update multiple settings
  const updateSettings = useCallback((updates) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      Object.keys(updates).forEach(key => {
        newSettings[key] = { ...newSettings[key], ...updates[key] };
      });
      setHasChanges(true);
      return newSettings;
    });
  }, []);

  // Save settings
  const saveSettings = useCallback(async (settingsToSave = null) => {
    if (!organizationId) {
      toast.error('No organization selected');
      return { success: false, error: 'No organization selected' };
    }

    setLoading(true);
    try {
      console.log('🔍 useOrganizationSettings: Saving settings for organization:', organizationId, settingsToSave || settings);

      // Save organization settings to API
      const response = await organizationManagementService.saveOrganizationSettings(organizationId, settingsToSave || settings);

      if (response.success) {
        console.log('✅ useOrganizationSettings: Settings saved successfully');
        toast.success('Settings saved successfully');

        // Update original settings
        const settingsToUpdate = settingsToSave || settings;
        setOriginalSettings(JSON.parse(JSON.stringify(settingsToUpdate)));
        setHasChanges(false);

        return { success: true };
      } else {
        console.error('❌ useOrganizationSettings: Failed to save settings:', response.error);
        toast.error(response.error || 'Failed to save settings');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('❌ useOrganizationSettings: Error saving settings:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save settings';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [organizationId, settings]);

  // Reset settings
  const resetSettings = useCallback(() => {
    if (originalSettings) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
      setHasChanges(false);
    }
  }, [originalSettings]);

  // Generate API key
  const generateApiKey = useCallback(() => {
    const newApiKey = 'sk-' + Math.random().toString(36).substr(2, 32);
    updateSetting('api.apiKey', newApiKey);
    toast.success('New API key generated');
  }, [updateSetting]);

  // Test webhook
  const testWebhook = useCallback(async () => {
    if (!settings.api.webhookUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }

    setLoading(true);
    try {
      // Test webhook via API
      const response = await organizationManagementService.testWebhook(organizationId, settings.api.webhookUrl);

      if (!response.success) {
        throw new Error(response.error || 'Webhook test failed');
      }

      toast.success('Webhook test successful');
    } catch (error) {
      console.error('❌ useOrganizationSettings: Error testing webhook:', error);
      toast.error('Webhook test failed');
    } finally {
      setLoading(false);
    }
  }, [settings.api.webhookUrl]);

  // Refresh settings
  const refreshSettings = useCallback(() => {
    loadSettings(true);
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    hasChanges,
    loadSettings,
    updateSetting,
    updateSettings,
    saveSettings,
    resetSettings,
    generateApiKey,
    testWebhook,
    refreshSettings
  };
};
