import React, { useState, useCallback } from 'react';
import {
  X,
  Lock,
  Users,
  Settings,
  Eye,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Key,
  Globe,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Hash,
  Shield,
  MessageSquare,
  FileText,
  Bot,
  Webhook,
  Workflow,
  CreditCard,
  Zap,
  UserCheck,
  Activity,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch
} from '@/components/ui';

const ViewPermissionDetailsDialog = ({ isOpen, onClose, permission, onEdit, onClone, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockRoles = [
    { id: 1, name: 'Super Administrator', code: 'super_admin', users_count: 2, assigned_at: '2024-01-01' },
    { id: 2, name: 'System Administrator', code: 'system_admin', users_count: 5, assigned_at: '2024-01-15' },
    { id: 3, name: 'Organization Administrator', code: 'org_admin', users_count: 8, assigned_at: '2024-01-20' }
  ];

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Super Administrator', status: 'active', last_used: '2024-01-25 14:30:00' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'System Administrator', status: 'active', last_used: '2024-01-24 09:15:00' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Organization Administrator', status: 'inactive', last_used: '2024-01-20 16:45:00' }
  ];

  const mockActivity = [
    { id: 1, action: 'Permission created', user: 'System', timestamp: '2024-01-01 10:00:00', details: 'Permission created via seeder', ip: '192.168.1.1' },
    { id: 2, action: 'Role assigned', user: 'Admin User', timestamp: '2024-01-15 14:30:00', details: 'Assigned to Super Administrator role', ip: '192.168.1.100' },
    { id: 3, action: 'Permission used', user: 'John Doe', timestamp: '2024-01-25 14:30:00', details: 'Accessed user management panel', ip: '192.168.1.50' },
    { id: 4, action: 'Permission revoked', user: 'Admin User', timestamp: '2024-01-20 11:20:00', details: 'Removed from Organization Administrator role', ip: '192.168.1.100' }
  ];

  const mockUsage = [
    { date: '2024-01-25', count: 15, unique_users: 8, avg_duration: '2m 30s' },
    { date: '2024-01-24', count: 12, unique_users: 6, avg_duration: '1m 45s' },
    { date: '2024-01-23', count: 18, unique_users: 10, avg_duration: '3m 15s' },
    { date: '2024-01-22', count: 9, unique_users: 5, avg_duration: '1m 20s' },
    { date: '2024-01-21', count: 14, unique_users: 7, avg_duration: '2m 10s' }
  ];

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleEdit = useCallback(() => {
    onEdit(permission);
    onClose();
  }, [onEdit, permission, onClose]);

  const handleClone = useCallback(() => {
    onClone(permission);
    onClose();
  }, [onClone, permission, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(permission);
    onClose();
  }, [onDelete, permission, onClose]);

  if (!isOpen || !permission) return null;

  const getScopeInfo = (scope) => {
    switch (scope) {
      case 'global':
        return { icon: Globe, color: 'bg-purple-100 text-purple-800', label: 'Global' };
      case 'organization':
        return { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Organization' };
      case 'department':
        return { icon: Users, color: 'bg-green-100 text-green-800', label: 'Department' };
      case 'team':
        return { icon: UserCheck, color: 'bg-yellow-100 text-yellow-800', label: 'Team' };
      case 'personal':
        return { icon: Users, color: 'bg-gray-100 text-gray-800', label: 'Personal' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: scope };
    }
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'user_management':
        return { icon: Users, color: 'bg-blue-100 text-blue-800', label: 'User Management' };
      case 'role_management':
        return { icon: Shield, color: 'bg-red-100 text-red-800', label: 'Role Management' };
      case 'chat_management':
        return { icon: MessageSquare, color: 'bg-green-100 text-green-800', label: 'Chat Management' };
      case 'knowledge_management':
        return { icon: FileText, color: 'bg-purple-100 text-purple-800', label: 'Knowledge Management' };
      case 'analytics':
        return { icon: BarChart3, color: 'bg-orange-100 text-orange-800', label: 'Analytics' };
      case 'bot_management':
        return { icon: Bot, color: 'bg-indigo-100 text-indigo-800', label: 'Bot Management' };
      case 'api_management':
        return { icon: Webhook, color: 'bg-pink-100 text-pink-800', label: 'API Management' };
      case 'workflow_management':
        return { icon: Workflow, color: 'bg-teal-100 text-teal-800', label: 'Workflow Management' };
      case 'billing':
        return { icon: CreditCard, color: 'bg-emerald-100 text-emerald-800', label: 'Billing' };
      case 'automation':
        return { icon: Zap, color: 'bg-amber-100 text-amber-800', label: 'Automation' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: category };
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ScopeIcon = getScopeInfo(permission.scope).icon;
  const CategoryIcon = getCategoryInfo(permission.category).icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <CategoryIcon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{permission.name}</h2>
              <p className="text-sm text-gray-600 font-mono">{permission.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!permission.is_system_permission && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClone}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Clone
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Permission Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Permission Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Permission Name</label>
                          <p className="text-lg font-semibold text-gray-900">{permission.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Permission Code</label>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{permission.code}</code>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Description</label>
                          <p className="text-base text-gray-700">{permission.description}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Scope</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getScopeInfo(permission.scope).color}>
                              <ScopeIcon className="w-3 h-3 mr-1" />
                              {getScopeInfo(permission.scope).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Category</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getCategoryInfo(permission.category).color}>
                              <CategoryIcon className="w-3 h-3 mr-1" />
                              {getCategoryInfo(permission.category).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Risk Level</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${getRiskLevelColor(permission.risk_level)} border`}>
                              {permission.risk_level.charAt(0).toUpperCase() + permission.risk_level.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="flex items-center gap-2 mt-1">
                            {permission.is_active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">System Permission: {permission.is_system_permission ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Dangerous: {permission.is_dangerous ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Requires Approval: {permission.metadata?.requires_approval ? 'Yes' : 'No'}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Audit Required: {permission.metadata?.audit_required ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Created via: {permission.metadata?.created_via || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">ID: {permission.id}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Usage Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Usage Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{mockRoles.length}</div>
                        <div className="text-sm text-gray-500">Assigned Roles</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{mockUsers.length}</div>
                        <div className="text-sm text-gray-500">Active Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {mockActivity.filter(a => a.action === 'Permission used').length}
                        </div>
                        <div className="text-sm text-gray-500">Today's Usage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {permission.metadata?.roles_count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Total Roles</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Roles Tab */}
              <TabsContent value="roles" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Assigned Roles
                    </CardTitle>
                    <CardDescription>
                      {mockRoles.length} roles currently have this permission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockRoles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Shield className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{role.name}</h4>
                              <p className="text-sm text-gray-500 font-mono">{role.code}</p>
                              <p className="text-xs text-gray-400">Assigned: {role.assigned_at}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{role.users_count}</div>
                            <div className="text-xs text-gray-500">Users</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Users with Permission
                    </CardTitle>
                    <CardDescription>
                      {mockUsers.length} users currently have access to this permission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <p className="text-xs text-gray-400">Role: {user.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                            <p className="text-xs text-gray-400 mt-1">Last used: {user.last_used}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Permission Activity
                    </CardTitle>
                    <CardDescription>
                      Recent activity and changes related to this permission
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{activity.action}</h4>
                            <p className="text-sm text-gray-600">{activity.details}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">by {activity.user}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">{activity.timestamp}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">IP: {activity.ip}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Usage Analytics
                    </CardTitle>
                    <CardDescription>
                      Permission usage patterns and statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">68</div>
                          <div className="text-sm text-gray-500">Total Usage (7 days)</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">12</div>
                          <div className="text-sm text-gray-500">Unique Users</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">2m 15s</div>
                          <div className="text-sm text-gray-500">Avg Duration</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Daily Usage (Last 5 Days)</h4>
                        <div className="space-y-2">
                          {mockUsage.map((usage, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm text-gray-600">{usage.date}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">{usage.count} uses</span>
                                <span className="text-sm text-gray-600">{usage.unique_users} users</span>
                                <span className="text-sm text-gray-600">{usage.avg_duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPermissionDetailsDialog;
