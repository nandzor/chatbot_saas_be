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
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { 
  Shield, 
  Lock, 
  Users, 
  Key,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Monitor,
  FileText,
  UserPlus,
  Settings,
  Activity,
  History,
  RefreshCw,
  Database,
  Server,
  Wifi,
  Calendar,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';

const SecurityCompliance = () => {
  const [activeTab, setActiveTab] = useState('audit-trail');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });

  // Mock data untuk audit logs
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-25T15:30:00Z',
      user: 'john.doe@company.com',
      action: 'credential_updated',
      resource: 'Midtrans Payment Gateway',
      resourceType: 'credential',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'Jakarta, Indonesia',
      severity: 'medium',
      status: 'success',
      details: {
        changes: ['API key rotated', 'Environment changed from staging to production'],
        previousValue: 'SB-Mid-••••••••',
        newValue: 'VT-Mid-••••••••'
      }
    },
    {
      id: 2,
      timestamp: '2024-01-25T14:45:00Z',
      user: 'admin@company.com',
      action: 'user_login',
      resource: 'Super Admin Panel',
      resourceType: 'system',
      ipAddress: '203.142.45.123',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'Singapore',
      severity: 'low',
      status: 'success',
      details: {
        loginMethod: '2FA',
        sessionDuration: '8 hours'
      }
    },
    {
      id: 3,
      timestamp: '2024-01-25T13:20:00Z',
      user: 'ops.team@company.com',
      action: 'feature_flag_modified',
      resource: 'advanced_analytics',
      resourceType: 'feature_flag',
      ipAddress: '10.0.0.15',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      location: 'Internal Network',
      severity: 'medium',
      status: 'success',
      details: {
        changes: ['Rollout percentage increased from 50% to 75%'],
        targetSegments: ['enterprise', 'beta']
      }
    },
    {
      id: 4,
      timestamp: '2024-01-25T12:30:00Z',
      user: 'unknown@external.com',
      action: 'login_attempt',
      resource: 'Super Admin Panel',
      resourceType: 'system',
      ipAddress: '45.123.67.89',
      userAgent: 'curl/7.68.0',
      location: 'Unknown',
      severity: 'high',
      status: 'failed',
      details: {
        reason: 'Invalid credentials',
        attempts: 5
      }
    },
    {
      id: 5,
      timestamp: '2024-01-25T11:15:00Z',
      user: 'finance@company.com',
      action: 'data_export',
      resource: 'Payment Transactions',
      resourceType: 'data',
      ipAddress: '192.168.1.205',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Jakarta, Indonesia',
      severity: 'high',
      status: 'success',
      details: {
        recordCount: 1523,
        dateRange: '2024-01-01 to 2024-01-24',
        format: 'CSV'
      }
    }
  ]);

  // Mock data untuk custom roles
  const [customRoles, setCustomRoles] = useState([
    {
      id: 1,
      name: 'Platform Support Tier 2',
      description: 'Advanced platform support with limited administrative access',
      permissions: [
        'view_all_transactions',
        'view_system_health',
        'manage_feature_flags',
        'view_audit_logs'
      ],
      userCount: 3,
      createdBy: 'admin@company.com',
      createdAt: '2024-01-20T10:00:00Z',
      lastModified: '2024-01-23T14:30:00Z'
    },
    {
      id: 2,
      name: 'Finance Admin',
      description: 'Financial operations and reporting access',
      permissions: [
        'view_all_transactions',
        'issue_refunds',
        'export_financial_data',
        'view_revenue_reports'
      ],
      userCount: 2,
      createdBy: 'admin@company.com',
      createdAt: '2024-01-15T09:00:00Z',
      lastModified: '2024-01-15T09:00:00Z'
    },
    {
      id: 3,
      name: 'Customer Success Manager',
      description: 'Client relationship and success management',
      permissions: [
        'view_client_data',
        'manage_client_communications',
        'access_client_analytics',
        'login_as_admin'
      ],
      userCount: 5,
      createdBy: 'admin@company.com',
      createdAt: '2024-01-10T11:00:00Z',
      lastModified: '2024-01-22T16:00:00Z'
    }
  ]);

  // Mock data untuk active sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 1,
      user: 'john.doe@company.com',
      role: 'Super Admin',
      ipAddress: '192.168.1.100',
      location: 'Jakarta, Indonesia',
      device: 'Windows 10 - Chrome',
      loginTime: '2024-01-25T08:00:00Z',
      lastActivity: '2024-01-25T15:30:00Z',
      status: 'active',
      sessionId: 'sess_abc123def456'
    },
    {
      id: 2,
      user: 'jane.smith@company.com',
      role: 'Finance Admin',
      ipAddress: '192.168.1.150',
      location: 'Jakarta, Indonesia',
      device: 'macOS - Safari',
      loginTime: '2024-01-25T09:30:00Z',
      lastActivity: '2024-01-25T15:25:00Z',
      status: 'active',
      sessionId: 'sess_xyz789ghi012'
    },
    {
      id: 3,
      user: 'mike.wilson@company.com',
      role: 'Platform Support Tier 2',
      ipAddress: '203.142.45.123',
      location: 'Singapore',
      device: 'Ubuntu - Firefox',
      loginTime: '2024-01-25T07:45:00Z',
      lastActivity: '2024-01-25T14:20:00Z',
      status: 'idle',
      sessionId: 'sess_mno345pqr678'
    }
  ]);

  // Mock data untuk IP whitelist
  const [ipWhitelist, setIpWhitelist] = useState([
    {
      id: 1,
      ipAddress: '192.168.1.0/24',
      description: 'Main Office Network',
      addedBy: 'admin@company.com',
      addedAt: '2024-01-01T00:00:00Z',
      lastUsed: '2024-01-25T15:30:00Z',
      status: 'active'
    },
    {
      id: 2,
      ipAddress: '203.142.45.123',
      description: 'Singapore Office VPN',
      addedBy: 'admin@company.com',
      addedAt: '2024-01-10T10:00:00Z',
      lastUsed: '2024-01-25T14:20:00Z',
      status: 'active'
    },
    {
      id: 3,
      ipAddress: '10.0.0.0/16',
      description: 'Internal Development Network',
      addedBy: 'dev.team@company.com',
      addedAt: '2024-01-15T12:00:00Z',
      lastUsed: '2024-01-24T18:45:00Z',
      status: 'active'
    }
  ]);

  // Available permissions
  const availablePermissions = [
    { id: 'view_all_transactions', name: 'View All Transactions', category: 'Financial' },
    { id: 'issue_refunds', name: 'Issue Refunds', category: 'Financial' },
    { id: 'export_financial_data', name: 'Export Financial Data', category: 'Financial' },
    { id: 'view_revenue_reports', name: 'View Revenue Reports', category: 'Financial' },
    { id: 'login_as_admin', name: 'Login as Organization Admin', category: 'System' },
    { id: 'manage_feature_flags', name: 'Manage Feature Flags', category: 'Platform' },
    { id: 'view_system_health', name: 'View System Health', category: 'Platform' },
    { id: 'manage_credentials', name: 'Manage API Credentials', category: 'Platform' },
    { id: 'view_audit_logs', name: 'View Audit Logs', category: 'Security' },
    { id: 'manage_users', name: 'Manage User Accounts', category: 'System' },
    { id: 'view_client_data', name: 'View Client Data', category: 'Client' },
    { id: 'manage_client_communications', name: 'Manage Client Communications', category: 'Client' },
    { id: 'access_client_analytics', name: 'Access Client Analytics', category: 'Client' }
  ];

  const getStatusBadge = (status) => {
    const config = {
      success: { color: 'green', label: 'Success' },
      failed: { color: 'red', label: 'Failed' },
      active: { color: 'green', label: 'Active' },
      idle: { color: 'yellow', label: 'Idle' },
      blocked: { color: 'red', label: 'Blocked' }
    };
    const statusConfig = config[status] || config.active;
    return <Badge variant={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const getSeverityBadge = (severity) => {
    const config = {
      low: { color: 'green', label: 'Low' },
      medium: { color: 'yellow', label: 'Medium' },
      high: { color: 'red', label: 'High' },
      critical: { color: 'red', label: 'Critical' }
    };
    const severityConfig = config[severity] || config.low;
    return <Badge variant={severityConfig.color}>{severityConfig.label}</Badge>;
  };

  const getActionIcon = (action) => {
    const icons = {
      login_attempt: Monitor,
      user_login: Users,
      credential_updated: Key,
      feature_flag_modified: Settings,
      data_export: Download,
      user_created: UserPlus,
      user_deleted: Trash2,
      system_config: Settings
    };
    const Icon = icons[action] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesAction && matchesUser && matchesSeverity;
  });

  const handleRoleSubmit = (e) => {
    e.preventDefault();
    const newRole = {
      id: Date.now(),
      ...roleForm,
      userCount: 0,
      createdBy: 'current.user@company.com',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setCustomRoles([newRole, ...customRoles]);
    setRoleForm({ name: '', description: '', permissions: [] });
    setIsRoleDialogOpen(false);
  };

  const terminateSession = (sessionId) => {
    setActiveSessions(sessions => sessions.filter(s => s.sessionId !== sessionId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security & Compliance</h1>
          <p className="text-gray-600">Audit trails, access management, and security monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Compliance Report
          </Button>
        </div>
      </div>

      {/* Security Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="audit-trail" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </TabsTrigger>
          <TabsTrigger value="rbac" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>RBAC</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Monitor className="w-4 h-4" />
            <span>Active Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="access-control" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Access Control</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Compliance</span>
          </TabsTrigger>
        </TabsList>

        {/* Global Audit Trail */}
        <TabsContent value="audit-trail" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="filterAction">Action</Label>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="login_attempt">Login Attempt</SelectItem>
                      <SelectItem value="user_login">User Login</SelectItem>
                      <SelectItem value="credential_updated">Credential Updated</SelectItem>
                      <SelectItem value="feature_flag_modified">Feature Flag Modified</SelectItem>
                      <SelectItem value="data_export">Data Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterUser">User</Label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="All users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admin@company.com">admin@company.com</SelectItem>
                      <SelectItem value="john.doe@company.com">john.doe@company.com</SelectItem>
                      <SelectItem value="ops.team@company.com">ops.team@company.com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filterSeverity">Severity</Label>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="90d">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs ({filteredAuditLogs.length} entries)</CardTitle>
              <CardDescription>Comprehensive system activity tracking</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-sm">{new Date(log.timestamp).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.user}</div>
                        <div className="text-xs text-gray-500">{log.ipAddress}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm">{log.action.replace(/_/g, ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.resource}</div>
                        <div className="text-xs text-gray-500">{log.resourceType}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{log.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Audit Log Details</DialogTitle>
                              <DialogDescription>
                                {log.action.replace(/_/g, ' ')} • {new Date(log.timestamp).toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-xs text-gray-500 uppercase">User</Label>
                                  <div className="text-sm">{log.user}</div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500 uppercase">IP Address</Label>
                                  <div className="text-sm">{log.ipAddress}</div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500 uppercase">Location</Label>
                                  <div className="text-sm">{log.location}</div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-500 uppercase">User Agent</Label>
                                  <div className="text-sm truncate">{log.userAgent}</div>
                                </div>
                              </div>
                              {log.details && (
                                <div>
                                  <Label className="text-xs text-gray-500 uppercase">Details</Label>
                                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <pre className="text-sm whitespace-pre-wrap">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RBAC Management */}
        <TabsContent value="rbac" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Role-Based Access Control</h3>
              <p className="text-sm text-gray-600">Manage custom roles and granular permissions</p>
            </div>
            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Custom Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific permissions following least privilege principle
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRoleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="roleName">Role Name *</Label>
                      <Input
                        id="roleName"
                        placeholder="e.g., Platform Support Tier 3"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="roleDescription">Description *</Label>
                      <Input
                        id="roleDescription"
                        placeholder="Brief description of the role"
                        value={roleForm.description}
                        onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(
                        availablePermissions.reduce((acc, perm) => {
                          if (!acc[perm.category]) acc[perm.category] = [];
                          acc[perm.category].push(perm);
                          return acc;
                        }, {})
                      ).map(([category, permissions]) => (
                        <div key={category}>
                          <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={roleForm.permissions.includes(permission.id)}
                                  onChange={(checked) => {
                                    if (checked) {
                                      setRoleForm(prev => ({
                                        ...prev,
                                        permissions: [...prev.permissions, permission.id]
                                      }));
                                    } else {
                                      setRoleForm(prev => ({
                                        ...prev,
                                        permissions: prev.permissions.filter(p => p !== permission.id)
                                      }));
                                    }
                                  }}
                                />
                                <Label className="text-sm">{permission.name}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <Button type="submit" className="flex-1">
                      <Shield className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {customRoles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{role.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {role.description} • {role.userCount} users assigned
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Permissions ({role.permissions.length})</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {role.permissions.map(permissionId => {
                          const permission = availablePermissions.find(p => p.id === permissionId);
                          return permission ? (
                            <Badge key={permissionId} variant="blue" className="text-xs">
                              {permission.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span>Created by: {role.createdBy}</span>
                      </div>
                      <div>
                        <span>Last modified: {new Date(role.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Active Admin Sessions</h3>
              <p className="text-sm text-gray-600">Monitor and manage active user sessions</p>
            </div>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Sessions
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="font-medium">{session.user}</div>
                        <div className="text-xs text-gray-500">{session.ipAddress}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="blue">{session.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="text-sm">{session.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{session.device}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(session.loginTime).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(session.lastActivity).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => terminateSession(session.sessionId)}
                            className="text-red-600"
                          >
                            <StopCircle className="w-4 h-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Session Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about the user session
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-xs text-gray-500 uppercase">Session ID</Label>
                                    <div className="text-sm font-mono">{session.sessionId}</div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-500 uppercase">Duration</Label>
                                    <div className="text-sm">
                                      {Math.floor((new Date(session.lastActivity) - new Date(session.loginTime)) / (1000 * 60 * 60))} hours
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control */}
        <TabsContent value="access-control" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Access Control Management</h3>
            <p className="text-sm text-gray-600">IP whitelisting and security access policies</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>IP Whitelist</CardTitle>
                  <CardDescription>Manage allowed IP addresses for admin panel access</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add IP Address
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>IP Address/Range</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ipWhitelist.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell>
                        <span className="font-mono text-sm">{ip.ipAddress}</span>
                      </TableCell>
                      <TableCell>{ip.description}</TableCell>
                      <TableCell>{ip.addedBy}</TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(ip.addedAt).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(ip.lastUsed).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ip.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
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

          {/* Security Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Security Policies</CardTitle>
              <CardDescription>Configure global security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Require 2FA for all admin accounts</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Session Timeout</Label>
                        <p className="text-sm text-gray-600">Auto-logout inactive sessions</p>
                      </div>
                      <Select defaultValue="8h">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="4h">4 hours</SelectItem>
                          <SelectItem value="8h">8 hours</SelectItem>
                          <SelectItem value="24h">24 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Failed Login Lockout</Label>
                        <p className="text-sm text-gray-600">Lock accounts after failed attempts</p>
                      </div>
                      <Input defaultValue="5" type="number" className="w-20" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">IP Whitelisting</Label>
                        <p className="text-sm text-gray-600">Restrict access to whitelisted IPs</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Audit Log Retention</Label>
                        <p className="text-sm text-gray-600">How long to keep audit logs</p>
                      </div>
                      <Select defaultValue="1y">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3m">3 months</SelectItem>
                          <SelectItem value="6m">6 months</SelectItem>
                          <SelectItem value="1y">1 year</SelectItem>
                          <SelectItem value="2y">2 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Alert on suspicious activities</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <Button className="w-full">Update Security Policies</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tools */}
        <TabsContent value="compliance" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Data Privacy & Compliance</h3>
            <p className="text-sm text-gray-600">Tools for GDPR compliance and data management</p>
          </div>

          {/* Data Retention Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policies</CardTitle>
              <CardDescription>Automated data cleanup and retention management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>System Logs</Label>
                    <div className="flex items-center space-x-2">
                      <Input defaultValue="180" type="number" />
                      <span className="text-sm text-gray-500">days</span>
                    </div>
                  </div>
                  <div>
                    <Label>Audit Logs</Label>
                    <div className="flex items-center space-x-2">
                      <Input defaultValue="365" type="number" />
                      <span className="text-sm text-gray-500">days</span>
                    </div>
                  </div>
                  <div>
                    <Label>User Activity</Label>
                    <div className="flex items-center space-x-2">
                      <Input defaultValue="90" type="number" />
                      <span className="text-sm text-gray-500">days</span>
                    </div>
                  </div>
                </div>
                <Button>Update Retention Policies</Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Deletion Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Data Deletion Requests</CardTitle>
              <CardDescription>Process customer data deletion requests (GDPR Article 17)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input placeholder="Enter user email or ID" className="flex-1" />
                  <Button variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Delete user@example.com data</div>
                        <div className="text-sm text-gray-600">Requested on 2024-01-25</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="yellow">Pending</Badge>
                        <Button size="sm">Process</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generate compliance and security reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="w-6 h-6 mb-2" />
                  <span>Security Audit Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Shield className="w-6 h-6 mb-2" />
                  <span>Access Control Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Database className="w-6 h-6 mb-2" />
                  <span>Data Processing Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="w-6 h-6 mb-2" />
                  <span>User Activity Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityCompliance;
