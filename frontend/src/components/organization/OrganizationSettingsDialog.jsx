import React, { useState, useCallback, useEffect } from 'react';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import {
  X,
  Settings,
  Save,
  RefreshCw,
  Building2,
  Users,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Database,
  Server,
  Key,
  Bell,
  Zap
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Label,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton
} from '@/components/ui';

const OrganizationSettingsDialog = ({
  isOpen,
  onClose,
  organization,
  onSaveSettings,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('general');

  // Use organization settings hook
  const {
    settings: formData,
    loading: settingsLoading,
    error: settingsError,
    hasChanges,
    updateSetting,
    updateSettings,
    saveSettings,
    resetSettings,
    generateApiKey,
    testWebhook,
    refreshSettings
  } = useOrganizationSettings(organization?.id);

  // Handle field change
  const handleFieldChange = useCallback((field, value) => {
    updateSetting(field, value);
  }, [updateSetting]);

  // Handle save settings
  const handleSaveSettings = useCallback(async () => {
    try {
      await saveSettings();
      if (onSaveSettings) {
        onSaveSettings(organization.id, formData);
      }
    } catch (error) {
    }
  }, [saveSettings, onSaveSettings, organization?.id, formData]);

  // Handle nested field changes (like features)
  const handleNestedFieldChange = useCallback((parentField, field, value) => {
    updateSetting(`${parentField}.${field}`, value);
  }, [updateSetting]);

  // Handle reset settings
  const handleResetSettings = useCallback(() => {
    resetSettings();
  }, [resetSettings]);

  // Handle refresh settings
  const handleRefreshSettings = useCallback(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('general');
      setHasChanges(false);
    }
  }, [isOpen]);

  if (!isOpen || !organization) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'api', label: 'API & Webhooks', icon: Key },
    { id: 'subscription', label: 'Subscription', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'features', label: 'Features', icon: Zap }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Organization Settings</h2>
              <p className="text-sm text-gray-500">{organization.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleResetSettings}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges || settingsLoading || loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {settingsLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                  <CardDescription>
                    Update basic organization information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Organization Name *</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        placeholder="Enter organization name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName || ''}
                        onChange={(e) => handleFieldChange('displayName', e.target.value)}
                        placeholder="Enter display name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website || ''}
                        onChange={(e) => handleFieldChange('website', e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={formData.taxId || ''}
                        onChange={(e) => handleFieldChange('taxId', e.target.value)}
                        placeholder="Enter tax ID"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      placeholder="Enter organization address"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>Business Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={formData.businessType || 'startup'}
                        onValueChange={(value) => handleFieldChange('businessType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="small_business">Small Business</SelectItem>
                          <SelectItem value="medium_business">Medium Business</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                          <SelectItem value="non_profit">Non-Profit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Select
                        value={formData.industry || 'technology'}
                        onValueChange={(value) => handleFieldChange('industry', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select
                        value={formData.companySize || 'small'}
                        onValueChange={(value) => handleFieldChange('companySize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">1-10 employees</SelectItem>
                          <SelectItem value="medium">11-50 employees</SelectItem>
                          <SelectItem value="large">51-200 employees</SelectItem>
                          <SelectItem value="enterprise">200+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>System Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Configure system settings for this organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={formData.timezone || 'Asia/Jakarta'}
                        onValueChange={(value) => handleFieldChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                          <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                          <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="locale">Locale</Label>
                      <Select
                        value={formData.locale || 'id'}
                        onValueChange={(value) => handleFieldChange('locale', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">Indonesian</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="ms">Malay</SelectItem>
                          <SelectItem value="th">Thai</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={formData.currency || 'IDR'}
                        onValueChange={(value) => handleFieldChange('currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IDR">IDR (Indonesian Rupiah)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                          <SelectItem value="THB">THB (Thai Baht)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* API & Webhooks Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>API Access</span>
                  </CardTitle>
                  <CardDescription>
                    Configure API access and webhook settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="apiEnabled">Enable API Access</Label>
                      <p className="text-sm text-gray-500">
                        Allow this organization to use API endpoints
                      </p>
                    </div>
                    <Switch
                      checked={formData.apiEnabled || false}
                      onCheckedChange={(checked) => handleFieldChange('apiEnabled', checked)}
                    />
                  </div>

                  {formData.apiEnabled && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="apiKey">API Key</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="apiKey"
                              value={formData.apiKey || ''}
                              onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                              placeholder="Generate API key"
                              type="password"
                            />
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="webhookUrl">Webhook URL</Label>
                          <Input
                            id="webhookUrl"
                            value={formData.webhookUrl || ''}
                            onChange={(e) => handleFieldChange('webhookUrl', e.target.value)}
                            placeholder="https://example.com/webhook"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Subscription Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subscriptionStatus">Status</Label>
                      <Select
                        value={formData.subscriptionStatus || 'trial'}
                        onValueChange={(value) => handleFieldChange('subscriptionStatus', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="trial">Trial</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subscriptionPlan">Plan</Label>
                      <Select
                        value={formData.subscriptionPlan?.id || ''}
                        onValueChange={(value) => handleFieldChange('subscriptionPlan', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic Plan</SelectItem>
                          <SelectItem value="pro">Pro Plan</SelectItem>
                          <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorEnabled">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">
                        Require 2FA for all users in this organization
                      </p>
                    </div>
                    <Switch
                      checked={formData.twoFactorEnabled || false}
                      onCheckedChange={(checked) => handleFieldChange('twoFactorEnabled', checked)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <Select
                      value={formData.passwordPolicy || 'standard'}
                      onValueChange={(value) => handleFieldChange('passwordPolicy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                        <SelectItem value="standard">Standard (8+ chars, mixed case)</SelectItem>
                        <SelectItem value="strong">Strong (12+ chars, mixed case, numbers, symbols)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={formData.sessionTimeout || 30}
                      onChange={(e) => handleFieldChange('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="480"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={formData.emailNotifications || true}
                      onCheckedChange={(checked) => handleFieldChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={formData.smsNotifications || false}
                      onCheckedChange={(checked) => handleFieldChange('smsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Send push notifications to mobile apps
                      </p>
                    </div>
                    <Switch
                      checked={formData.pushNotifications || true}
                      onCheckedChange={(checked) => handleFieldChange('pushNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Feature Flags</span>
                  </CardTitle>
                  <CardDescription>
                    Enable or disable features for this organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {Object.entries(formData.features || {}).map(([feature, enabled]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <div>
                          <Label htmlFor={feature} className="capitalize">
                            {feature.replace(/([A-Z])/g, ' $1').trim()}
                          </Label>
                          <p className="text-sm text-gray-500">
                            {feature === 'chatbot' && 'Enable chatbot functionality'}
                            {feature === 'analytics' && 'Enable analytics and reporting'}
                            {feature === 'api' && 'Enable API access'}
                            {feature === 'webhooks' && 'Enable webhook functionality'}
                            {feature === 'customBranding' && 'Allow custom branding'}
                            {feature === 'whiteLabel' && 'Enable white-label mode'}
                          </p>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => handleNestedFieldChange('features', feature, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsDialog;
