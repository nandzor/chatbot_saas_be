import React, { useState, useCallback } from 'react';
import {
  X,
  Users,
  Edit,
  Copy,
  Trash2,
  Mail,
  Phone,
  Building2,
  MapPin,
  Clock,
  Shield,
  Key,
  Settings,
  Eye,
  Globe,
  UserCheck,
  Calendar,
  Hash,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  BarChart3,
  Shield as ShieldIcon,
  MessageSquare,
  FileText,
  Bot,
  Webhook,
  Workflow,
  CreditCard,
  Zap,
  UserCheck as UserCheckIcon,
  Database,
  AlertCircle
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
  TabsTrigger
} from '@/components/ui';

const ViewUserDetailsDialog = ({ isOpen, onClose, user, onEdit, onClone, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockPermissions = [
    { id: 1, name: 'User Management', code: 'users.manage', category: 'user_management', risk_level: 'high', is_active: true },
    { id: 2, name: 'Role Management', code: 'roles.manage', category: 'role_management', risk_level: 'critical', is_active: true },
    { id: 3, name: 'System Administration', code: 'system.admin', category: 'system_management', risk_level: 'critical', is_active: true },
    { id: 4, name: 'Dashboard Access', code: 'dashboard.view', category: 'general', risk_level: 'low', is_active: true }
  ];

  const mockActivity = [
    { id: 1, action: 'User logged in', timestamp: '2024-01-25 14:30:00', ip: '192.168.1.50', user_agent: 'Chrome 120.0.0.0', location: 'San Francisco, CA' },
    { id: 2, action: 'Password changed', timestamp: '2024-01-24 10:15:00', ip: '192.168.1.50', user_agent: 'Chrome 120.0.0.0', location: 'San Francisco, CA' },
    { id: 3, action: 'Role updated', timestamp: '2024-01-20 16:45:00', ip: '192.168.1.100', user_agent: 'Admin Panel', location: 'System' },
    { id: 4, action: '2FA enabled', timestamp: '2024-01-18 09:30:00', ip: '192.168.1.50', user_agent: 'Chrome 120.0.0.0', location: 'San Francisco, CA' },
    { id: 5, action: 'Profile updated', timestamp: '2024-01-15 14:20:00', ip: '192.168.1.50', user_agent: 'Chrome 120.0.0.0', location: 'San Francisco, CA' }
  ];

  const mockSessions = [
    { id: 1, device: 'Chrome on Windows', ip: '192.168.1.50', location: 'San Francisco, CA', last_activity: '2024-01-25 14:30:00', status: 'active' },
    { id: 2, device: 'Safari on iPhone', ip: '203.0.113.45', location: 'New York, NY', last_activity: '2024-01-24 18:20:00', status: 'expired' },
    { id: 3, device: 'Firefox on Mac', ip: '198.51.100.123', location: 'Austin, TX', last_activity: '2024-01-23 11:15:00', status: 'expired' }
  ];

  const mockUsage = [
    { date: '2024-01-25', login_count: 3, actions_performed: 15, avg_session_duration: '2h 30m' },
    { date: '2024-01-24', login_count: 2, actions_performed: 12, avg_session_duration: '1h 45m' },
    { date: '2024-01-23', login_count: 1, actions_performed: 8, avg_session_duration: '3h 15m' },
    { date: '2024-01-22', login_count: 2, actions_performed: 10, avg_session_duration: '2h 10m' },
    { date: '2024-01-21', login_count: 1, actions_performed: 6, avg_session_duration: '1h 30m' }
  ];

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleEdit = useCallback(() => {
    onEdit(user);
    onClose();
  }, [onEdit, user, onClose]);

  const handleClone = useCallback(() => {
    onClone(user);
    onClose();
  }, [onClone, user, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(user);
    onClose();
  }, [onDelete, user, onClose]);

  if (!isOpen || !user) return null;

  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' };
      case 'inactive':
        return { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' };
      case 'pending':
        return { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'suspended':
        return { icon: AlertTriangle, color: 'bg-red-100 text-red-800', label: 'Suspended' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'super_admin':
        return { icon: Shield, color: 'bg-red-100 text-red-800', label: 'Super Admin' };
      case 'org_admin':
        return { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Org Admin' };
      case 'agent':
        return { icon: Users, color: 'bg-green-100 text-green-800', label: 'Agent' };
      case 'client':
        return { icon: UserCheck, color: 'bg-purple-100 text-purple-800', label: 'Client' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: role };
    }
  };

  const getPermissionCategoryIcon = (category) => {
    switch (category) {
      case 'user_management':
        return Users;
      case 'role_management':
        return ShieldIcon;
      case 'system_management':
        return Settings;
      case 'general':
        return Eye;
      default:
        return Settings;
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

  const StatusIcon = getStatusInfo(user.status).icon;
  const RoleIcon = getRoleInfo(user.role).icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* User Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email Address</label>
                          <p className="text-base text-gray-700">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone Number</label>
                          <p className="text-base text-gray-700">{user.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Position</label>
                          <p className="text-base text-gray-700">{user.position}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Role</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleInfo(user.role).color}>
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {getRoleInfo(user.role).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusInfo(user.status).color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {getStatusInfo(user.status).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Organization</label>
                          <p className="text-base text-gray-700">{user.organization}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Department</label>
                          <p className="text-base text-gray-700">{user.department}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Timezone */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location & Timezone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Location: {user.location || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Timezone: {user.timezone}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Created: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Last Updated: {new Date(user.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Security */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Account Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Email Verified: {user.is_verified ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">2FA Enabled: {user.is_2fa_enabled ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Login Count: {user.login_count}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Last Login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">User ID: {user.id}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employee Information */}
                {user.metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Hash className="w-5 h-5" />
                        Employee Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Employee ID: {user.metadata.employee_id || 'Not assigned'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Hire Date: {user.metadata.hire_date || 'Not specified'}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Manager: {user.metadata.manager || 'Not assigned'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Cost Center: {user.metadata.cost_center || 'Not assigned'}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      User Permissions
                    </CardTitle>
                    <CardDescription>
                      {mockPermissions.length} permissions currently assigned to this user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPermissions.map((permission) => {
                        const CategoryIcon = getPermissionCategoryIcon(permission.category);

                        return (
                          <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CategoryIcon className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{permission.name}</h4>
                                <p className="text-sm text-gray-500 font-mono">{permission.code}</p>
                                <p className="text-xs text-gray-400">{permission.category}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`${getRiskLevelColor(permission.risk_level)} border`}>
                                {permission.risk_level.charAt(0).toUpperCase() + permission.risk_level.slice(1)}
                              </Badge>
                              <div className="mt-1">
                                <Badge className={permission.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {permission.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sessions Tab */}
              <TabsContent value="sessions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Active Sessions
                    </CardTitle>
                    <CardDescription>
                      {mockSessions.filter(s => s.status === 'active').length} active sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Activity className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{session.device}</h4>
                              <p className="text-sm text-gray-500">IP: {session.ip}</p>
                              <p className="text-xs text-gray-400">Location: {session.location}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Badge>
                            <p className="text-xs text-gray-400 mt-1">
                              Last: {new Date(session.last_activity).toLocaleString()}
                            </p>
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
                      User Activity
                    </CardTitle>
                    <CardDescription>
                      Recent activity and actions performed by this user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{activity.action}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">IP: {activity.ip}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">{activity.location}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{activity.user_agent}</p>
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
                      User activity patterns and statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{mockUsage.reduce((sum, u) => sum + u.login_count, 0)}</div>
                          <div className="text-sm text-gray-500">Total Logins (5 days)</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{mockUsage.reduce((sum, u) => sum + u.actions_performed, 0)}</div>
                          <div className="text-sm text-gray-500">Total Actions</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">2h 15m</div>
                          <div className="text-sm text-gray-500">Avg Session Duration</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Daily Usage (Last 5 Days)</h4>
                        <div className="space-y-2">
                          {mockUsage.map((usage, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="text-sm text-gray-600">{usage.date}</span>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">{usage.login_count} logins</span>
                                <span className="text-sm text-gray-600">{usage.actions_performed} actions</span>
                                <span className="text-sm text-gray-600">{usage.avg_session_duration}</span>
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

export default ViewUserDetailsDialog;
