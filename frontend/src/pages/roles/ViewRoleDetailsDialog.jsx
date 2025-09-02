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
  Loader2,
  RefreshCw,
  TrendingUp,
  Activity,
  UserCheck,
  UserX
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
  Skeleton,
  Separator
} from '@/components/ui';

const ViewRoleDetailsDialog = ({ isOpen, onClose, role, onEdit, onClone, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [roleDetails, setRoleDetails] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState(null);

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
      setError(null);

      // Load role details with permissions and users count
      const roleResponse = await roleManagementService.getRole(role.id);
      if (roleResponse.success) {
        setRoleDetails(roleResponse.data);

        // Load permissions if available in response
        if (roleResponse.data?.permissions) {
          setPermissions(roleResponse.data.permissions);
        } else {
          // Load permissions separately if not included
          await loadPermissions();
        }

        // Load assigned users
        await loadAssignedUsers();

        // Generate activity data
        generateActivityData(roleResponse.data);
      } else {
        setError('Failed to load role details');
        toast.error('Failed to load role details');
      }

    } catch (error) {
      console.error('Error loading role details:', error);
      setError(error.message || 'Failed to load role details');
      toast.error('Failed to load role details');
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Load permissions for the role
  const loadPermissions = useCallback(async () => {
    if (!role?.id) return;

    try {
      setPermissionsLoading(true);
      const permissionsResponse = await roleManagementService.getRolePermissions(role.id);
      if (permissionsResponse.success) {
        setPermissions(permissionsResponse.data || []);
      }
    } catch (error) {
      console.warn('Could not load permissions:', error);
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  }, [role]);

  // Load assigned users for the role
  const loadAssignedUsers = useCallback(async () => {
    if (!role?.id) return;

    try {
      setUsersLoading(true);
      const usersResponse = await roleManagementService.getUsersByRole(role.id);
      if (usersResponse.success) {
        setAssignedUsers(usersResponse.data || []);
      }
    } catch (error) {
      console.warn('Could not load assigned users:', error);
      setAssignedUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [role]);

  // Generate activity data based on role information
  const generateActivityData = useCallback((roleData) => {
    const activities = [
      {
        id: 1,
        action: 'Role details viewed',
        user: 'Current User',
        timestamp: new Date().toLocaleString(),
        details: 'Role details accessed via dashboard',
        type: 'view'
      }
    ];

    if (roleData?.created_at) {
      activities.push({
        id: 2,
        action: 'Role created',
        user: roleData.metadata?.created_by || 'System',
        timestamp: new Date(roleData.created_at).toLocaleString(),
        details: `Role created via ${roleData.metadata?.created_via || 'system'}`,
        type: 'create'
      });
    }

    if (roleData?.updated_at && roleData.updated_at !== roleData.created_at) {
      activities.push({
        id: 3,
        action: 'Role updated',
        user: roleData.metadata?.updated_by || 'System',
        timestamp: new Date(roleData.updated_at).toLocaleString(),
        details: 'Role information was modified',
        type: 'update'
      });
    }

    setActivity(activities);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Reset state when closing
    setRoleDetails(null);
    setPermissions([]);
    setAssignedUsers([]);
    setActivity([]);
    setActiveTab('overview');
    setError(null);
  }, [onClose]);

  // Handle tab change and load data accordingly
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);

    // Load data based on active tab
    if (tab === 'permissions' && permissions.length === 0) {
      loadPermissions();
    } else if (tab === 'users' && assignedUsers.length === 0) {
      loadAssignedUsers();
    }
  }, [permissions.length, assignedUsers.length, loadPermissions, loadAssignedUsers]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    if (activeTab === 'permissions') {
      loadPermissions();
    } else if (activeTab === 'users') {
      loadAssignedUsers();
    } else {
      loadRoleDetails();
    }
  }, [activeTab, loadPermissions, loadAssignedUsers, loadRoleDetails]);

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

  // Error state
  if (error && !roleDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Role</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={loadRoleDetails}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
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
              {displayRole.description && (
                <p className="text-xs text-gray-500 mt-1">{displayRole.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Permissions
                  {permissions.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {permissions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Users
                  {assignedUsers.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {assignedUsers.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity
                </TabsTrigger>
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

                {/* Role Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Role Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {displayRole.users_count || assignedUsers.length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Assigned Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {displayRole.permissions_count || permissions.length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Permissions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {displayRole.level || 1}
                        </div>
                        <div className="text-sm text-gray-500">Level</div>
                      </div>
                    </div>

                    {/* User Assignment Progress */}
                    {displayRole.max_users && displayRole.max_users !== '∞' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>User Capacity</span>
                          <span>{(displayRole.users_count || 0)} / {displayRole.max_users}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(((displayRole.users_count || 0) / displayRole.max_users) * 100, 100)}%`
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
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5" />
                          Assigned Permissions
                        </CardTitle>
                        <CardDescription>
                          {permissionsLoading ? 'Loading permissions...' : `${permissions.length} permissions assigned to this role`}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadPermissions}
                        disabled={permissionsLoading}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${permissionsLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {permissionsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <Skeleton className="w-8 h-8 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        ))}
                      </div>
                    ) : permissions.length > 0 ? (
                      <div className="space-y-3">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                            <div className="flex items-center gap-2">
                              <Badge className={`${getRiskLevelColor(permission.risk_level || 'medium')} border`}>
                                {(permission.risk_level || 'medium').charAt(0).toUpperCase() + (permission.risk_level || 'medium').slice(1)}
                              </Badge>
                              {permission.is_system_permission && (
                                <Badge variant="outline" className="text-xs">
                                  System
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No permissions assigned</p>
                        <p className="text-sm">This role doesn't have any permissions assigned yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Assigned Users
                        </CardTitle>
                        <CardDescription>
                          {usersLoading ? 'Loading users...' : `${assignedUsers.length} users currently assigned to this role`}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadAssignedUsers}
                        disabled={usersLoading}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {usersLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </div>
                        ))}
                      </div>
                    ) : assignedUsers.length > 0 ? (
                      <div className="space-y-3">
                        {assignedUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{user.name || user.full_name || user.email}</h4>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {user.organization && (
                                    <span className="text-xs text-gray-400">
                                      {user.organization.name || user.organization}
                                    </span>
                                  )}
                                  {user.pivot?.created_at && (
                                    <>
                                      <span className="text-xs text-gray-400">•</span>
                                      <span className="text-xs text-gray-400">
                                        Assigned: {new Date(user.pivot.created_at).toLocaleDateString()}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {user.status === 'active' ? (
                                  <UserCheck className="w-3 h-3 mr-1" />
                                ) : (
                                  <UserX className="w-3 h-3 mr-1" />
                                )}
                                {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No users assigned</p>
                        <p className="text-sm">This role doesn't have any users assigned yet.</p>
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
                      <Activity className="w-5 h-5" />
                      Role Activity
                    </CardTitle>
                    <CardDescription>
                      Recent activity and changes related to this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activity.length > 0 ? (
                      <div className="space-y-3">
                        {activity.map((activityItem, index) => (
                          <div key={activityItem.id || index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                              activityItem.type === 'create' ? 'bg-green-100' :
                              activityItem.type === 'update' ? 'bg-blue-100' :
                              activityItem.type === 'delete' ? 'bg-red-100' :
                              'bg-gray-100'
                            }`}>
                              {activityItem.type === 'create' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : activityItem.type === 'update' ? (
                                <Edit className="w-4 h-4 text-blue-600" />
                              ) : activityItem.type === 'delete' ? (
                                <Trash2 className="w-4 h-4 text-red-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-gray-600" />
                              )}
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
                        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">No activity recorded</p>
                        <p className="text-sm">No recent activity has been recorded for this role.</p>
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
