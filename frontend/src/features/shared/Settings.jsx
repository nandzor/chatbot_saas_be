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
  CheckCircle,
  Mail,
  Bell,
  MessageSquare,
  Shield,
  Lock,
  Clock,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle,
  CheckCircle2
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

  // Enhanced notification settings form fields
  const notificationFields = [
    {
      name: 'emailNotifications',
      type: 'checkbox',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: 'Mail'
    },
    {
      name: 'pushNotifications',
      type: 'checkbox',
      label: 'Push Notifications',
      description: 'Receive push notifications in browser',
      icon: 'Bell'
    },
    {
      name: 'smsNotifications',
      type: 'checkbox',
      label: 'SMS Notifications',
      description: 'Receive notifications via SMS',
      icon: 'MessageSquare'
    },
    {
      name: 'notificationFrequency',
      type: 'select',
      label: 'Notification Frequency',
      required: true,
      description: 'How often you want to receive notifications',
      options: [
        { value: 'immediate', label: 'Immediate - Get notified right away' },
        { value: 'hourly', label: 'Hourly - Digest every hour' },
        { value: 'daily', label: 'Daily - Daily summary at 9 AM' },
        { value: 'weekly', label: 'Weekly - Weekly summary on Monday' }
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
        <TabsContent value="security" className="space-y-6">
          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            {/* Security Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold flex items-center">
                      <Shield className="h-6 w-6 mr-3 text-blue-600" />
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      Configure security and authentication settings to protect your account
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Security Level</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">Strong</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Security Features */}
            <div className="grid gap-6">
              {/* Two-Factor Authentication */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Smartphone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            settingsData.security.twoFactorAuth
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {settingsData.security.twoFactorAuth ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Enabled
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Disabled
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settingsData.security.twoFactorAuth}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            twoFactorAuth: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Timeout */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Session Timeout</h3>
                        <p className="text-sm text-muted-foreground">
                          How long before users are automatically logged out
                        </p>
                      </div>
                    </div>
                    <div className="ml-12">
                      <div className="flex items-center space-x-4">
                        <input
                          type="number"
                          value={settingsData.security.sessionTimeout}
                          onChange={(e) => setSettingsData(prev => ({
                            ...prev,
                            security: {
                              ...prev.security,
                              sessionTimeout: parseInt(e.target.value) || 30
                            }
                          }))}
                          min="5"
                          max="1440"
                          className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <span className="text-sm text-muted-foreground">minutes</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Recommended: 30-60 minutes for better security
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Password Policy */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Key className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Password Policy</h3>
                        <p className="text-sm text-muted-foreground">
                          Set requirements for user passwords
                        </p>
                      </div>
                    </div>
                    <div className="ml-12">
                      <select
                        value={settingsData.security.passwordPolicy}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          security: {
                            ...prev.security,
                            passwordPolicy: e.target.value
                          }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="basic">Basic (8+ characters)</option>
                        <option value="strong">Strong (8+ chars, mixed case, numbers)</option>
                        <option value="very-strong">Very Strong (12+ chars, special chars)</option>
                      </select>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {settingsData.security.passwordPolicy === 'basic' && 'Minimum 8 characters required'}
                        {settingsData.security.passwordPolicy === 'strong' && '8+ characters, uppercase, lowercase, and numbers required'}
                        {settingsData.security.passwordPolicy === 'very-strong' && '12+ characters with special characters, uppercase, lowercase, and numbers required'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* IP Whitelist */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Lock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">IP Whitelist</h3>
                        <p className="text-sm text-muted-foreground">
                          Restrict access to specific IP addresses (optional)
                        </p>
                      </div>
                    </div>
                    <div className="ml-12">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Current IP addresses: {settingsData.security.ipWhitelist.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Leave empty to allow access from any IP address
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Recommendations */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Security Recommendations</h4>
                    <ul className="mt-2 text-sm text-amber-700 space-y-1">
                      <li>• Enable Two-Factor Authentication for maximum security</li>
                      <li>• Use a strong password policy to protect user accounts</li>
                      <li>• Set appropriate session timeout to balance security and usability</li>
                      <li>• Consider IP whitelisting for admin accounts</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => handleSaveSettings(settingsData)}
                disabled={getLoadingState('save')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                {getLoadingState('save') ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </>
                )}
              </Button>
            </div>
          </LoadingWrapper>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <LoadingWrapper
            isLoading={getLoadingState('initial')}
            loadingComponent={<SkeletonCard />}
          >
            {/* Progress Indicator */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">Notification Settings</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Configure how you receive notifications
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground mb-1">Setup Progress</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">100% Complete</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Notification Types */}
            <div className="grid gap-6">
              {/* Email Notifications */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Email Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.emailNotifications}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            emailNotifications: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Push Notifications */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Bell className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Push Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in browser
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.pushNotifications}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            pushNotifications: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SMS Notifications */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">SMS Notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via SMS
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications.smsNotifications}
                        onChange={(e) => setSettingsData(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            smsNotifications: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Frequency */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-lg font-semibold flex items-center">
                        Notification Frequency
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        How often you want to receive notifications
                      </p>
                    </div>
                    <select
                      value={settingsData.notifications.notificationFrequency}
                      onChange={(e) => setSettingsData(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          notificationFrequency: e.target.value
                        }
                      }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="immediate">Immediate - Get notified right away</option>
                      <option value="hourly">Hourly - Digest every hour</option>
                      <option value="daily">Daily - Daily summary at 9 AM</option>
                      <option value="weekly">Weekly - Weekly summary on Monday</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => handleSaveSettings(settingsData)}
                disabled={getLoadingState('save')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                {getLoadingState('save') ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </div>
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
