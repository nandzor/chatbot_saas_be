import React, { useState, useCallback } from 'react';
import { 
  X, 
  Shield, 
  Users, 
  Settings, 
  Eye,
  Edit,
  Copy,
  Trash2,
  Calendar,
  User,
  Key,
  Globe,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Clock,
  Hash
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

const ViewRoleDetailsDialog = ({ isOpen, onClose, role, onEdit, onClone, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockPermissions = [
    { id: 1, name: 'User Management', code: 'users.manage', category: 'User Management', risk_level: 'high' },
    { id: 2, name: 'View Users', code: 'users.view', category: 'User Management', risk_level: 'low' },
    { id: 3, name: 'Create Users', code: 'users.create', category: 'User Management', risk_level: 'medium' },
    { id: 4, name: 'Chat Management', code: 'chat.manage', category: 'Chat Management', risk_level: 'high' },
    { id: 5, name: 'Analytics Access', code: 'analytics.view', category: 'Analytics', risk_level: 'low' }
  ];

  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', assigned_at: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', assigned_at: '2024-01-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', assigned_at: '2024-01-10' }
  ];

  const mockActivity = [
    { id: 1, action: 'Role created', user: 'System', timestamp: '2024-01-01 10:00:00', details: 'Role created via seeder' },
    { id: 2, action: 'Permission assigned', user: 'Admin User', timestamp: '2024-01-15 14:30:00', details: 'Added user management permissions' },
    { id: 3, action: 'User assigned', user: 'Admin User', timestamp: '2024-01-20 09:15:00', details: 'Assigned to John Doe' }
  ];

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleEdit = useCallback(() => {
    onEdit(role);
    onClose();
  }, [onEdit, role, onClose]);

  const handleClone = useCallback(() => {
    onClone(role);
    onClose();
  }, [onClone, role, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(role);
    onClose();
  }, [onDelete, role, onClose]);

  if (!isOpen || !role) return null;

  const getScopeInfo = (scope) => {
    switch (scope) {
      case 'global':
        return { icon: Globe, color: 'bg-purple-100 text-purple-800', label: 'Global' };
      case 'organization':
        return { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Organization' };
      case 'department':
        return { icon: Users, color: 'bg-green-100 text-green-800', label: 'Department' };
      case 'team':
        return { icon: Users, color: 'bg-yellow-100 text-yellow-800', label: 'Team' };
      case 'personal':
        return { icon: User, color: 'bg-gray-100 text-gray-800', label: 'Personal' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: scope };
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

  const ScopeIcon = getScopeInfo(role.scope).icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: role.color + '20' }}
            >
              <Shield className="w-6 h-6" style={{ color: role.color }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{role.name}</h2>
              <p className="text-sm text-gray-600 font-mono">{role.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!role.is_system_role && (
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Role Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Role Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Role Name</label>
                          <p className="text-lg font-semibold text-gray-900">{role.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Display Name</label>
                          <p className="text-base text-gray-900">{role.display_name || role.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Description</label>
                          <p className="text-base text-gray-700">{role.description}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Role Code</label>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{role.code}</code>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Scope</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getScopeInfo(role.scope).color}>
                              <ScopeIcon className="w-3 h-3 mr-1" />
                              {getScopeInfo(role.scope).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Level</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-mono">
                              {role.level}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="flex items-center gap-2 mt-1">
                            {role.is_active ? (
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
                        <div>
                          <label className="text-sm font-medium text-gray-500">Type</label>
                          <div className="flex items-center gap-2 mt-1">
                            {role.is_system_role && (
                              <Badge variant="destructive">System Role</Badge>
                            )}
                            {role.is_default && (
                              <Badge variant="secondary">Default Role</Badge>
                            )}
                            {role.badge_text && (
                              <Badge variant="outline">{role.badge_text}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      User Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{role.current_users}</div>
                        <div className="text-sm text-gray-500">Current Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {role.max_users || '∞'}
                        </div>
                        <div className="text-sm text-gray-500">Max Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {role.metadata?.permissions_count || 0}
                        </div>
                        <div className="text-sm text-gray-500">Permissions</div>
                      </div>
                    </div>
                    
                    {role.max_users && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>User Capacity</span>
                          <span>{role.current_users} / {role.max_users}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(role.current_users / role.max_users) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Created: {new Date(role.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Updated: {new Date(role.updated_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">ID: {role.id}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Created via: {role.metadata?.created_via || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">System Role: {role.is_system_role ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Dangerous: {role.metadata?.dangerous_role ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Assigned Permissions
                    </CardTitle>
                    <CardDescription>
                      {mockPermissions.length} permissions assigned to this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Key className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{permission.name}</h4>
                              <p className="text-sm text-gray-500 font-mono">{permission.code}</p>
                              <p className="text-xs text-gray-400">{permission.category}</p>
                            </div>
                          </div>
                          <Badge className={`${getRiskLevelColor(permission.risk_level)} border`}>
                            {permission.risk_level.charAt(0).toUpperCase() + permission.risk_level.slice(1)}
                          </Badge>
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
                      Assigned Users
                    </CardTitle>
                    <CardDescription>
                      {mockUsers.length} users currently assigned to this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              <p className="text-xs text-gray-400">Assigned: {user.assigned_at}</p>
                            </div>
                          </div>
                          <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
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
                      <BarChart3 className="w-5 h-5" />
                      Role Activity
                    </CardTitle>
                    <CardDescription>
                      Recent activity and changes related to this role
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
                            </div>
                          </div>
                        </div>
                      ))}
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

export default ViewRoleDetailsDialog;
