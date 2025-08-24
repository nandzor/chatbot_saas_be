import React, { useState, useCallback, useEffect } from 'react';
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
  Hash,
  Loader2
} from 'lucide-react';
import { roleManagementService } from '@/services/RoleManagementService';
import { toast } from 'react-hot-toast';
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
  Skeleton
} from '@/components/ui';

const ViewRoleDetailsDialog = ({ isOpen, onClose, role, onEdit, onClone, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [roleDetails, setRoleDetails] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [activity, setActivity] = useState([]);

  // Load role details when dialog opens
  useEffect(() => {
    if (isOpen && role) {
      loadRoleDetails();
    }
  }, [isOpen, role]);

  // Load detailed role information from API
  const loadRoleDetails = useCallback(async () => {
    if (!role?.id) return;

    try {
      setLoading(true);

      // Load role details
      const roleResponse = await roleManagementService.getRole(role.id);
      if (roleResponse.success) {
        setRoleDetails(roleResponse.data);
      } else {
        toast.error('Failed to load role details');
      }

      // Load permissions (if available in the API response)
      if (roleResponse.data?.permissions) {
        setPermissions(roleResponse.data.permissions);
      }

      // Load assigned users
      try {
        const usersResponse = await roleManagementService.getUsersByRole(role.id);
        if (usersResponse.success) {
          setAssignedUsers(usersResponse.data || []);
        }
      } catch (error) {
        console.warn('Could not load assigned users:', error);
        setAssignedUsers([]);
      }

      // Load activity (mock for now, can be replaced with real API when available)
      setActivity([
        {
          id: 1,
          action: 'Role details viewed',
          user: 'Current User',
          timestamp: new Date().toLocaleString(),
          details: 'Role details accessed via dashboard'
        },
        {
          id: 2,
          action: 'Role created',
          user: roleDetails?.metadata?.created_by || 'System',
          timestamp: roleDetails?.created_at ? new Date(roleDetails.created_at).toLocaleString() : 'Unknown',
          details: `Role created via ${roleDetails?.metadata?.created_via || 'system'}`
        }
      ]);

    } catch (error) {
      console.error('Error loading role details:', error);
      toast.error('Failed to load role details');
    } finally {
      setLoading(false);
    }
  }, [role]);

  const handleClose = useCallback(() => {
    onClose();
    // Reset state when closing
    setRoleDetails(null);
    setPermissions([]);
    setAssignedUsers([]);
    setActivity([]);
    setActiveTab('overview');
  }, [onClose]);

  const handleEdit = useCallback(() => {
    onEdit(roleDetails || role);
    onClose();
  }, [onEdit, roleDetails, role, onClose]);

  const handleClone = useCallback(() => {
    onClone(roleDetails || role);
    onClose();
  }, [onClone, roleDetails, role, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(roleDetails || role);
    onClose();
  }, [onDelete, roleDetails, role, onClose]);

  if (!isOpen || !role) return null;

  // Use roleDetails if available, otherwise fall back to role prop
  const displayRole = roleDetails || role;

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

  const ScopeIcon = getScopeInfo(displayRole.scope).icon;

  // Loading state
  if (loading && !roleDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg text-gray-600">Loading role details...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: (displayRole.color || '#6B7280') + '20' }}
            >
              <Shield className="w-6 h-6" style={{ color: displayRole.color || '#6B7280' }} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{displayRole.name}</h2>
              <p className="text-sm text-gray-600 font-mono">{displayRole.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!displayRole.is_system_role && (
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
                          <p className="text-lg font-semibold text-gray-900">{displayRole.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Display Name</label>
                          <p className="text-base text-gray-900">{displayRole.display_name || displayRole.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Description</label>
                          <p className="text-base text-gray-700">{displayRole.description}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Role Code</label>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">{displayRole.code}</code>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Scope</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getScopeInfo(displayRole.scope).color}>
                              <ScopeIcon className="w-3 h-3 mr-1" />
                              {getScopeInfo(displayRole.scope).label}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Level</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-mono">
                              {displayRole.level}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <div className="flex items-center gap-2 mt-1">
                            {displayRole.status === 'active' ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="w-3 h-3 mr-1" />
                                {displayRole.status || 'Inactive'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Type</label>
                          <div className="flex items-center gap-2 mt-1">
                            {displayRole.is_system_role && (
                              <Badge variant="destructive">System Role</Badge>
                            )}
                            {displayRole.is_default && (
                              <Badge variant="secondary">Default Role</Badge>
                            )}
                            {displayRole.badge_text && (
                              <Badge variant="outline">{displayRole.badge_text}</Badge>
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
                        <div className="text-2xl font-bold text-blue-600">{displayRole.current_users || 0}</div>
                        <div className="text-sm text-gray-500">Current Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {displayRole.max_users || '∞'}
                        </div>
                        <div className="text-sm text-gray-500">Max Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {displayRole.permissions_count || permissions.length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Permissions</div>
                      </div>
                    </div>

                    {displayRole.max_users && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>User Capacity</span>
                          <span>{(displayRole.current_users || 0)} / {displayRole.max_users}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${((displayRole.current_users || 0) / displayRole.max_users) * 100}%`
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
                          <span className="text-sm text-gray-600">
                            Created: {displayRole.created_at ? new Date(displayRole.created_at).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Updated: {displayRole.updated_at ? new Date(displayRole.updated_at).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">ID: {displayRole.id}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Created via: {displayRole.metadata?.created_via || 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            System Role: {displayRole.is_system_role ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Dangerous: {displayRole.metadata?.dangerous_role ? 'Yes' : 'No'}
                          </span>
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
                      {permissions.length} permissions assigned to this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {permissions.length > 0 ? (
                      <div className="space-y-3">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Key className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{permission.name}</h4>
                                <p className="text-sm text-gray-500 font-mono">{permission.code}</p>
                                <p className="text-xs text-gray-400">{permission.category || 'General'}</p>
                              </div>
                            </div>
                            <Badge className={`${getRiskLevelColor(permission.risk_level || 'medium')} border`}>
                              {(permission.risk_level || 'medium').charAt(0).toUpperCase() + (permission.risk_level || 'medium').slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No permissions assigned to this role</p>
                      </div>
                    )}
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
                      {assignedUsers.length} users currently assigned to this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assignedUsers.length > 0 ? (
                      <div className="space-y-3">
                        {assignedUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{user.name || user.email}</h4>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <p className="text-xs text-gray-400">
                                  Assigned: {user.pivot?.created_at ? new Date(user.pivot.created_at).toLocaleDateString() : 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No users assigned to this role</p>
                      </div>
                    )}
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
                    {activity.length > 0 ? (
                      <div className="space-y-3">
                        {activity.map((activityItem) => (
                          <div key={activityItem.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                              <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{activityItem.action}</h4>
                              <p className="text-sm text-gray-600">{activityItem.details}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">by {activityItem.user}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{activityItem.timestamp}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No activity recorded for this role</p>
                      </div>
                    )}
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
