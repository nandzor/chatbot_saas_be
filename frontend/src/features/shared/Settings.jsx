/**
 * Enhanced Settings Component
 * Settings dengan Form components dan enhanced error handling
 */

import React, { useState, useCallback, useEffect, useContext } from 'react';
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
  CheckCircle2,
  Building2,
  Globe,
  Users,
  CreditCard,
  Zap
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
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import organizationManagementService from '@/services/OrganizationManagementService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();
  const { user } = useAuth();
  const organization = user?.organization || user?.currentOrganization || null;

  // Get organization ID from context or URL params
  const organizationId = organization?.id || user?.organization_id;

  // Use organization settings hook
  const {
    settings,
    loading: settingsLoading,
    error: settingsError,
    hasChanges,
    loadSettings,
    updateSetting,
    saveSettings,
    resetSettings,
    generateApiKey,
    testWebhook,
    refreshSettings
  } = useOrganizationSettings(organizationId);

  // State management
  const [activeTab, setActiveTab] = useState('general');
  const [showApiKey, setShowApiKey] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [integrationsState, setIntegrationsState] = useState(integrationsData);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [changeHistory, setChangeHistory] = useState([]);
  const [webhookTestResult, setWebhookTestResult] = useState(null);

  // Sample data untuk channels
  const channels = [
    { id: 1, name: 'Website Chat', type: 'Web Widget', status: 'Aktif', lastUsed: '2 menit lalu' },
    { id: 2, name: 'WhatsApp Business', type: 'WhatsApp', status: 'Aktif', lastUsed: '5 menit lalu' },
    { id: 3, name: 'Facebook Messenger', type: 'Facebook', status: 'Nonaktif', lastUsed: '2 jam lalu' },
  ];

  // Enhanced save settings with proper API integration
  const handleSaveSettings = useCallback(async (values, options = {}) => {
    if (!organizationId) {
      toast.error('No organization selected');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      // Validate required fields
      if (!values?.general?.name) {
        throw new Error('Organization name is required');
      }
      if (!values?.general?.email) {
        throw new Error('Contact email is required');
      }

      // Sanitize and validate input data
      const toNumber = (val, fallback) => {
        const n = Number(val ?? fallback);
        return Number.isFinite(n) ? n : Number(fallback ?? 0);
      };

      const sanitizedData = {
        general: {
          name: sanitizeInput(values.general?.name ?? settings.general?.name),
          displayName: sanitizeInput(values.general?.displayName ?? settings.general?.displayName),
          email: sanitizeInput(values.general?.email ?? settings.general?.email),
          phone: sanitizeInput(values.general?.phone ?? settings.general?.phone),
          website: sanitizeInput(values.general?.website ?? settings.general?.website),
          taxId: sanitizeInput(values.general?.taxId ?? settings.general?.taxId),
          address: sanitizeInput(values.general?.address ?? settings.general?.address),
          description: sanitizeInput(values.general?.description ?? settings.general?.description),
          timezone: values.general?.timezone ?? settings.general?.timezone,
          locale: values.general?.locale ?? settings.general?.locale,
          currency: values.general?.currency ?? settings.general?.currency
        },
        system: {
          status: values.system?.status ?? settings.system?.status,
          businessType: values.system?.businessType ?? settings.system?.businessType,
          industry: values.system?.industry ?? settings.system?.industry,
          companySize: values.system?.companySize ?? settings.system?.companySize,
          foundedYear: toNumber(values.system?.foundedYear, settings.system?.foundedYear),
          employeeCount: toNumber(values.system?.employeeCount, settings.system?.employeeCount),
          annualRevenue: toNumber(values.system?.annualRevenue, settings.system?.annualRevenue),
          socialMedia: values.system?.socialMedia ?? settings.system?.socialMedia ?? {}
        },
        api: {
          apiKey: values.api?.apiKey ?? settings.api?.apiKey,
          webhookUrl: sanitizeInput(values.api?.webhookUrl ?? settings.api?.webhookUrl),
          webhookSecret: sanitizeInput(values.api?.webhookSecret ?? settings.api?.webhookSecret),
          rateLimit: toNumber(values.api?.rateLimit, settings.api?.rateLimit),
          allowedOrigins: (values.api?.allowedOrigins ?? settings.api?.allowedOrigins ?? []).map(o => typeof o === 'string' ? o.trim() : o),
          enableApiAccess: values.api?.enableApiAccess ?? settings.api?.enableApiAccess,
          enableWebhooks: values.api?.enableWebhooks ?? settings.api?.enableWebhooks
        },
        security: {
          twoFactorAuth: values.security?.twoFactorAuth ?? settings.security?.twoFactorAuth,
          ssoEnabled: values.security?.ssoEnabled ?? settings.security?.ssoEnabled,
          ssoProvider: values.security?.ssoProvider ?? settings.security?.ssoProvider,
          passwordPolicy: values.security?.passwordPolicy ?? settings.security?.passwordPolicy,
          sessionTimeout: toNumber(values.security?.sessionTimeout, settings.security?.sessionTimeout),
          ipWhitelist: values.security?.ipWhitelist ?? settings.security?.ipWhitelist ?? [],
          allowedDomains: values.security?.allowedDomains ?? settings.security?.allowedDomains ?? []
        },
        notifications: {
          email: values.notifications?.email ?? settings.notifications?.email ?? {},
          push: values.notifications?.push ?? settings.notifications?.push ?? {},
          webhook: values.notifications?.webhook ?? settings.notifications?.webhook ?? {}
        },
        features: {
          chatbot: values.features?.chatbot ?? settings.features?.chatbot ?? {},
          analytics: values.features?.analytics ?? settings.features?.analytics ?? {},
          integrations: values.features?.integrations ?? settings.features?.integrations ?? {},
          customBranding: values.features?.customBranding ?? settings.features?.customBranding ?? {}
        }
      };

      // Save settings using the hook
      const result = await saveSettings(sanitizedData);

      if (result.success) {
        setSuccess('Settings saved successfully!');
        announce('Settings saved successfully');
        toast.success('Settings saved successfully');
        setLastSaved(new Date());

        // Track change history
        const changeEntry = {
          id: Date.now(),
          timestamp: new Date(),
          type: 'settings_save',
          changes: Object.keys(sanitizedData),
          user: user?.name || 'Unknown User'
        };
        setChangeHistory(prev => [changeEntry, ...prev.slice(0, 9)]); // Keep last 10 changes

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Settings Save',
        showToast: true
      });
      setError(errorResult.message);
      toast.error(errorResult.message);
    } finally {
      setIsSaving(false);
    }
  }, [organizationId, settings, saveSettings, announce]);

  // Enhanced webhook testing
  const handleTestWebhook = useCallback(async () => {
    if (!organizationId) {
      toast.error('No organization selected');
      return;
    }

    if (!settings?.api?.webhookUrl) {
      toast.error('Please enter a webhook URL first');
      return;
    }

    // Validate webhook URL format
    try {
      new URL(settings.api.webhookUrl);
    } catch {
      toast.error('Please enter a valid webhook URL');
      return;
    }

    try {
      setIsSaving(true);
      setWebhookTestResult(null);
      setError(null);

      const result = await testWebhook();

      if (result.success) {
        setWebhookTestResult({
          success: true,
          message: 'Webhook test successful',
          timestamp: new Date()
        });
        toast.success('Webhook test successful');
      } else {
        setWebhookTestResult({
          success: false,
          message: result.error || 'Webhook test failed',
          timestamp: new Date()
        });
        toast.error('Webhook test failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Webhook test failed';
      setWebhookTestResult({
        success: false,
        message: errorMessage,
        timestamp: new Date()
      });
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [organizationId, settings?.api?.webhookUrl, testWebhook]);

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

  // Load data on mount - handled by useOrganizationSettings hook

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (hasChanges && !isSaving) {
          handleSaveSettings(settings);
        }
      }
      // Escape to reset changes
      if (event.key === 'Escape' && hasChanges) {
        resetSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, isSaving, settings, handleSaveSettings, resetSettings]);

  // General settings form fields - Updated to match backend API structure
  const generalFields = [
    {
      name: 'general.name',
      type: 'text',
      label: 'Organization Name',
      placeholder: 'Enter organization name',
      required: true,
      description: 'The name of your organization'
    },
    {
      name: 'general.displayName',
      type: 'text',
      label: 'Display Name',
      placeholder: 'Enter display name',
      required: false,
      description: 'Public display name for your organization'
    },
    {
      name: 'general.email',
      type: 'email',
      label: 'Contact Email',
      placeholder: 'Enter contact email',
      required: true,
      description: 'Primary contact email for your organization'
    },
    {
      name: 'general.phone',
      type: 'tel',
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      required: false,
      description: 'Contact phone number'
    },
    {
      name: 'general.website',
      type: 'url',
      label: 'Website',
      placeholder: 'https://your-website.com',
      required: false,
      description: 'Organization website URL'
    },
    {
      name: 'general.taxId',
      type: 'text',
      label: 'Tax ID',
      placeholder: 'Enter tax ID',
      required: false,
      description: 'Business tax identification number'
    },
    {
      name: 'general.address',
      type: 'textarea',
      label: 'Address',
      placeholder: 'Enter organization address',
      required: false,
      description: 'Physical address of your organization'
    },
    {
      name: 'general.description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter organization description',
      required: false,
      description: 'Brief description of your organization'
    },
    {
      name: 'general.timezone',
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
        { value: 'Asia/Tokyo', label: 'Tokyo' },
        { value: 'Asia/Jakarta', label: 'Jakarta' },
        { value: 'Asia/Singapore', label: 'Singapore' }
      ]
    },
    {
      name: 'general.locale',
      type: 'select',
      label: 'Locale',
      required: true,
      options: [
        { value: 'en', label: 'English (US)' },
        { value: 'id', label: 'Bahasa Indonesia' }
      ]
    },
    {
      name: 'general.currency',
      type: 'select',
      label: 'Currency',
      required: true,
      options: [
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'IDR', label: 'Indonesian Rupiah (IDR)' }
      ]
    }
  ];

  // Security settings form fields - Updated to match backend API structure
  const securityFields = [
    {
      name: 'security.twoFactorAuth',
      type: 'checkbox',
      label: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account'
    },
    {
      name: 'security.ssoEnabled',
      type: 'checkbox',
      label: 'Enable Single Sign-On (SSO)',
      description: 'Allow users to sign in with external identity providers'
    },
    {
      name: 'security.ssoProvider',
      type: 'select',
      label: 'SSO Provider',
      required: false,
      options: [
        { value: '', label: 'None' },
        { value: 'google', label: 'Google' },
        { value: 'microsoft', label: 'Microsoft' },
        { value: 'okta', label: 'Okta' },
        { value: 'auth0', label: 'Auth0' },
        { value: 'saml', label: 'SAML' }
      ]
    },
    {
      name: 'security.sessionTimeout',
      type: 'number',
      label: 'Session Timeout (minutes)',
      placeholder: 'Enter timeout in minutes',
      required: true,
      description: 'How long before users are automatically logged out (5-480 minutes)'
    },
    {
      name: 'security.passwordPolicy.minLength',
      type: 'number',
      label: 'Minimum Password Length',
      placeholder: 'Enter minimum length',
      required: true,
      description: 'Minimum number of characters required in passwords'
    },
    {
      name: 'security.passwordPolicy.requireUppercase',
      type: 'checkbox',
      label: 'Require Uppercase Letters',
      description: 'Passwords must contain uppercase letters'
    },
    {
      name: 'security.passwordPolicy.requireLowercase',
      type: 'checkbox',
      label: 'Require Lowercase Letters',
      description: 'Passwords must contain lowercase letters'
    },
    {
      name: 'security.passwordPolicy.requireNumbers',
      type: 'checkbox',
      label: 'Require Numbers',
      description: 'Passwords must contain numbers'
    },
    {
      name: 'security.passwordPolicy.requireSymbols',
      type: 'checkbox',
      label: 'Require Special Characters',
      description: 'Passwords must contain special characters'
    }
  ];

  // System settings form fields
  const systemFields = [
    {
      name: 'system.businessType',
      type: 'select',
      label: 'Business Type',
      required: true,
      options: [
        { value: 'saas', label: 'SaaS' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'education', label: 'Education' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'finance', label: 'Finance' },
        { value: 'retail', label: 'Retail' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      name: 'system.industry',
      type: 'text',
      label: 'Industry',
      placeholder: 'Enter industry',
      required: false,
      description: 'Primary industry your organization operates in'
    },
    {
      name: 'system.companySize',
      type: 'select',
      label: 'Company Size',
      required: true,
      options: [
        { value: 'startup', label: 'Startup (1-10 employees)' },
        { value: 'small', label: 'Small (11-50 employees)' },
        { value: 'medium', label: 'Medium (51-200 employees)' },
        { value: 'large', label: 'Large (201-1000 employees)' },
        { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
      ]
    },
    {
      name: 'system.foundedYear',
      type: 'number',
      label: 'Founded Year',
      placeholder: 'Enter founded year',
      required: false,
      description: 'Year your organization was founded'
    },
    {
      name: 'system.employeeCount',
      type: 'number',
      label: 'Employee Count',
      placeholder: 'Enter employee count',
      required: false,
      description: 'Current number of employees'
    },
    {
      name: 'system.annualRevenue',
      type: 'number',
      label: 'Annual Revenue',
      placeholder: 'Enter annual revenue',
      required: false,
      description: 'Annual revenue in your organization currency'
    }
  ];

  // API settings form fields
  const apiFields = [
    {
      name: 'api.enableApiAccess',
      type: 'checkbox',
      label: 'Enable API Access',
      description: 'Allow API access for your organization'
    },
    {
      name: 'api.rateLimit',
      type: 'number',
      label: 'Rate Limit (requests per minute)',
      placeholder: 'Enter rate limit',
      required: true,
      description: 'Maximum API requests per minute (1-100,000)'
    },
    {
      name: 'api.enableWebhooks',
      type: 'checkbox',
      label: 'Enable Webhooks',
      description: 'Allow webhook notifications'
    },
    {
      name: 'api.webhookUrl',
      type: 'url',
      label: 'Webhook URL',
      placeholder: 'https://your-domain.com/webhook',
      required: false,
      description: 'URL to receive webhook notifications'
    },
    {
      name: 'api.webhookSecret',
      type: 'password',
      label: 'Webhook Secret',
      placeholder: 'Enter webhook secret',
      required: false,
      description: 'Secret key for webhook verification'
    }
  ];

  // Enhanced notification settings form fields
  const notificationFields = [
    {
      name: 'notifications.email.enabled',
      type: 'checkbox',
      label: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: 'Mail'
    },
    {
      name: 'notifications.email.newUser',
      type: 'checkbox',
      label: 'New User Notifications',
      description: 'Get notified when new users join'
    },
    {
      name: 'notifications.email.userActivity',
      type: 'checkbox',
      label: 'User Activity Notifications',
      description: 'Get notified about important user activities'
    },
    {
      name: 'notifications.email.systemUpdates',
      type: 'checkbox',
      label: 'System Updates',
      description: 'Get notified about system updates and maintenance'
    },
    {
      name: 'notifications.email.securityAlerts',
      type: 'checkbox',
      label: 'Security Alerts',
      description: 'Get notified about security-related events'
    },
    {
      name: 'notifications.push.enabled',
      type: 'checkbox',
      label: 'Push Notifications',
      description: 'Receive push notifications in browser',
      icon: 'Bell'
    },
    {
      name: 'notifications.webhook.enabled',
      type: 'checkbox',
      label: 'Webhook Notifications',
      description: 'Send notifications via webhooks',
      icon: 'Zap'
    }
  ];

  // Show loading state if no organization ID
  if (!organizationId) {
    return (
      <div className="space-y-6" ref={focusRef}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Organization Selected</h3>
            <p className="text-muted-foreground">
              Please select an organization to manage settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3 text-blue-600" />
            Organization Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your organization settings and preferences
          </p>
          {organization && (
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              {organization.name}
            </div>
          )}
          <div className="flex items-center mt-2 text-xs text-muted-foreground space-x-4">
            {lastSaved && (
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {hasChanges && (
              <div className="flex items-center text-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unsaved changes
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <span className="text-xs">
                Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+S</kbd> to save, <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to reset
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasChanges && (
          <Button
            variant="outline"
              onClick={resetSettings}
              disabled={isSaving}
              aria-label="Reset changes"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Changes
            </Button>
          )}
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await refreshSettings();
                toast.success('Settings refreshed successfully');
              } catch (err) {
                toast.error('Failed to refresh settings');
              }
            }}
            disabled={settingsLoading}
            aria-label="Refresh settings"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {(error || settingsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || settingsError}</AlertDescription>
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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general" className="flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            API
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <LoadingWrapper
            isLoading={settingsLoading}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="General Settings"
              description="Configure basic organization information and preferences"
              fields={generalFields}
              initialValues={settings}
              validationRules={{
                'general.name': { required: true, minLength: 2, maxLength: 255 },
                'general.email': { required: true, email: true, maxLength: 255 },
                'general.phone': { maxLength: 20 },
                'general.website': { url: true, maxLength: 255 },
                'general.taxId': { maxLength: 50 },
                'general.address': { maxLength: 500 },
                'general.description': { maxLength: 1000 },
                'general.timezone': { required: true, maxLength: 50 },
                'general.locale': { required: true, maxLength: 10 },
                'general.currency': { required: true, maxLength: 3 }
              }}
              onSubmit={handleSaveSettings}
              submitText="Save General Settings"
              showProgress={true}
              autoSave={false}
              loading={isSaving}
            />
          </LoadingWrapper>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <LoadingWrapper
            isLoading={settingsLoading}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="System Settings"
              description="Configure organization system information and business details"
              fields={systemFields}
              initialValues={settings}
              validationRules={{
                'system.businessType': { required: true, maxLength: 50 },
                'system.industry': { maxLength: 100 },
                'system.companySize': { required: true, maxLength: 50 },
                'system.foundedYear': { integer: true, min: 1800, max: new Date().getFullYear() },
                'system.employeeCount': { integer: true, min: 0, max: 1000000 },
                'system.annualRevenue': { numeric: true, min: 0 }
              }}
              onSubmit={handleSaveSettings}
              submitText="Save System Settings"
              showProgress={true}
              autoSave={false}
              loading={isSaving}
            />
          </LoadingWrapper>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <LoadingWrapper
            isLoading={settingsLoading}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="Security Settings"
              description="Configure security and authentication settings to protect your organization"
              fields={securityFields}
              initialValues={settings}
              validationRules={{
                'security.sessionTimeout': { required: true, integer: true, min: 5, max: 480 },
                'security.passwordPolicy.minLength': { required: true, integer: true, min: 6, max: 32 },
                'security.ssoProvider': { maxLength: 50 }
              }}
              onSubmit={handleSaveSettings}
              submitText="Save Security Settings"
              showProgress={true}
              autoSave={false}
              loading={isSaving}
            />
          </LoadingWrapper>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api">
          <LoadingWrapper
            isLoading={settingsLoading}
            loadingComponent={<SkeletonCard />}
          >
            <div className="space-y-6">
              {/* API Key Section */}
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    API Key Management
                    </CardTitle>
                  <CardDescription>
                    Manage your organization's API access and authentication
                    </CardDescription>
              </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                      <label className="text-sm font-medium">API Key</label>
                      <div className="flex items-center space-x-2 mt-1">
                      <input
                          type={showApiKey ? 'text' : 'password'}
                          value={settings?.api?.apiKey || ''}
                          readOnly
                          className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await generateApiKey();
                              toast.success('API key generated successfully');
                            } catch (err) {
                              toast.error('Failed to generate API key');
                            }
                          }}
                          disabled={isSaving}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
                          Generate New
                        </Button>
                    </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keep your API key secure and never share it publicly
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Configuration Form */}
              <Form
                title="API Configuration"
                description="Configure API access settings and webhook endpoints"
                fields={apiFields}
                initialValues={settings}
                validationRules={{
                  'api.rateLimit': { required: true, integer: true, min: 1, max: 100000 },
                  'api.webhookUrl': { url: true, maxLength: 255 },
                  'api.webhookSecret': { maxLength: 255 }
                }}
                onSubmit={handleSaveSettings}
                submitText="Save API Settings"
                showProgress={true}
                autoSave={false}
                loading={isSaving}
              />

              {/* Webhook Test Section */}
              {settings?.api?.webhookUrl && (
              <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Webhook Testing
                    </CardTitle>
                    <CardDescription>
                      Test your webhook endpoint to ensure it's working correctly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={handleTestWebhook}
                      disabled={isSaving || !settings?.api?.webhookUrl}
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {isSaving ? 'Testing...' : 'Test Webhook'}
                    </Button>

                    {webhookTestResult && (
                      <div className={`p-3 rounded-lg border ${
                        webhookTestResult.success
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-red-50 border-red-200 text-red-800'
                      }`}>
                        <div className="flex items-center">
                          {webhookTestResult.success ? (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{webhookTestResult.message}</p>
                            <p className="text-xs opacity-75">
                              Tested at {webhookTestResult.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                        </div>
                    )}
                </CardContent>
              </Card>
              )}
            </div>
          </LoadingWrapper>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <LoadingWrapper
            isLoading={settingsLoading}
            loadingComponent={<SkeletonCard />}
          >
            <Form
              title="Notification Settings"
              description="Configure how you receive notifications and alerts"
              fields={notificationFields}
              initialValues={settings}
              validationRules={{
                'notifications.email.enabled': { boolean: true },
                'notifications.push.enabled': { boolean: true },
                'notifications.webhook.enabled': { boolean: true }
              }}
              onSubmit={handleSaveSettings}
              submitText="Save Notification Settings"
              showProgress={true}
              autoSave={false}
              loading={isSaving}
            />
          </LoadingWrapper>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels">
          <ChannelsTab
            channels={channels}
            loading={settingsLoading}
          />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations">
          <IntegrationsTab
            integrations={integrationsState}
            onConfigure={handleConfigureIntegration}
            onToggle={handleToggleIntegration}
            loading={settingsLoading}
          />
        </TabsContent>


        {/* Billing Tab */}
        <TabsContent value="billing">
          <BillingTab loading={settingsLoading} />
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
