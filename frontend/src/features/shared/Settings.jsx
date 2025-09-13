/**
 * Enhanced Settings Component
 * Settings dengan Form components dan enhanced error handling
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  useLoadingStates,
  LoadingWrapper,
  SkeletonCard
} from '@/utils/loadingStates';
import {
  handleError,
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  sanitizeInput,
  validateInput
} from '@/utils/securityUtils';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  Form
} from '@/components/ui';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { agentsData, integrationsData } from '@/data/sampleData';
import IntegrationCard from './IntegrationCard';
import IntegrationModal from './IntegrationModal';
import ChannelsTab from './ChannelsTab';
import IntegrationsTab from './IntegrationsTab';
import BillingTab from './BillingTab';
import DeveloperTab from './DeveloperTab';
import BotPersonalitiesTab from './BotPersonalitiesTab';
import TeamTab from './TeamTab';
import SecurityTab from './SecurityTab';

const Settings = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [activeTab, setActiveTab] = useState('channels');
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [integrationsState, setIntegrationsState] = useState(integrationsData);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Settings form data
  const [settingsData, setSettingsData] = useState({
    general: {
      siteName: 'My Chatbot',
      siteDescription: 'AI-powered customer support',
      timezone: 'UTC',
      language: 'en',
      theme: 'light'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      ipWhitelist: []
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notificationFrequency: 'immediate'
    }
  });

  // Sample data untuk channels
  const channels = [
    { id: 1, name: 'Website Chat', type: 'Web Widget', status: 'Aktif', lastUsed: '2 menit lalu' },
    { id: 2, name: 'WhatsApp Business', type: 'WhatsApp', status: 'Aktif', lastUsed: '5 menit lalu' },
    { id: 3, name: 'Facebook Messenger', type: 'Facebook', status: 'Nonaktif', lastUsed: '2 jam lalu' },
  ];

  // Load settings data
  const loadSettings = useCallback(async () => {
    try {
      setLoading('initial', true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, this would load from API
      announce('Settings loaded successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Settings Data Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [setLoading, announce]);

  // Save settings
  const handleSaveSettings = useCallback(async (values, options = {}) => {
    try {
      setLoading('save', true);
      setError(null);
      setSuccess(null);

      // Sanitize input
      const sanitizedData = {
        general: {
          siteName: sanitizeInput(values.siteName),
          siteDescription: sanitizeInput(values.siteDescription),
          timezone: values.timezone,
          language: values.language,
          theme: values.theme
        },
        security: {
          twoFactorAuth: values.twoFactorAuth,
          sessionTimeout: parseInt(values.sessionTimeout),
          passwordPolicy: values.passwordPolicy,
          ipWhitelist: values.ipWhitelist || []
        },
        notifications: {
          emailNotifications: values.emailNotifications,
          pushNotifications: values.pushNotifications,
          smsNotifications: values.smsNotifications,
          notificationFrequency: values.notificationFrequency
        }
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSettingsData(sanitizedData);
      setSuccess('Settings saved successfully!');
      announce('Settings saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Settings Save',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('save', false);
    }
  }, [setLoading, announce]);

  // Handle tab change
  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
    announce(`Switched to ${value} settings`);
  }, [announce]);

  // Integration handlers
  const handleConfigureIntegration = useCallback((integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
    announce(`Configuring ${integration.name} integration`);
  }, [announce]);

  const handleSaveIntegrationConfig = useCallback((config) => {
    if (selectedIntegration) {
      setIntegrationsState(prev =>
        prev.map(integration =>
          integration.id === selectedIntegration.id
            ? { ...integration, config }
            : integration
        )
      );
      announce(`${selectedIntegration.name} integration configured successfully`);
    }
    setIsModalOpen(false);
    setSelectedIntegration(null);
  }, [selectedIntegration, announce]);

  const handleToggleIntegration = useCallback((integrationId) => {
    setIntegrationsState(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
    const integration = integrationsState.find(i => i.id === integrationId);
    announce(`${integration?.name} integration ${integration?.enabled ? 'disabled' : 'enabled'}`);
  }, [integrationsState, announce]);

  // Load data on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  // General settings form fields
  const generalFields = [
    {
      name: 'siteName',
      type: 'text',
      label: 'Site Name',
      placeholder: 'Enter site name',
      required: true,
      description: 'The name of your chatbot application'
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: 'Site Description',
      placeholder: 'Enter site description',
      required: true,
      description: 'Brief description of your chatbot'
    },
    {
      name: 'timezone',
      type: 'select',
      label: 'Timezone',
      required: true,
      options: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Asia/Tokyo', label: 'Tokyo' }
      ]
    },
    {
      name: 'language',
      type: 'select',
      label: 'Language',
      required: true,
      options: [
        { value: 'en', label: 'English' },
        { value: 'id', label: 'Indonesian' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' }
      ]
    },
    {
      name: 'theme',
      type: 'select',
      label: 'Theme',
      required: true,
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'auto', label: 'Auto' }
      ]
    }
  ];

  // Security settings form fields
  const securityFields = [
    {
      name: 'twoFactorAuth',
      type: 'checkbox',
      label: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account'
    },
    {
      name: 'sessionTimeout',
      type: 'number',
      label: 'Session Timeout (minutes)',
      placeholder: 'Enter timeout in minutes',
      required: true,
      description: 'How long before users are automatically logged out'
    },
    {
      name: 'passwordPolicy',
      type: 'select',
      label: 'Password Policy',
      required: true,
      options: [
        { value: 'basic', label: 'Basic (8+ characters)' },
        { value: 'strong', label: 'Strong (8+ chars, mixed case, numbers)' },
        { value: 'very-strong', label: 'Very Strong (12+ chars, special chars)' }
      ]
    }
  ];

  // Notification settings form fields
  const notificationFields = [
    {
      name: 'emailNotifications',
      type: 'checkbox',
      label: 'Email Notifications',
      description: 'Receive notifications via email'
    },
    {
      name: 'pushNotifications',
      type: 'checkbox',
      label: 'Push Notifications',
      description: 'Receive push notifications in browser'
    },
    {
      name: 'smsNotifications',
      type: 'checkbox',
      label: 'SMS Notifications',
      description: 'Receive notifications via SMS'
    },
    {
      name: 'notificationFrequency',
      type: 'select',
      label: 'Notification Frequency',
      required: true,
      options: [
        { value: 'immediate', label: 'Immediate' },
        { value: 'hourly', label: 'Hourly' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' }
      ]
    }
  ];

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and preferences
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadSettings}
            disabled={getLoadingState('refresh')}
            aria-label="Refresh settings"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="General Settings"
              description="Configure basic application settings"
              fields={generalFields}
              initialValues={settingsData.general}
              validationRules={{
                siteName: { required: true, minLength: 2, maxLength: 50 },
                siteDescription: { required: true, minLength: 10, maxLength: 200 },
                timezone: { required: true },
                language: { required: true },
                theme: { required: true }
              }}
              onSubmit={handleSaveSettings}
              submitText="Save General Settings"
              showProgress={true}
              autoSave={false}
            />
          </LoadingWrapper>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="Security Settings"
              description="Configure security and authentication settings"
              fields={securityFields}
              initialValues={settingsData.security}
              validationRules={{
                sessionTimeout: { required: true, min: 5, max: 1440 },
                passwordPolicy: { required: true }
              }}
              onSubmit={handleSaveSettings}
              submitText="Save Security Settings"
              showProgress={true}
              autoSave={false}
            />
          </LoadingWrapper>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="Notification Settings"
              description="Configure how you receive notifications"
              fields={notificationFields}
              initialValues={settingsData.notifications}
              validationRules={{
                notificationFrequency: { required: true }
              }}
              onSubmit={handleSaveSettings}
              submitText="Save Notification Settings"
              showProgress={true}
              autoSave={false}
            />
          </LoadingWrapper>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels">
          <ChannelsTab
            channels={channels}
            loading={getLoadingState('initial')}
          />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <IntegrationsTab
            integrations={integrationsState}
            onConfigure={handleConfigureIntegration}
            onToggle={handleToggleIntegration}
            loading={getLoadingState('initial')}
          />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <BillingTab loading={getLoadingState('initial')} />
        </TabsContent>
      </Tabs>

      {/* Integration Modal */}
      <IntegrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        integration={selectedIntegration}
        onSave={handleSaveIntegrationConfig}
      />
    </div>
  );
};

export default withErrorHandling(Settings, {
  context: 'Settings Component'
});
