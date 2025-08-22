import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';
import { 
  Shield,
  AlertTriangle,
  Settings,
  Lock,
  Users,
  Globe,
  Clock,
  Key,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle,
  Info,
  Zap,
  Database,
  Network,
  Smartphone,
  Mail,
  Bell,
  ShieldCheck,
  AlertCircle,
  Fingerprint
} from 'lucide-react';

const SecurityTab = () => {
  // State for security settings dialog
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    // General Security
    sessionTimeout: '24',
    maxLoginAttempts: '5',
    lockoutDuration: '30',
    passwordExpiry: '90',
    requireStrongPassword: true,
    
    // Authentication
    twoFactorAuth: false,
    twoFactorMethod: 'app',
    backupCodes: true,
    rememberDevice: true,
    
    // Access Control
    ipWhitelist: false,
    allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
    geoRestriction: false,
    allowedCountries: ['ID', 'SG', 'MY'],
    
    // API Security
    apiRateLimit: '1000',
    apiKeyExpiry: '365',
    requireApiKeyAuth: true,
    apiKeyPermissions: ['read', 'write'],
    
    // Data Protection
    dataEncryption: true,
    backupEncryption: true,
    auditLogRetention: '365',
    sensitiveDataMasking: true,
    
    // Notifications
    securityAlerts: true,
    loginNotifications: true,
    suspiciousActivityAlerts: true,
    adminNotifications: true
  });

  // Sample data untuk Audit Logs
  const auditLogs = [
    { id: 1, timestamp: '2024-03-20 14:30:25', user: 'Ahmad Rahman', action: 'API Key Created', resource: 'Production API', ip: '192.168.1.100' },
    { id: 2, timestamp: '2024-03-20 13:45:12', user: 'Sari Dewi', action: 'User Role Updated', resource: 'Budi Santoso', ip: '192.168.1.101' },
    { id: 3, timestamp: '2024-03-20 12:15:45', user: 'Ahmad Rahman', action: 'Webhook Modified', resource: 'Order Notifications', ip: '192.168.1.100' },
    { id: 4, timestamp: '2024-03-20 11:30:18', user: 'System', action: 'Bot Personality Updated', resource: 'Ramah & Profesional', ip: 'System' },
    { id: 5, timestamp: '2024-03-20 10:22:33', user: 'Sari Dewi', action: 'Integration Configured', resource: 'WhatsApp Business', ip: '192.168.1.101' },
    { id: 6, timestamp: '2024-03-20 09:45:17', user: 'Ahmad Rahman', action: 'User Invited', resource: 'budi.santoso@company.com', ip: '192.168.1.100' },
    { id: 7, timestamp: '2024-03-20 08:30:45', user: 'System', action: 'Backup Completed', resource: 'Database Backup', ip: 'System' },
    { id: 8, timestamp: '2024-03-19 17:22:11', user: 'Rina Sari', action: 'Channel Activated', resource: 'Facebook Messenger', ip: '192.168.1.102' },
  ];

  // Statistics for security overview
  const securityStats = {
    totalLogs: 156,
    todayLogs: 8,
    activeUsers: 3,
    failedAttempts: 0
  };

  // Handler functions
  const handleOpenSecurityDialog = () => {
    setShowSecurityDialog(true);
  };

  const handleCloseSecurityDialog = () => {
    setShowSecurityDialog(false);
    setActiveTab('general');
  };

  const handleSettingChange = (category, setting, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    console.log('Saving security settings:', securitySettings);
    // Show success message or handle response
    handleCloseSecurityDialog();
  };

  const handleResetSettings = () => {
    // Reset to default values
    setSecuritySettings({
      sessionTimeout: '24',
      maxLoginAttempts: '5',
      lockoutDuration: '30',
      passwordExpiry: '90',
      requireStrongPassword: true,
      twoFactorAuth: false,
      twoFactorMethod: 'app',
      backupCodes: true,
      rememberDevice: true,
      ipWhitelist: false,
      allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
      geoRestriction: false,
      allowedCountries: ['ID', 'SG', 'MY'],
      apiRateLimit: '1000',
      apiKeyExpiry: '365',
      requireApiKeyAuth: true,
      apiKeyPermissions: ['read', 'write'],
      dataEncryption: true,
      backupEncryption: true,
      auditLogRetention: '365',
      sensitiveDataMasking: true,
      securityAlerts: true,
      loginNotifications: true,
      suspiciousActivityAlerts: true,
      adminNotifications: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securityStats.totalLogs}</p>
                <p className="text-sm text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securityStats.todayLogs}</p>
                <p className="text-sm text-muted-foreground">Today's Activity</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securityStats.activeUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securityStats.failedAttempts}</p>
                <p className="text-sm text-muted-foreground">Failed Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security & Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security & Audit Logs
          </CardTitle>
          <CardDescription>Tampilan read-only audit_logs dengan filter organization_id</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Audit logs menampilkan aktivitas untuk organization_id Anda saja. Data ini tidak dapat diedit dan bersifat read-only.
            </AlertDescription>
          </Alert>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Timestamp</TableHead>
                  <TableHead className="min-w-[120px]">User</TableHead>
                  <TableHead className="min-w-[150px]">Action</TableHead>
                  <TableHead className="min-w-[150px]">Resource</TableHead>
                  <TableHead className="min-w-[120px]">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.user === 'System' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                        <span className={log.user === 'System' ? 'text-blue-600 font-medium' : ''}>
                          {log.user}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={
                          log.action.includes('Created') || log.action.includes('Activated') ? 'border-green-200 text-green-700' :
                          log.action.includes('Updated') || log.action.includes('Modified') ? 'border-blue-200 text-blue-700' :
                          log.action.includes('Deleted') || log.action.includes('Removed') ? 'border-red-200 text-red-700' :
                          'border-gray-200 text-gray-700'
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.resource}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{log.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Menampilkan {auditLogs.length} dari {securityStats.totalLogs} total log entries
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Konfigurasi keamanan untuk organisasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Session Management</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Automatically logout after inactivity</p>
                  </div>
                  <Badge>24 hours</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Extra security for admin accounts</p>
                  </div>
                  <Badge variant="secondary">Disabled</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Access Control</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">IP Whitelist</p>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
                  </div>
                  <Badge variant="secondary">Not configured</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">API Rate Limiting</p>
                    <p className="text-sm text-muted-foreground">Limit API requests per minute</p>
                  </div>
                  <Badge>1000/min</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleOpenSecurityDialog}>
              <Settings className="w-4 h-4 mr-2" />
              Configure Security Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings Configuration Dialog */}
      {showSecurityDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              {/* Dialog Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">Security Settings Configuration</h3>
                    <p className="text-sm text-gray-600">Konfigurasi keamanan lengkap untuk organisasi Anda</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseSecurityDialog} className="hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Tabs Navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-6 mb-8">
                  <TabsTrigger value="general" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    General
                  </TabsTrigger>
                  <TabsTrigger value="authentication" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Auth
                  </TabsTrigger>
                  <TabsTrigger value="access" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Access
                  </TabsTrigger>
                  <TabsTrigger value="api" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Data
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Alerts
                  </TabsTrigger>
                </TabsList>

                {/* General Security Tab */}
                <TabsContent value="general" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Session Management
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                          <Select value={securitySettings.sessionTimeout} onValueChange={(value) => handleSettingChange('general', 'sessionTimeout', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 hour</SelectItem>
                              <SelectItem value="4">4 hours</SelectItem>
                              <SelectItem value="8">8 hours</SelectItem>
                              <SelectItem value="24">24 hours</SelectItem>
                              <SelectItem value="168">1 week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
                          <Select value={securitySettings.maxLoginAttempts} onValueChange={(value) => handleSettingChange('general', 'maxLoginAttempts', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 attempts</SelectItem>
                              <SelectItem value="5">5 attempts</SelectItem>
                              <SelectItem value="10">10 attempts</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lockoutDuration">Account Lockout Duration (minutes)</Label>
                          <Select value={securitySettings.lockoutDuration} onValueChange={(value) => handleSettingChange('general', 'lockoutDuration', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                              <SelectItem value="1440">24 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Key className="w-5 h-5 text-green-600" />
                        Password Policy
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                          <Select value={securitySettings.passwordExpiry} onValueChange={(value) => handleSettingChange('general', 'passwordExpiry', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="60">60 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Switch
                            id="requireStrongPassword"
                            checked={securitySettings.requireStrongPassword}
                            onCheckedChange={(checked) => handleSettingChange('general', 'requireStrongPassword', checked)}
                          />
                          <Label htmlFor="requireStrongPassword">Require Strong Password</Label>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium">Strong Password Requirements:</p>
                              <ul className="mt-1 space-y-1">
                                <li>• Minimum 8 characters</li>
                                <li>• Mix of uppercase and lowercase</li>
                                <li>• Include numbers and symbols</li>
                                <li>• No common patterns</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Authentication Tab */}
                <TabsContent value="authentication" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Fingerprint className="w-5 h-5 text-purple-600" />
                        Two-Factor Authentication
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="twoFactorAuth"
                            checked={securitySettings.twoFactorAuth}
                            onCheckedChange={(checked) => handleSettingChange('authentication', 'twoFactorAuth', checked)}
                          />
                          <Label htmlFor="twoFactorAuth">Enable 2FA</Label>
                        </div>

                        {securitySettings.twoFactorAuth && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="twoFactorMethod">2FA Method</Label>
                              <Select value={securitySettings.twoFactorMethod} onValueChange={(value) => handleSettingChange('authentication', 'twoFactorMethod', value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="app">Authenticator App (TOTP)</SelectItem>
                                  <SelectItem value="sms">SMS Code</SelectItem>
                                  <SelectItem value="email">Email Code</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Switch
                                id="backupCodes"
                                checked={securitySettings.backupCodes}
                                onCheckedChange={(checked) => handleSettingChange('authentication', 'backupCodes', checked)}
                              />
                              <Label htmlFor="backupCodes">Generate Backup Codes</Label>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Switch
                                id="rememberDevice"
                                checked={securitySettings.rememberDevice}
                                onCheckedChange={(checked) => handleSettingChange('authentication', 'rememberDevice', checked)}
                              />
                              <Label htmlFor="rememberDevice">Remember Device (30 days)</Label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-orange-600" />
                        Additional Security
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <p className="font-medium">Security Recommendations:</p>
                              <ul className="mt-1 space-y-1">
                                <li>• Enable 2FA for all admin accounts</li>
                                <li>• Use strong, unique passwords</li>
                                <li>• Regularly review access logs</li>
                                <li>• Keep software updated</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Access Control Tab */}
                <TabsContent value="access" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Network className="w-5 h-5 text-indigo-600" />
                        IP Address Control
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="ipWhitelist"
                            checked={securitySettings.ipWhitelist}
                            onCheckedChange={(checked) => handleSettingChange('access', 'ipWhitelist', checked)}
                          />
                          <Label htmlFor="ipWhitelist">Enable IP Whitelist</Label>
                        </div>

                        {securitySettings.ipWhitelist && (
                          <div className="space-y-2">
                            <Label>Allowed IP Addresses/Ranges</Label>
                            <div className="space-y-2">
                              {securitySettings.allowedIPs.map((ip, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input value={ip} placeholder="192.168.1.0/24" />
                                  <Button variant="outline" size="sm">Remove</Button>
                                </div>
                              ))}
                              <Button variant="outline" size="sm">+ Add IP Range</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-teal-600" />
                        Geographic Restrictions
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="geoRestriction"
                            checked={securitySettings.geoRestriction}
                            onCheckedChange={(checked) => handleSettingChange('access', 'geoRestriction', checked)}
                          />
                          <Label htmlFor="geoRestriction">Enable Geographic Restrictions</Label>
                        </div>

                        {securitySettings.geoRestriction && (
                          <div className="space-y-2">
                            <Label>Allowed Countries</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {securitySettings.allowedCountries.map((country, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <input type="checkbox" id={country} defaultChecked />
                                  <Label htmlFor={country} className="text-sm">{country}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* API Security Tab */}
                <TabsContent value="api" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Rate Limiting
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="apiRateLimit">API Rate Limit (requests per minute)</Label>
                          <Select value={securitySettings.apiRateLimit} onValueChange={(value) => handleSettingChange('api', 'apiRateLimit', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100/min</SelectItem>
                              <SelectItem value="500">500/min</SelectItem>
                              <SelectItem value="1000">1000/min</SelectItem>
                              <SelectItem value="5000">5000/min</SelectItem>
                              <SelectItem value="10000">10000/min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="apiKeyExpiry">API Key Expiry (days)</Label>
                          <Select value={securitySettings.apiKeyExpiry} onValueChange={(value) => handleSettingChange('api', 'apiKeyExpiry', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="0">Never expire</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Key className="w-5 h-5 text-red-600" />
                        API Authentication
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="requireApiKeyAuth"
                            checked={securitySettings.requireApiKeyAuth}
                            onCheckedChange={(checked) => handleSettingChange('api', 'requireApiKeyAuth', checked)}
                          />
                          <Label htmlFor="requireApiKeyAuth">Require API Key Authentication</Label>
                        </div>

                        <div className="space-y-2">
                          <Label>Default API Key Permissions</Label>
                          <div className="space-y-2">
                            {['read', 'write', 'delete', 'admin'].map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={permission}
                                  checked={securitySettings.apiKeyPermissions.includes(permission)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      handleSettingChange('api', 'apiKeyPermissions', [...securitySettings.apiKeyPermissions, permission]);
                                    } else {
                                      handleSettingChange('api', 'apiKeyPermissions', securitySettings.apiKeyPermissions.filter(p => p !== permission));
                                    }
                                  }}
                                />
                                <Label htmlFor={permission} className="text-sm capitalize">{permission}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Data Protection Tab */}
                <TabsContent value="data" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-600" />
                        Data Encryption
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="dataEncryption"
                            checked={securitySettings.dataEncryption}
                            onCheckedChange={(checked) => handleSettingChange('data', 'dataEncryption', checked)}
                          />
                          <Label htmlFor="dataEncryption">Enable Data Encryption at Rest</Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Switch
                            id="backupEncryption"
                            checked={securitySettings.backupEncryption}
                            onCheckedChange={(checked) => handleSettingChange('data', 'backupEncryption', checked)}
                          />
                          <Label htmlFor="backupEncryption">Encrypt Backup Data</Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Switch
                            id="sensitiveDataMasking"
                            checked={securitySettings.sensitiveDataMasking}
                            onCheckedChange={(checked) => handleSettingChange('data', 'sensitiveDataMasking', checked)}
                          />
                          <Label htmlFor="sensitiveDataMasking">Mask Sensitive Data in Logs</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Data Retention
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="auditLogRetention">Audit Log Retention (days)</Label>
                          <Select value={securitySettings.auditLogRetention} onValueChange={(value) => handleSettingChange('data', 'auditLogRetention', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 days</SelectItem>
                              <SelectItem value="90">90 days</SelectItem>
                              <SelectItem value="180">180 days</SelectItem>
                              <SelectItem value="365">1 year</SelectItem>
                              <SelectItem value="1095">3 years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <div className="text-sm text-green-800">
                              <p className="font-medium">Current Data Protection Status:</p>
                              <ul className="mt-1 space-y-1">
                                <li>• All data encrypted in transit (TLS 1.3)</li>
                                <li>• Database encryption enabled</li>
                                <li>• Regular security audits performed</li>
                                <li>• GDPR compliance maintained</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-600" />
                        Security Alerts
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="securityAlerts"
                            checked={securitySettings.securityAlerts}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'securityAlerts', checked)}
                          />
                          <Label htmlFor="securityAlerts">Enable Security Alerts</Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Switch
                            id="suspiciousActivityAlerts"
                            checked={securitySettings.suspiciousActivityAlerts}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'suspiciousActivityAlerts', checked)}
                          />
                          <Label htmlFor="suspiciousActivityAlerts">Suspicious Activity Alerts</Label>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Switch
                            id="adminNotifications"
                            checked={securitySettings.adminNotifications}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'adminNotifications', checked)}
                          />
                          <Label htmlFor="adminNotifications">Admin Notifications</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        Login Notifications
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id="loginNotifications"
                            checked={securitySettings.loginNotifications}
                            onCheckedChange={(checked) => handleSettingChange('notifications', 'loginNotifications', checked)}
                          />
                          <Label htmlFor="loginNotifications">Login Notifications</Label>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium">Notification Channels:</p>
                              <ul className="mt-1 space-y-1">
                                <li>• Email notifications</li>
                                <li>• SMS alerts (if configured)</li>
                                <li>• In-app notifications</li>
                                <li>• Webhook notifications</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-8 border-t mt-8">
                <Button variant="outline" onClick={handleResetSettings}>
                  Reset to Defaults
                </Button>
                <div className="flex gap-3 ml-auto">
                  <Button variant="outline" onClick={handleCloseSecurityDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityTab;
