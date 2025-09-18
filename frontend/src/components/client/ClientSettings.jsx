import React, { useState, useEffect } from 'react';
import useClientSettings from '@/hooks/useClientSettings';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Switch, Select, SelectItem, Textarea, Badge, Separator, Alert, AlertDescription, AlertTitle, } from '@/components/ui';
import {
  AlertCircle,
  CheckCircle,
  Save,
  RefreshCw,
  Settings,
  Users,
  Shield,
  Bell,
  Database,
  Mail,
  Globe,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const ClientSettings = () => {
  const {
    settings,
    loading,
    saving,
    error,
    hasChanges,
    saveSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    updateSetting,
    clearError
  } = useClientSettings();

  const [showPasswords, setShowPasswords] = useState({});
  const [activeSection, setActiveSection] = useState('general');

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveSettings = async () => {
    const result = await saveSettings(settings);
    if (result.success) {
      // Show success message
    }
  };

  const handleResetToDefaults = async () => {
    const result = await resetToDefaults();
    if (result.success) {
      // Show success message
    }
  };

  const handleExportSettings = async () => {
    const result = await exportSettings();
    if (result.success) {
      // Show success message
    }
  };

  const handleImportSettings = async (file) => {
    const result = await importSettings(file);
    if (result.success) {
      // Show success message
    }
  };

  const sections = [
    { id: 'general', title: 'General', icon: Settings, description: 'Basic organization settings' },
    { id: 'userManagement', title: 'User Management', icon: Users, description: 'User registration and management' },
    { id: 'security', title: 'Security', icon: Shield, description: 'Security and access control' },
    { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Email and notification settings' },
    { id: 'dataManagement', title: 'Data Management', icon: Database, description: 'Data handling and retention' },
    { id: 'integrations', title: 'Integrations', icon: Globe, description: 'Third-party integrations' }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="defaultStatus">Default Organization Status</Label>
            <Select
              value={settings.general.defaultOrganizationStatus}
              onValueChange={(value) => updateSetting('general', 'defaultOrganizationStatus', value)}
            >
              2803
              <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
            </Select>
          </div>

          <div>
            <Label htmlFor="trialDays">Default Trial Days</Label>
            <Input
              id="trialDays"
              type="number"
              value={settings.general.defaultTrialDays}
              onChange={(e) => updateSetting('general', 'defaultTrialDays', parseInt(e.target.value))}
              min="1"
              max="365"
            />
          </div>

          <div>
            <Label htmlFor="maxOrgs">Max Organizations Per User</Label>
            <Input
              id="maxOrgs"
              type="number"
              value={settings.general.maxOrganizationsPerUser}
              onChange={(e) => updateSetting('general', 'maxOrganizationsPerUser', parseInt(e.target.value))}
              min="1"
              max="50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoApprove">Auto-approve Organizations</Label>
              <p className="text-sm text-gray-500">Automatically approve new organization registrations</p>
            </div>
            <Switch
              id="autoApprove"
              checked={settings.general.autoApproveOrganizations}
              onCheckedChange={(checked) => updateSetting('general', 'autoApproveOrganizations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailVerification">Require Email Verification</Label>
              <p className="text-sm text-gray-500">Users must verify their email address</p>
            </div>
            <Switch
              id="emailVerification"
              checked={settings.general.requireEmailVerification}
              onCheckedChange={(checked) => updateSetting('general', 'requireEmailVerification', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="selfRegistration">Allow Self Registration</Label>
              <p className="text-sm text-gray-500">Allow users to register without invitation</p>
            </div>
            <Switch
              id="selfRegistration"
              checked={settings.general.allowSelfRegistration}
              onCheckedChange={(checked) => updateSetting('general', 'allowSelfRegistration', checked)}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="namePattern">Organization Name Pattern</Label>
        <Input
          id="namePattern"
          value={settings.general.organizationNamePattern}
          onChange={(e) => updateSetting('general', 'organizationNamePattern', e.target.value)}
          placeholder="Regex pattern for organization names"
        />
        <p className="text-sm text-gray-500 mt-1">Regular expression pattern for valid organization names</p>
      </div>

      <div>
        <Label htmlFor="descriptionLength">Description Max Length</Label>
        <Input
          id="descriptionLength"
          type="number"
          value={settings.general.organizationDescriptionMaxLength}
          onChange={(e) => updateSetting('general', 'organizationDescriptionMaxLength', parseInt(e.target.value))}
          min="50"
          max="2000"
        />
      </div>
    </div>
  );

  const renderUserManagementSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="defaultRole">Default User Role</Label>
            <Select
              value={settings.userManagement.defaultUserRole}
              onValueChange={(value) => updateSetting('userManagement', 'defaultUserRole', value)}
            >
              7110
              <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxUsers">Max Users Per Organization</Label>
            <Input
              id="maxUsers"
              type="number"
              value={settings.userManagement.maxUsersPerOrganization}
              onChange={(e) => updateSetting('userManagement', 'maxUsersPerOrganization', parseInt(e.target.value))}
              min="1"
              max="1000"
            />
          </div>

          <div>
            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.userManagement.userSessionTimeout}
              onChange={(e) => updateSetting('userManagement', 'userSessionTimeout', parseInt(e.target.value))}
              min="1"
              max="168"
            />
          </div>

          <div>
            <Label htmlFor="passwordLength">Password Min Length</Label>
            <Input
              id="passwordLength"
              type="number"
              value={settings.userManagement.passwordMinLength}
              onChange={(e) => updateSetting('userManagement', 'passwordMinLength', parseInt(e.target.value))}
              min="6"
              max="32"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="userInvitations">Allow User Invitations</Label>
              <p className="text-sm text-gray-500">Allow admins to invite new users</p>
            </div>
            <Switch
              id="userInvitations"
              checked={settings.userManagement.allowUserInvitations}
              onCheckedChange={(checked) => updateSetting('userManagement', 'allowUserInvitations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="adminApproval">Require Admin Approval</Label>
              <p className="text-sm text-gray-500">New users require admin approval</p>
            </div>
            <Switch
              id="adminApproval"
              checked={settings.userManagement.requireAdminApproval}
              onCheckedChange={(checked) => updateSetting('userManagement', 'requireAdminApproval', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="roleChanges">Allow Role Changes</Label>
              <p className="text-sm text-gray-500">Allow changing user roles</p>
            </div>
            <Switch
              id="roleChanges"
              checked={settings.userManagement.allowRoleChanges}
              onCheckedChange={(checked) => updateSetting('userManagement', 'allowRoleChanges', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="strongPasswords">Require Strong Passwords</Label>
              <p className="text-sm text-gray-500">Enforce complex password requirements</p>
            </div>
            <Switch
              id="strongPasswords"
              checked={settings.userManagement.requireStrongPasswords}
              onCheckedChange={(checked) => updateSetting('userManagement', 'requireStrongPasswords', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactor">Enable Two-Factor Auth</Label>
              <p className="text-sm text-gray-500">Require 2FA for all users</p>
            </div>
            <Switch
              id="twoFactor"
              checked={settings.userManagement.enableTwoFactorAuth}
              onCheckedChange={(checked) => updateSetting('userManagement', 'enableTwoFactorAuth', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="passwordReset">Allow Password Reset</Label>
              <p className="text-sm text-gray-500">Allow users to reset their passwords</p>
            </div>
            <Switch
              id="passwordReset"
              checked={settings.userManagement.allowPasswordReset}
              onCheckedChange={(checked) => updateSetting('userManagement', 'allowPasswordReset', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="rateLimit">API Rate Limit (per minute)</Label>
            <Input
              id="rateLimit"
              type="number"
              value={settings.security.apiRateLimitPerMinute}
              onChange={(e) => updateSetting('security', 'apiRateLimitPerMinute', parseInt(e.target.value))}
              min="10"
              max="1000"
            />
          </div>

          <div>
            <Label htmlFor="logRetention">Log Retention (days)</Label>
            <Input
              id="logRetention"
              type="number"
              value={settings.security.logRetentionDays}
              onChange={(e) => updateSetting('security', 'logRetentionDays', parseInt(e.target.value))}
              min="7"
              max="365"
            />
          </div>

          <div>
            <Label htmlFor="corsOrigins">CORS Origins</Label>
            <Input
              id="corsOrigins"
              value={settings.security.corsOrigins}
              onChange={(e) => updateSetting('security', 'corsOrigins', e.target.value)}
              placeholder="https://example.com,https://app.example.com"
            />
            <p className="text-sm text-gray-500 mt-1">Comma-separated list of allowed origins</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="rateLimiting">Enable API Rate Limiting</Label>
              <p className="text-sm text-gray-500">Limit API requests per minute</p>
            </div>
            <Switch
              id="rateLimiting"
              checked={settings.security.enableApiRateLimiting}
              onCheckedChange={(checked) => updateSetting('security', 'enableApiRateLimiting', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ipWhitelisting">Enable IP Whitelisting</Label>
              <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
            </div>
            <Switch
              id="ipWhitelisting"
              checked={settings.security.enableIpWhitelisting}
              onCheckedChange={(checked) => updateSetting('security', 'enableIpWhitelisting', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auditLogging">Enable Audit Logging</Label>
              <p className="text-sm text-gray-500">Log all user actions and changes</p>
            </div>
            <Switch
              id="auditLogging"
              checked={settings.security.enableAuditLogging}
              onCheckedChange={(checked) => updateSetting('security', 'enableAuditLogging', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dataEncryption">Enable Data Encryption</Label>
              <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
            </div>
            <Switch
              id="dataEncryption"
              checked={settings.security.enableDataEncryption}
              onCheckedChange={(checked) => updateSetting('security', 'enableDataEncryption', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireHttps">Require HTTPS</Label>
              <p className="text-sm text-gray-500">Force HTTPS for all connections</p>
            </div>
            <Switch
              id="requireHttps"
              checked={settings.security.requireHttps}
              onCheckedChange={(checked) => updateSetting('security', 'requireHttps', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableCors">Enable CORS</Label>
              <p className="text-sm text-gray-500">Allow cross-origin requests</p>
            </div>
            <Switch
              id="enableCors"
              checked={settings.security.enableCors}
              onCheckedChange={(checked) => updateSetting('security', 'enableCors', checked)}
            />
          </div>
        </div>
      </div>

      {settings.security.enableIpWhitelisting && (
        <div>
          <Label htmlFor="allowedIps">Allowed IP Addresses</Label>
          <Textarea
            id="allowedIps"
            value={settings.security.allowedIpAddresses}
            onChange={(e) => updateSetting('security', 'allowedIpAddresses', e.target.value)}
            placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-1">One IP address or CIDR block per line</p>
        </div>
      )}
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="emailFrom">Email From Address</Label>
            <Input
              id="emailFrom"
              type="email"
              value={settings.notifications.emailFromAddress}
              onChange={(e) => updateSetting('notifications', 'emailFromAddress', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emailFromName">Email From Name</Label>
            <Input
              id="emailFromName"
              value={settings.notifications.emailFromName}
              onChange={(e) => updateSetting('notifications', 'emailFromName', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="smsProvider">SMS Provider</Label>
            <Select
              value={settings.notifications.smsProvider}
              onValueChange={(value) => updateSetting('notifications', 'smsProvider', value)}
            >
              18270
              <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="aws-sns">AWS SNS</SelectItem>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
              <p className="text-sm text-gray-500">Send email notifications</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.notifications.enableEmailNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'enableEmailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyNewOrg">Notify on New Organization</Label>
              <p className="text-sm text-gray-500">Send notification when new organization is created</p>
            </div>
            <Switch
              id="notifyNewOrg"
              checked={settings.notifications.notifyOnNewOrganization}
              onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnNewOrganization', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyUserReg">Notify on User Registration</Label>
              <p className="text-sm text-gray-500">Send notification when new user registers</p>
            </div>
            <Switch
              id="notifyUserReg"
              checked={settings.notifications.notifyOnUserRegistration}
              onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnUserRegistration', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifySuspicious">Notify on Suspicious Activity</Label>
              <p className="text-sm text-gray-500">Send notification for suspicious activities</p>
            </div>
            <Switch
              id="notifySuspicious"
              checked={settings.notifications.notifyOnSuspiciousActivity}
              onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnSuspiciousActivity', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifyMaintenance">Notify on System Maintenance</Label>
              <p className="text-sm text-gray-500">Send notification for system maintenance</p>
            </div>
            <Switch
              id="notifyMaintenance"
              checked={settings.notifications.notifyOnSystemMaintenance}
              onCheckedChange={(checked) => updateSetting('notifications', 'notifyOnSystemMaintenance', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="smsNotifications">Enable SMS Notifications</Label>
              <p className="text-sm text-gray-500">Send SMS notifications</p>
            </div>
            <Switch
              id="smsNotifications"
              checked={settings.notifications.enableSmsNotifications}
              onCheckedChange={(checked) => updateSetting('notifications', 'enableSmsNotifications', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataManagementSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="backupFrequency">Backup Frequency</Label>
            <Select
              value={settings.dataManagement.backupFrequency}
              onValueChange={(value) => updateSetting('dataManagement', 'backupFrequency', value)}
            >
              22500
              <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
            </Select>
          </div>

          <div>
            <Label htmlFor="backupRetention">Backup Retention (days)</Label>
            <Input
              id="backupRetention"
              type="number"
              value={settings.dataManagement.backupRetentionDays}
              onChange={(e) => updateSetting('dataManagement', 'backupRetentionDays', parseInt(e.target.value))}
              min="1"
              max="365"
            />
          </div>

          <div>
            <Label htmlFor="dataRetention">Data Retention Policy</Label>
            <Select
              value={settings.dataManagement.dataRetentionPolicy}
              onValueChange={(value) => updateSetting('dataManagement', 'dataRetentionPolicy', value)}
            >
              23671
              <SelectItem value="standard">Standard (7 years)</SelectItem>
                <SelectItem value="extended">Extended (10 years)</SelectItem>
                <SelectItem value="minimal">Minimal (3 years)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dataBackup">Enable Data Backup</Label>
              <p className="text-sm text-gray-500">Automatically backup data</p>
            </div>
            <Switch
              id="dataBackup"
              checked={settings.dataManagement.enableDataBackup}
              onCheckedChange={(checked) => updateSetting('dataManagement', 'enableDataBackup', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dataExport">Enable Data Export</Label>
              <p className="text-sm text-gray-500">Allow users to export their data</p>
            </div>
            <Switch
              id="dataExport"
              checked={settings.dataManagement.enableDataExport}
              onCheckedChange={(checked) => updateSetting('dataManagement', 'enableDataExport', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="bulkOperations">Allow Bulk Operations</Label>
              <p className="text-sm text-gray-500">Allow bulk data operations</p>
            </div>
            <Switch
              id="bulkOperations"
              checked={settings.dataManagement.allowBulkOperations}
              onCheckedChange={(checked) => updateSetting('dataManagement', 'allowBulkOperations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="softDelete">Enable Soft Delete</Label>
              <p className="text-sm text-gray-500">Keep deleted data for recovery</p>
            </div>
            <Switch
              id="softDelete"
              checked={settings.dataManagement.enableSoftDelete}
              onCheckedChange={(checked) => updateSetting('dataManagement', 'enableSoftDelete', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="gdprCompliance">Enable GDPR Compliance</Label>
              <p className="text-sm text-gray-500">Comply with GDPR regulations</p>
            </div>
            <Switch
              id="gdprCompliance"
              checked={settings.dataManagement.enableGdprCompliance}
              onCheckedChange={(checked) => updateSetting('dataManagement', 'enableGdprCompliance', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dataAnonymization">Allow Data Anonymization</Label>
              <p className="text-sm text-gray-500">Allow anonymizing personal data</p>
            </div>
            <Switch
              id="dataAnonymization"
              checked={settings.dataManagement.allowDataAnonymization}
              onCheckedChange={(checked) => updateSetting('dataManagement', 'allowDataAnonymization', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="webhookTimeout">Webhook Timeout (seconds)</Label>
            <Input
              id="webhookTimeout"
              type="number"
              value={settings.integrations.webhookTimeout}
              onChange={(e) => updateSetting('integrations', 'webhookTimeout', parseInt(e.target.value))}
              min="5"
              max="300"
            />
          </div>

          <div>
            <Label htmlFor="apiKeyExpiration">API Key Expiration (days)</Label>
            <Input
              id="apiKeyExpiration"
              type="number"
              value={settings.integrations.apiKeyExpirationDays}
              onChange={(e) => updateSetting('integrations', 'apiKeyExpirationDays', parseInt(e.target.value))}
              min="1"
              max="3650"
            />
          </div>

          <div>
            <Label htmlFor="ssoProvider">SSO Provider</Label>
            <Select
              value={settings.integrations.ssoProvider}
              onValueChange={(value) => updateSetting('integrations', 'ssoProvider', value)}
            >
              28652
              <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                <SelectItem value="saml">SAML</SelectItem>
                <SelectItem value="ldap">LDAP</SelectItem>
                <SelectItem value="openid">OpenID Connect</SelectItem>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="webhooks">Enable Webhooks</Label>
              <p className="text-sm text-gray-500">Allow webhook integrations</p>
            </div>
            <Switch
              id="webhooks"
              checked={settings.integrations.enableWebhooks}
              onCheckedChange={(checked) => updateSetting('integrations', 'enableWebhooks', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="apiKeys">Enable API Keys</Label>
              <p className="text-sm text-gray-500">Allow API key authentication</p>
            </div>
            <Switch
              id="apiKeys"
              checked={settings.integrations.enableApiKeys}
              onCheckedChange={(checked) => updateSetting('integrations', 'enableApiKeys', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sso">Enable SSO</Label>
              <p className="text-sm text-gray-500">Enable single sign-on</p>
            </div>
            <Switch
              id="sso"
              checked={settings.integrations.enableSso}
              onCheckedChange={(checked) => updateSetting('integrations', 'enableSso', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="thirdPartyIntegrations">Enable Third-Party Integrations</Label>
              <p className="text-sm text-gray-500">Allow third-party service integrations</p>
            </div>
            <Switch
              id="thirdPartyIntegrations"
              checked={settings.integrations.enableThirdPartyIntegrations}
              onCheckedChange={(checked) => updateSetting('integrations', 'enableThirdPartyIntegrations', checked)}
            />
          </div>
        </div>
      </div>

      {settings.integrations.enableThirdPartyIntegrations && (
        <div>
          <Label>Allowed Integrations</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {['slack', 'microsoft-teams', 'discord', 'telegram', 'whatsapp', 'facebook', 'twitter', 'linkedin'].map((integration) => (
              <div key={integration} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={integration}
                  checked={settings.integrations.allowedIntegrations.includes(integration)}
                  onChange={(e) => {
                    const current = settings.integrations.allowedIntegrations;
                    const updated = e.target.checked
                      ? [...current, integration]
                      : current.filter(item => item !== integration);
                    updateSetting('integrations', 'allowedIntegrations', updated);
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={integration} className="text-sm capitalize">
                  {integration.replace('-', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'userManagement':
        return renderUserManagementSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'dataManagement':
        return renderDataManagementSettings();
      case 'integrations':
        return renderIntegrationSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <p className="text-gray-500">Failed to load settings</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Management Settings</h2>
          <p className="text-gray-600">Configure system-wide settings for client management</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={saving || !hasChanges}
            className="min-w-[100px]"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-sm text-gray-500">{section.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(sections.find(s => s.id === activeSection)?.icon || Settings, { className: "h-5 w-5" })}
                <span>{sections.find(s => s.id === activeSection)?.title || 'Settings'}</span>
              </CardTitle>
              <CardDescription>
                {sections.find(s => s.id === activeSection)?.description || 'Configure your settings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSectionContent()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unsaved Changes</AlertTitle>
          <AlertDescription>
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ClientSettings;
