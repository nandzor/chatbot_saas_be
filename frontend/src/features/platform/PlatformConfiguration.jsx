import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  Key, 
  Shield, 
  Flag, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  History,
  Globe,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Settings
} from 'lucide-react';

const PlatformConfiguration = () => {
  const [activeTab, setActiveTab] = useState('credentials');
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false);
  const [isFeatureFlagDialogOpen, setIsFeatureFlagDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState({});
  const [credentialForm, setCredentialForm] = useState({
    name: '',
    provider: '',
    apiKey: '',
    secretKey: '',
    environment: 'production',
    description: ''
  });
  const [featureFlagForm, setFeatureFlagForm] = useState({
    name: '',
    description: '',
    enabled: false,
    rolloutPercentage: 0,
    targetSegments: [],
    environment: 'production'
  });

  // Mock data untuk credentials
  const [credentials, setCredentials] = useState([
    {
      id: 1,
      name: 'Midtrans Payment Gateway',
      provider: 'midtrans',
      environment: 'production',
      status: 'active',
      lastRotated: '2024-01-15',
      apiKeyPreview: 'SB-Mid-••••••••••••-••••••••',
      description: 'Production payment processing',
      createdBy: 'john.doe@company.com',
      createdAt: '2024-01-01T08:00:00Z'
    },
    {
      id: 2,
      name: 'SendGrid Email Service',
      provider: 'sendgrid',
      environment: 'production',
      status: 'active',
      lastRotated: '2024-01-10',
      apiKeyPreview: 'SG.••••••••••••••••••••••••',
      description: 'Transactional email delivery',
      createdBy: 'jane.smith@company.com',
      createdAt: '2024-01-01T09:00:00Z'
    },
    {
      id: 3,
      name: 'Twilio SMS Gateway',
      provider: 'twilio',
      environment: 'staging',
      status: 'warning',
      lastRotated: '2023-12-01',
      apiKeyPreview: 'AC••••••••••••••••••••••••••',
      description: 'SMS notifications and OTP',
      createdBy: 'mike.wilson@company.com',
      createdAt: '2023-12-01T10:00:00Z'
    }
  ]);

  // Mock data untuk feature flags
  const [featureFlags, setFeatureFlags] = useState([
    {
      id: 1,
      name: 'advanced_analytics',
      displayName: 'Advanced Analytics Dashboard',
      description: 'New analytics dashboard with real-time metrics',
      enabled: true,
      rolloutPercentage: 75,
      environment: 'production',
      targetSegments: ['enterprise', 'beta'],
      status: 'active',
      affectedUsers: 1250,
      createdBy: 'dev.team@company.com',
      createdAt: '2024-01-20T10:00:00Z',
      lastModified: '2024-01-25T14:30:00Z'
    },
    {
      id: 2,
      name: 'new_ui_theme',
      displayName: 'New UI Theme',
      description: 'Updated user interface with modern design',
      enabled: false,
      rolloutPercentage: 0,
      environment: 'staging',
      targetSegments: ['internal'],
      status: 'draft',
      affectedUsers: 0,
      createdBy: 'design.team@company.com',
      createdAt: '2024-01-22T09:00:00Z',
      lastModified: '2024-01-22T09:00:00Z'
    },
    {
      id: 3,
      name: 'mobile_app_integration',
      displayName: 'Mobile App Integration',
      description: 'Enhanced mobile application features',
      enabled: true,
      rolloutPercentage: 25,
      environment: 'production',
      targetSegments: ['mobile_users'],
      status: 'testing',
      affectedUsers: 320,
      createdBy: 'mobile.team@company.com',
      createdAt: '2024-01-18T11:00:00Z',
      lastModified: '2024-01-24T16:00:00Z'
    }
  ]);

  // Environment configuration
  const environments = [
    { value: 'development', label: '🚧 Development', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'staging', label: '🔧 Staging', color: 'bg-blue-100 text-blue-800' },
    { value: 'production', label: '🚀 Production', color: 'bg-green-100 text-green-800' }
  ];

  const providers = [
    { value: 'midtrans', label: 'Midtrans', icon: '💳' },
    { value: 'sendgrid', label: 'SendGrid', icon: '📧' },
    { value: 'twilio', label: 'Twilio', icon: '📱' },
    { value: 'aws', label: 'AWS Services', icon: '☁️' },
    { value: 'stripe', label: 'Stripe', icon: '💰' },
    { value: 'mailgun', label: 'Mailgun', icon: '📮' }
  ];

  const targetSegments = [
    { value: 'enterprise', label: 'Enterprise Clients' },
    { value: 'beta', label: 'Beta Testers' },
    { value: 'internal', label: 'Internal Users' },
    { value: 'mobile_users', label: 'Mobile Users' },
    { value: 'premium', label: 'Premium Subscribers' }
  ];

  const handleCredentialSubmit = (e) => {
    e.preventDefault();
    const newCredential = {
      id: Date.now(),
      ...credentialForm,
      status: 'active',
      lastRotated: new Date().toISOString().split('T')[0],
      apiKeyPreview: credentialForm.apiKey.substring(0, 8) + '••••••••••••••••',
      createdBy: 'current.user@company.com',
      createdAt: new Date().toISOString()
    };
    setCredentials([newCredential, ...credentials]);
    setCredentialForm({
      name: '',
      provider: '',
      apiKey: '',
      secretKey: '',
      environment: 'production',
      description: ''
    });
    setIsCredentialDialogOpen(false);
  };

  const handleFeatureFlagSubmit = (e) => {
    e.preventDefault();
    const newFlag = {
      id: Date.now(),
      ...featureFlagForm,
      displayName: featureFlagForm.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      status: featureFlagForm.enabled ? 'active' : 'draft',
      affectedUsers: featureFlagForm.enabled ? Math.floor(Math.random() * 1000) : 0,
      createdBy: 'current.user@company.com',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setFeatureFlags([newFlag, ...featureFlags]);
    setFeatureFlagForm({
      name: '',
      description: '',
      enabled: false,
      rolloutPercentage: 0,
      targetSegments: [],
      environment: 'production'
    });
    setIsFeatureFlagDialogOpen(false);
  };

  const toggleApiKeyVisibility = (id) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'green', label: 'Active' },
      warning: { color: 'yellow', label: 'Warning' },
      error: { color: 'red', label: 'Error' },
      draft: { color: 'gray', label: 'Draft' },
      testing: { color: 'blue', label: 'Testing' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.color}>{config.label}</Badge>;
  };

  const getEnvironmentBadge = (env) => {
    const envConfig = environments.find(e => e.value === env);
    return envConfig ? (
      <Badge className={envConfig.color}>{envConfig.label}</Badge>
    ) : (
      <Badge variant="gray">{env}</Badge>
    );
  };

  const filteredCredentials = credentials.filter(cred => 
    selectedEnvironment === 'all' || cred.environment === selectedEnvironment
  );

  const filteredFeatureFlags = featureFlags.filter(flag => 
    selectedEnvironment === 'all' || flag.environment === selectedEnvironment
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Configuration</h1>
          <p className="text-gray-600">Manage third-party credentials, feature flags, and platform settings</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌐 All Environments</SelectItem>
              {environments.map(env => (
                <SelectItem key={env.value} value={env.value}>
                  {env.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials" className="flex items-center space-x-2">
            <Key className="w-4 h-4" />
            <span>Credentials</span>
          </TabsTrigger>
          <TabsTrigger value="feature-flags" className="flex items-center space-x-2">
            <Flag className="w-4 h-4" />
            <span>Feature Flags</span>
          </TabsTrigger>
          <TabsTrigger value="throttling" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Rate Limiting</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </TabsTrigger>
        </TabsList>

        {/* Credentials Management */}
        <TabsContent value="credentials" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Third-Party Credentials</h3>
              <p className="text-sm text-gray-600">Secure management of API keys and external service credentials</p>
            </div>
            <Dialog open={isCredentialDialogOpen} onOpenChange={setIsCredentialDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Credential
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Credential</DialogTitle>
                  <DialogDescription>
                    Securely store API keys and credentials for third-party services
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCredentialSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="credName">Credential Name *</Label>
                      <Input
                        id="credName"
                        placeholder="e.g., Midtrans Production"
                        value={credentialForm.name}
                        onChange={(e) => setCredentialForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="provider">Provider *</Label>
                      <Select value={credentialForm.provider} onValueChange={(value) => setCredentialForm(prev => ({ ...prev, provider: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(provider => (
                            <SelectItem key={provider.value} value={provider.value}>
                              {provider.icon} {provider.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="apiKey">API Key *</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter API key"
                      value={credentialForm.apiKey}
                      onChange={(e) => setCredentialForm(prev => ({ ...prev, apiKey: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="secretKey">Secret Key (Optional)</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="Enter secret key if required"
                      value={credentialForm.secretKey}
                      onChange={(e) => setCredentialForm(prev => ({ ...prev, secretKey: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="environment">Environment *</Label>
                    <Select value={credentialForm.environment} onValueChange={(value) => setCredentialForm(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        {environments.map(env => (
                          <SelectItem key={env.value} value={env.value}>
                            {env.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose and usage of this credential"
                      rows={3}
                      value={credentialForm.description}
                      onChange={(e) => setCredentialForm(prev => ({ ...prev, description: e.target.value }))}
                      className="resize-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Shield className="w-4 h-4 mr-2" />
                      Store Credential
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsCredentialDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Credential</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Rotated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCredentials.map((credential) => (
                    <TableRow key={credential.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{credential.name}</div>
                          <div className="text-sm text-gray-600">{credential.description}</div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span className="font-mono">
                              {showApiKey[credential.id] ? credential.apiKeyPreview.replace(/•/g, 'X') : credential.apiKeyPreview}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(credential.id)}
                              className="ml-2 h-6 w-6 p-0"
                            >
                              {showApiKey[credential.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {providers.find(p => p.value === credential.provider)?.icon}
                          <span className="ml-2">{providers.find(p => p.value === credential.provider)?.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getEnvironmentBadge(credential.environment)}</TableCell>
                      <TableCell>{getStatusBadge(credential.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{credential.lastRotated}</div>
                        <div className="text-xs text-gray-500">
                          {credential.status === 'warning' && '⚠️ Rotation needed'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags Management */}
        <TabsContent value="feature-flags" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Feature Flags</h3>
              <p className="text-sm text-gray-600">Control feature rollouts and enable/disable functionality</p>
            </div>
            <Dialog open={isFeatureFlagDialogOpen} onOpenChange={setIsFeatureFlagDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Flag className="w-4 h-4 mr-2" />
                  Create Feature Flag
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Feature Flag</DialogTitle>
                  <DialogDescription>
                    Control feature visibility and rollout to specific user segments
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleFeatureFlagSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="flagName">Feature Flag Name *</Label>
                    <Input
                      id="flagName"
                      placeholder="e.g., advanced_analytics"
                      value={featureFlagForm.name}
                      onChange={(e) => setFeatureFlagForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-gray-500">Use lowercase with underscores (snake_case)</p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="flagDescription">Description *</Label>
                    <Textarea
                      id="flagDescription"
                      placeholder="Describe what this feature flag controls"
                      rows={3}
                      value={featureFlagForm.description}
                      onChange={(e) => setFeatureFlagForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="flagEnvironment">Environment *</Label>
                      <Select value={featureFlagForm.environment} onValueChange={(value) => setFeatureFlagForm(prev => ({ ...prev, environment: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          {environments.map(env => (
                            <SelectItem key={env.value} value={env.value}>
                              {env.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="rolloutPercentage">Rollout Percentage</Label>
                      <Input
                        id="rolloutPercentage"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
                        value={featureFlagForm.rolloutPercentage}
                        onChange={(e) => setFeatureFlagForm(prev => ({ ...prev, rolloutPercentage: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={featureFlagForm.enabled}
                      onCheckedChange={(checked) => setFeatureFlagForm(prev => ({ ...prev, enabled: checked }))}
                    />
                    <Label htmlFor="enabled">Enable Feature Flag</Label>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                      <Flag className="w-4 h-4 mr-2" />
                      Create Feature Flag
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsFeatureFlagDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {filteredFeatureFlags.map((flag) => (
              <Card key={flag.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {flag.name}
                        </span>
                        {getStatusBadge(flag.status)}
                        {getEnvironmentBadge(flag.environment)}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {flag.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Switch checked={flag.enabled} />
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Rollout</Label>
                      <div className="mt-1">
                        <div className="text-2xl font-bold">{flag.rolloutPercentage}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Affected Users</Label>
                      <div className="text-2xl font-bold mt-1">{flag.affectedUsers.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Created By</Label>
                      <div className="text-sm mt-1">{flag.createdBy}</div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Last Modified</Label>
                      <div className="text-sm mt-1">{new Date(flag.lastModified).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  {flag.targetSegments.length > 0 && (
                    <div className="mt-4">
                      <Label className="text-xs text-gray-500 uppercase tracking-wide">Target Segments</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {flag.targetSegments.map(segment => (
                          <Badge key={segment} variant="blue" className="text-xs">
                            {targetSegments.find(s => s.value === segment)?.label || segment}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rate Limiting & Throttling */}
        <TabsContent value="throttling" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Global Rate Limiting & Throttling</h3>
            <p className="text-sm text-gray-600">Configure rate limits to protect services from traffic spikes</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>API Rate Limits</span>
                </CardTitle>
                <CardDescription>
                  Global rate limiting rules for API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Requests per minute</Label>
                      <Input defaultValue="1000" type="number" />
                    </div>
                    <div>
                      <Label>Burst limit</Label>
                      <Input defaultValue="100" type="number" />
                    </div>
                    <div>
                      <Label>Concurrent connections</Label>
                      <Input defaultValue="50" type="number" />
                    </div>
                  </div>
                  <Button className="w-full">Update Rate Limits</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Service Throttling</span>
                </CardTitle>
                <CardDescription>
                  Configure throttling for different services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Current Limit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Email Service</TableCell>
                      <TableCell>500/hour</TableCell>
                      <TableCell><Badge variant="green">Healthy</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm">Configure</Button></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SMS Service</TableCell>
                      <TableCell>100/hour</TableCell>
                      <TableCell><Badge variant="yellow">Near Limit</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm">Configure</Button></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Payment Processing</TableCell>
                      <TableCell>1000/hour</TableCell>
                      <TableCell><Badge variant="green">Healthy</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="sm">Configure</Button></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Trail */}
        <TabsContent value="audit" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Configuration Audit Trail</h3>
            <p className="text-sm text-gray-600">Track all configuration changes and system modifications</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    action: 'Credential Updated',
                    resource: 'Midtrans Payment Gateway',
                    user: 'john.doe@company.com',
                    timestamp: '2024-01-25T14:30:00Z',
                    changes: 'API key rotated',
                    severity: 'medium'
                  },
                  {
                    id: 2,
                    action: 'Feature Flag Modified',
                    resource: 'advanced_analytics',
                    user: 'dev.team@company.com',
                    timestamp: '2024-01-25T13:15:00Z',
                    changes: 'Rollout increased to 75%',
                    severity: 'low'
                  },
                  {
                    id: 3,
                    action: 'Rate Limit Updated',
                    resource: 'API Gateway',
                    user: 'ops.team@company.com',
                    timestamp: '2024-01-25T12:00:00Z',
                    changes: 'Increased from 500 to 1000 req/min',
                    severity: 'high'
                  }
                ].map((log) => (
                  <div key={log.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      log.severity === 'high' ? 'bg-red-500' :
                      log.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{log.action}</span>
                        <Badge variant="gray" className="text-xs">{log.resource}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{log.changes}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        by {log.user} • {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <History className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformConfiguration;
