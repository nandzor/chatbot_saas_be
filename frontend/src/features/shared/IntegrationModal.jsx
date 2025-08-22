import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Separator
} from '@/components/ui';
import { 
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Settings,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

const IntegrationModal = ({ integration, isOpen, onClose, onSave }) => {
  const [config, setConfig] = useState(integration?.config || {});
  const [showSensitiveData, setShowSensitiveData] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen || !integration) return null;

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedConfigChange = (parentKey, childKey, value) => {
    setConfig(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(integration.id, config);
    onClose();
  };

  const toggleSensitiveData = (field) => {
    setShowSensitiveData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderConfigForm = () => {
    switch (integration.name) {
      case "Google Sheets":
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Akun Google Terhubung</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {config.googleAccountConnected ? 'admin@company.com' : 'Belum terhubung'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sheetId">Google Sheet ID</Label>
              <Input 
                id="sheetId"
                value={config.sheetId || ''}
                onChange={(e) => handleConfigChange('sheetId', e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              />
              <p className="text-xs text-muted-foreground">
                Copy ID dari URL Google Sheet Anda
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sheetName">Nama Sheet</Label>
              <Input 
                id="sheetName"
                value={config.sheetName || ''}
                onChange={(e) => handleConfigChange('sheetName', e.target.value)}
                placeholder="Customers"
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-2">
                {['read', 'write'].map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Switch 
                      checked={config.permissions?.includes(permission)}
                      onCheckedChange={(checked) => {
                        const newPermissions = checked 
                          ? [...(config.permissions || []), permission]
                          : (config.permissions || []).filter(p => p !== permission);
                        handleConfigChange('permissions', newPermissions);
                      }}
                    />
                    <Label className="capitalize">{permission}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "WhatsApp Business API":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessAccountId">Business Account ID</Label>
              <Input 
                id="businessAccountId"
                value={config.businessAccountId || ''}
                onChange={(e) => handleConfigChange('businessAccountId', e.target.value)}
                placeholder="123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">Phone Number ID</Label>
              <Input 
                id="phoneNumberId"
                value={config.phoneNumberId || ''}
                onChange={(e) => handleConfigChange('phoneNumberId', e.target.value)}
                placeholder="987654321"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <div className="flex gap-2">
                <Input 
                  id="accessToken"
                  type={showSensitiveData.accessToken ? "text" : "password"}
                  value={config.accessToken || ''}
                  onChange={(e) => handleConfigChange('accessToken', e.target.value)}
                  placeholder="EAABwzLixnjYBOZB..."
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleSensitiveData('accessToken')}
                >
                  {showSensitiveData.accessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookVerifyToken">Webhook Verify Token</Label>
              <div className="flex gap-2">
                <Input 
                  id="webhookVerifyToken"
                  type={showSensitiveData.webhookVerifyToken ? "text" : "password"}
                  value={config.webhookVerifyToken || ''}
                  onChange={(e) => handleConfigChange('webhookVerifyToken', e.target.value)}
                  placeholder="your_verify_token"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleSensitiveData('webhookVerifyToken')}
                >
                  {showSensitiveData.webhookVerifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        );

      case "Allow List (Whitelist Numbers)":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Whitelist Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan untuk membatasi akses hanya untuk nomor terdaftar
                </p>
              </div>
              <Switch 
                checked={config.enabled || false}
                onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allowedNumbers">Allowed Numbers</Label>
              <Textarea 
                id="allowedNumbers"
                value={(config.allowedNumbers || []).join('\n')}
                onChange={(e) => handleConfigChange('allowedNumbers', e.target.value.split('\n').filter(n => n.trim()))}
                placeholder="+6281234567890&#10;+6281234567891&#10;+6281234567892"
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Satu nomor per baris, format: +62xxx
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blockMessage">Block Message</Label>
              <Textarea 
                id="blockMessage"
                value={config.blockMessage || ''}
                onChange={(e) => handleConfigChange('blockMessage', e.target.value)}
                placeholder="Maaf, nomor Anda tidak terdaftar untuk menggunakan layanan ini."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminNumbers">Admin Numbers</Label>
              <Textarea 
                id="adminNumbers"
                value={(config.adminNumbers || []).join('\n')}
                onChange={(e) => handleConfigChange('adminNumbers', e.target.value.split('\n').filter(n => n.trim()))}
                placeholder="+6281234567890"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Admin dapat bypass whitelist
              </p>
            </div>
          </div>
        );

      case "Kirim Notifikasi Pribadi":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pushApiKey">Push Notification API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="pushApiKey"
                  type={showSensitiveData.pushApiKey ? "text" : "password"}
                  value={config.pushNotificationApiKey || ''}
                  onChange={(e) => handleConfigChange('pushNotificationApiKey', e.target.value)}
                  placeholder="fcm_server_key_..."
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleSensitiveData('pushApiKey')}
                >
                  {showSensitiveData.pushApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Email Provider</Label>
              <Select 
                value={config.emailProvider || 'smtp'}
                onValueChange={(value) => handleConfigChange('emailProvider', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.emailProvider === 'smtp' && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">SMTP Configuration</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">Host</Label>
                    <Input 
                      id="smtpHost"
                      value={config.smtpConfig?.host || ''}
                      onChange={(e) => handleNestedConfigChange('smtpConfig', 'host', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Port</Label>
                    <Input 
                      id="smtpPort"
                      type="number"
                      value={config.smtpConfig?.port || ''}
                      onChange={(e) => handleNestedConfigChange('smtpConfig', 'port', parseInt(e.target.value))}
                      placeholder="587"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">Username</Label>
                  <Input 
                    id="smtpUsername"
                    value={config.smtpConfig?.username || ''}
                    onChange={(e) => handleNestedConfigChange('smtpConfig', 'username', e.target.value)}
                    placeholder="admin@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Password</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="smtpPassword"
                      type={showSensitiveData.smtpPassword ? "text" : "password"}
                      value={config.smtpConfig?.password || ''}
                      onChange={(e) => handleNestedConfigChange('smtpConfig', 'password', e.target.value)}
                      placeholder="app_password"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => toggleSensitiveData('smtpPassword')}
                    >
                      {showSensitiveData.smtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <Label>Notification Rules</Label>
              {(config.notificationRules || []).map((rule, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium capitalize">{rule.trigger.replace('_', ' ')}</h5>
                    <Switch 
                      checked={rule.enabled}
                      onCheckedChange={(checked) => {
                        const newRules = [...(config.notificationRules || [])];
                        newRules[index] = { ...rule, enabled: checked };
                        handleConfigChange('notificationRules', newRules);
                      }}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={rule.pushNotification}
                        onCheckedChange={(checked) => {
                          const newRules = [...(config.notificationRules || [])];
                          newRules[index] = { ...rule, pushNotification: checked };
                          handleConfigChange('notificationRules', newRules);
                        }}
                      />
                      <Label className="text-sm">Push</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={rule.emailNotification}
                        onCheckedChange={(checked) => {
                          const newRules = [...(config.notificationRules || [])];
                          newRules[index] = { ...rule, emailNotification: checked };
                          handleConfigChange('notificationRules', newRules);
                        }}
                      />
                      <Label className="text-sm">Email</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "Auto Reminder":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select 
                value={config.timezone || 'Asia/Jakarta'}
                onValueChange={(value) => handleConfigChange('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                  <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                  <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultReminderTime">Default Reminder Time</Label>
              <Input 
                id="defaultReminderTime"
                type="time"
                value={config.defaultReminderTime || '09:00'}
                onChange={(e) => handleConfigChange('defaultReminderTime', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxReminders">Max Reminders per User</Label>
              <Input 
                id="maxReminders"
                type="number"
                min="1"
                max="50"
                value={config.maxRemindersPerUser || 10}
                onChange={(e) => handleConfigChange('maxRemindersPerUser', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Channels</Label>
              <div className="flex flex-wrap gap-2">
                {['chat', 'email', 'sms'].map(channel => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Switch 
                      checked={config.notificationChannels?.includes(channel)}
                      onCheckedChange={(checked) => {
                        const channels = checked 
                          ? [...(config.notificationChannels || []), channel]
                          : (config.notificationChannels || []).filter(c => c !== channel);
                        handleConfigChange('notificationChannels', channels);
                      }}
                    />
                    <Label className="capitalize">{channel}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Nearest Location":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Map Provider</Label>
              <Select 
                value={config.mapProvider || 'google_maps'}
                onValueChange={(value) => handleConfigChange('mapProvider', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_maps">Google Maps</SelectItem>
                  <SelectItem value="mapbox">Mapbox</SelectItem>
                  <SelectItem value="here">HERE Maps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="apiKey"
                  type={showSensitiveData.apiKey ? "text" : "password"}
                  value={config.apiKey || ''}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder="AIzaSyC..."
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleSensitiveData('apiKey')}
                >
                  {showSensitiveData.apiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchRadius">Search Radius (meters)</Label>
                <Input 
                  id="searchRadius"
                  type="number"
                  min="100"
                  max="50000"
                  value={config.searchRadius || 5000}
                  onChange={(e) => handleConfigChange('searchRadius', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxResults">Max Results</Label>
                <Input 
                  id="maxResults"
                  type="number"
                  min="1"
                  max="50"
                  value={config.maxResults || 10}
                  onChange={(e) => handleConfigChange('maxResults', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location Types</Label>
              <div className="flex flex-wrap gap-2">
                {['store', 'atm', 'service_center', 'distributor'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Switch 
                      checked={config.locationTypes?.includes(type)}
                      onCheckedChange={(checked) => {
                        const types = checked 
                          ? [...(config.locationTypes || []), type]
                          : (config.locationTypes || []).filter(t => t !== type);
                        handleConfigChange('locationTypes', types);
                      }}
                    />
                    <Label className="capitalize">{type.replace('_', ' ')}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "Netzme":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="merchantId">Merchant ID</Label>
              <Input 
                id="merchantId"
                value={config.merchantId || ''}
                onChange={(e) => handleConfigChange('merchantId', e.target.value)}
                placeholder="NTZ123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="netzmeApiKey">API Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="netzmeApiKey"
                  type={showSensitiveData.netzmeApiKey ? "text" : "password"}
                  value={config.apiKey || ''}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  placeholder="ntz_api_..."
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleSensitiveData('netzmeApiKey')}
                >
                  {showSensitiveData.netzmeApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey">Secret Key</Label>
              <div className="flex gap-2">
                <Input 
                  id="secretKey"
                  type={showSensitiveData.secretKey ? "text" : "password"}
                  value={config.secretKey || ''}
                  onChange={(e) => handleConfigChange('secretKey', e.target.value)}
                  placeholder="ntz_secret_..."
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleSensitiveData('secretKey')}
                >
                  {showSensitiveData.secretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Environment</Label>
              <Select 
                value={config.environment || 'sandbox'}
                onValueChange={(value) => handleConfigChange('environment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input 
                id="webhookUrl"
                value={config.webhookUrl || ''}
                onChange={(e) => handleConfigChange('webhookUrl', e.target.value)}
                placeholder="https://your-domain.com/webhook/netzme"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configuration Form</h3>
              <p className="text-muted-foreground">
                Form konfigurasi untuk {integration.name} akan tersedia segera.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configure {integration.name}
              </CardTitle>
              <CardDescription>
                {integration.description}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Setup Steps Progress */}
          <div className="space-y-3">
            <Label>Setup Progress</Label>
            <div className="flex items-center gap-2">
              {integration.setupSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  {index < integration.setupSteps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {integration.setupSteps[currentStep]}
            </div>
          </div>

          <Separator />

          {/* Configuration Form */}
          {renderConfigForm()}

          <Separator />

          {/* Features List */}
          <div className="space-y-3">
            <Label>Features Included</Label>
            <div className="grid grid-cols-2 gap-2">
              {integration.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              {currentStep < integration.setupSteps.length - 1 && (
                <Button 
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next Step
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationModal;
