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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui';
import { 
  Settings,
  Zap,
  Shield,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Key,
  Database,
  Code,
  Users,
  Search,
  Filter,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Globe
} from 'lucide-react';

const Platform = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample platform settings
  const [platformSettings, setPlatformSettings] = useState({
    emailNotifications: {
      enabled: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      username: 'noreply@platform.com',
      fromEmail: 'Platform Team <noreply@platform.com>'
    },
    paymentGateway: {
      midtransServerKey: 'SB-Mid-server-***',
      midtransClientKey: 'SB-Mid-client-***',
      enabled: true
    },
    featureFlags: {
      enableN8NIntegration: true,
      enableAdvancedAnalytics: true,
      enableWhiteLabel: false,
      enableAPIv2: true
    }
  });

  // Sample N8N settings
  const [n8nSettings, setN8nSettings] = useState({
    connectionUrl: 'https://n8n.platform.com',
    apiKey: 'n8n_api_***',
    connected: true,
    lastSync: '2024-03-20 14:30:25'
  });

  // Sample workflow templates
  const [workflowTemplates] = useState([
    {
      id: 'template-001',
      name: 'Customer Onboarding',
      description: 'Automated customer welcome sequence with email and task creation',
      category: 'Customer Management',
      usageCount: 45,
      createdAt: '2024-02-15',
      lastModified: '2024-03-10'
    },
    {
      id: 'template-002',
      name: 'Lead Qualification',
      description: 'Automated lead scoring and routing based on customer responses',
      category: 'Sales',
      usageCount: 32,
      createdAt: '2024-01-20',
      lastModified: '2024-03-05'
    },
    {
      id: 'template-003',
      name: 'Support Escalation',
      description: 'Automatic ticket escalation based on priority and response time',
      category: 'Support',
      usageCount: 28,
      createdAt: '2024-02-01',
      lastModified: '2024-02-28'
    }
  ]);

  // Sample audit logs
  const [auditLogs] = useState([
    {
      id: 'audit-001',
      timestamp: '2024-03-20 14:30:25',
      user: 'Super Admin',
      organization: 'ABC Corporation',
      action: 'user_invite',
      resource: 'sari.dewi@abccorp.com',
      details: 'Invited new user with agent role',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'audit-002',
      timestamp: '2024-03-20 13:45:12',
      user: 'Ahmad Rahman',
      organization: 'ABC Corporation',
      action: 'subscription_upgrade',
      resource: 'Enterprise Plan',
      details: 'Upgraded from Professional to Enterprise',
      ipAddress: '192.168.1.101'
    },
    {
      id: 'audit-003',
      timestamp: '2024-03-20 12:15:45',
      user: 'Super Admin',
      organization: 'TechStart Inc',
      action: 'organization_suspend',
      resource: 'org-002',
      details: 'Suspended organization due to payment failure',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'audit-004',
      timestamp: '2024-03-20 11:30:18',
      user: 'System',
      organization: 'Global Solutions',
      action: 'workflow_execute',
      resource: 'Customer Onboarding',
      details: 'N8N workflow executed successfully',
      ipAddress: 'System'
    }
  ]);

  // Sample platform admins
  const [platformAdmins] = useState([
    {
      id: 'admin-001',
      name: 'John Smith',
      email: 'john.smith@platform.com',
      role: 'Super Admin',
      createdAt: '2023-01-15',
      lastLogin: '2024-03-20 14:30:25',
      permissions: ['*']
    },
    {
      id: 'admin-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@platform.com',
      role: 'Platform Admin',
      createdAt: '2023-06-10',
      lastLogin: '2024-03-19 16:45:12',
      permissions: ['platform_settings', 'user_management', 'view_audit_logs']
    }
  ]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'user_invite':
      case 'user_create':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'subscription_upgrade':
      case 'subscription_downgrade':
        return <Database className="w-4 h-4 text-green-500" />;
      case 'organization_suspend':
      case 'organization_activate':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'workflow_execute':
        return <Zap className="w-4 h-4 text-purple-500" />;
      default:
        return <Eye className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action) => {
    const colors = {
      'user_invite': 'bg-blue-100 text-blue-700',
      'user_create': 'bg-blue-100 text-blue-700',
      'subscription_upgrade': 'bg-green-100 text-green-700',
      'subscription_downgrade': 'bg-orange-100 text-orange-700',
      'organization_suspend': 'bg-red-100 text-red-700',
      'organization_activate': 'bg-green-100 text-green-700',
      'workflow_execute': 'bg-purple-100 text-purple-700'
    };

    return (
      <Badge className={colors[action] || 'bg-gray-100 text-gray-700'}>
        {action.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredAuditLogs = auditLogs.filter(log =>
    log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Management</h1>
        <p className="text-muted-foreground">Platform configuration, N8N management, and security settings</p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Platform Settings</TabsTrigger>
          <TabsTrigger value="n8n">N8N Service</TabsTrigger>
          <TabsTrigger value="security">Security & Audit</TabsTrigger>
        </TabsList>

        {/* Platform Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Email Configuration
                </CardTitle>
                <CardDescription>SMTP settings for platform notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                  <Switch 
                    id="email-enabled"
                    checked={platformSettings.emailNotifications.enabled}
                    onCheckedChange={(checked) => 
                      setPlatformSettings(prev => ({
                        ...prev,
                        emailNotifications: { ...prev.emailNotifications, enabled: checked }
                      }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input
                    id="smtp-host"
                    value={platformSettings.emailNotifications.smtpHost}
                    onChange={(e) => 
                      setPlatformSettings(prev => ({
                        ...prev,
                        emailNotifications: { ...prev.emailNotifications, smtpHost: e.target.value }
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      value={platformSettings.emailNotifications.smtpPort}
                      onChange={(e) => 
                        setPlatformSettings(prev => ({
                          ...prev,
                          emailNotifications: { ...prev.emailNotifications, smtpPort: parseInt(e.target.value) }
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-username">Username</Label>
                    <Input
                      id="smtp-username"
                      value={platformSettings.emailNotifications.username}
                      onChange={(e) => 
                        setPlatformSettings(prev => ({
                          ...prev,
                          emailNotifications: { ...prev.emailNotifications, username: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>

                <Button className="w-full">
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>

            {/* Payment Gateway */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Payment Gateway
                </CardTitle>
                <CardDescription>Midtrans API configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-enabled">Enable Payments</Label>
                  <Switch 
                    id="payment-enabled"
                    checked={platformSettings.paymentGateway.enabled}
                    onCheckedChange={(checked) => 
                      setPlatformSettings(prev => ({
                        ...prev,
                        paymentGateway: { ...prev.paymentGateway, enabled: checked }
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server-key">Server Key</Label>
                  <Input
                    id="server-key"
                    type="password"
                    value={platformSettings.paymentGateway.midtransServerKey}
                    onChange={(e) => 
                      setPlatformSettings(prev => ({
                        ...prev,
                        paymentGateway: { ...prev.paymentGateway, midtransServerKey: e.target.value }
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-key">Client Key</Label>
                  <Input
                    id="client-key"
                    type="password"
                    value={platformSettings.paymentGateway.midtransClientKey}
                    onChange={(e) => 
                      setPlatformSettings(prev => ({
                        ...prev,
                        paymentGateway: { ...prev.paymentGateway, midtransClientKey: e.target.value }
                      }))
                    }
                  />
                </div>

                <Button className="w-full">
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Feature Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>Control platform-wide feature availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(platformSettings.featureFlags).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor={key} className="font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {key === 'enableN8NIntegration' && 'Allow organizations to use N8N workflows'}
                        {key === 'enableAdvancedAnalytics' && 'Enable advanced analytics features'}
                        {key === 'enableWhiteLabel' && 'Allow custom branding for Enterprise plans'}
                        {key === 'enableAPIv2' && 'Enable new API v2 endpoints'}
                      </p>
                    </div>
                    <Switch 
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setPlatformSettings(prev => ({
                          ...prev,
                          featureFlags: { ...prev.featureFlags, [key]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* N8N Service Tab */}
        <TabsContent value="n8n" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  N8N Connection
                </CardTitle>
                <CardDescription>Configure N8N instance connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  {n8nSettings.connected ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={n8nSettings.connected ? 'text-green-700' : 'text-red-700'}>
                    {n8nSettings.connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="n8n-url">N8N Instance URL</Label>
                  <Input
                    id="n8n-url"
                    value={n8nSettings.connectionUrl}
                    onChange={(e) => setN8nSettings(prev => ({ ...prev, connectionUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="n8n-api-key">API Key</Label>
                  <Input
                    id="n8n-api-key"
                    type="password"
                    value={n8nSettings.apiKey}
                    onChange={(e) => setN8nSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>

                {n8nSettings.connected && (
                  <div className="text-sm text-muted-foreground">
                    Last sync: {n8nSettings.lastSync}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="flex-1">Test Connection</Button>
                  <Button variant="outline" className="flex-1">Save Settings</Button>
                </div>
              </CardContent>
            </Card>

            {/* N8N Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>N8N Statistics</CardTitle>
                <CardDescription>Platform-wide workflow usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">156</div>
                    <div className="text-sm text-muted-foreground">Active Workflows</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">2,847</div>
                    <div className="text-sm text-muted-foreground">Executions Today</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">99.7%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-muted-foreground">Failed Today</div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  View N8N Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Templates */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Workflow Templates</CardTitle>
                  <CardDescription>Manage reusable workflow templates for all organizations</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>{template.usageCount} orgs</TableCell>
                      <TableCell className="text-muted-foreground">{template.lastModified}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Template
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Usage
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Template
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & Audit Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Audit Trail */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Audit Trail
                  </CardTitle>
                  <CardDescription>Complete activity log across all organizations</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search audit logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Audit logs are read-only and show activities across all organizations. Data retention: 1 year.
                </AlertDescription>
              </Alert>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.user === 'System' && <Database className="w-4 h-4 text-blue-500" />}
                          {log.user === 'Super Admin' && <Shield className="w-4 h-4 text-red-500" />}
                          <span className={log.user === 'System' ? 'text-blue-600 font-medium' : ''}>{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.organization}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          {getActionBadge(log.action)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.resource}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Platform Admins */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Platform Administrators</CardTitle>
                  <CardDescription>Manage super admin and platform admin accounts</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {platformAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant={admin.role === 'Super Admin' ? 'default' : 'secondary'}>
                          {admin.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{admin.createdAt}</TableCell>
                      <TableCell className="text-muted-foreground">{admin.lastLogin}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            {admin.role !== 'Super Admin' && (
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Platform;
