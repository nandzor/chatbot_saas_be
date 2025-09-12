import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Users,
  Settings,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Skeleton
} from '@/components/ui';
import { useUserManagement } from '@/hooks/useUserManagement';

const UserPermissionsTab = ({ userId, user }) => {
  const { getUserPermissions } = useUserManagement();

  // State management
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    active_only: true
  });

  // Load user permissions
  const loadUserPermissions = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getUserPermissions(userId, filters);

      if (result.success) {
        setPermissions(result.data.permissions || []);
      } else {
        setError(result.error || 'Failed to load user permissions');
      }
    } catch (err) {
      setError('Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  }, [userId, filters, getUserPermissions]);

  // Load permissions when component mounts or filters change
  useEffect(() => {
    if (userId) {
      loadUserPermissions();
    }
  }, [userId, loadUserPermissions]);

  // Get permission category icon
  const getPermissionCategoryIcon = (category) => {
    switch (category) {
      case 'user_management':
        return Users;
      case 'role_management':
        return Shield;
      case 'system_management':
        return Settings;
      case 'general':
        return Eye;
      default:
        return Settings;
    }
  };

  // Get risk level color
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

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filter permissions based on current filters
  const filteredPermissions = permissions.filter(permission => {
    if (filters.category !== 'all' && permission.category !== filters.category) {
      return false;
    }
    if (filters.active_only && !permission.is_active) {
      return false;
    }
    return true;
  });

  // Group permissions by category
  const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
    const category = permission.category || 'uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
    return groups;
  }, {});

  // Get category display name
  const getCategoryDisplayName = (category) => {
    switch (category) {
      case 'user_management':
        return 'User Management';
      case 'role_management':
        return 'Role Management';
      case 'system_management':
        return 'System Management';
      case 'general':
        return 'General';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Permissions
            </CardTitle>
            <CardDescription>
              Loading permissions...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Permissions
            </CardTitle>
            <CardDescription>
              Error loading permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Permissions</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={loadUserPermissions} variant="outline" disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {loading ? 'Loading...' : 'Try Again'}
                </Button>
                <Button onClick={() => setError(null)} variant="ghost">
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                User Permissions
              </CardTitle>
              <CardDescription>
                {filteredPermissions.length} permissions currently assigned to this user
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadUserPermissions}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="user_management">User Management</option>
              <option value="role_management">Role Management</option>
              <option value="system_management">System Management</option>
              <option value="general">General</option>
            </select>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={filters.active_only}
                onChange={(e) => handleFilterChange('active_only', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Active only
            </label>
          </div>

          {/* Permissions List */}
          {filteredPermissions.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Permissions Found</h3>
              <p className="text-gray-600 mb-4">
                {filters.category !== 'all' || filters.active_only
                  ? 'No permissions match the current filters.'
                  : 'This user has no permissions assigned.'}
              </p>
              {(filters.category !== 'all' || filters.active_only) && (
                <Button
                  variant="outline"
                  onClick={() => setFilters({ category: 'all', active_only: false })}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
                const CategoryIcon = getPermissionCategoryIcon(category);

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <CategoryIcon className="w-5 h-5 text-gray-600" />
                      <h3 className="font-medium text-gray-900">
                        {getCategoryDisplayName(category)}
                      </h3>
                      <Badge variant="secondary" className="ml-auto">
                        {categoryPermissions.length} permission{categoryPermissions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {categoryPermissions.map((permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
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
                          <div className="text-right space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getRiskLevelColor(permission.risk_level)} border`}>
                                {permission.risk_level.charAt(0).toUpperCase() + permission.risk_level.slice(1)}
                              </Badge>
                              <Badge className={getStatusColor(permission.is_active)}>
                                {permission.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {permission.is_direct ? (
                                <Badge variant="outline" className="text-xs">
                                  Direct
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  Inherited
                                </Badge>
                              )}
                              {permission.is_dangerous && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                              {permission.requires_approval && (
                                <CheckCircle className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Debug Info */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-2">Debug Info:</p>
            <p className="text-xs text-gray-600">User ID: {userId}</p>
            <p className="text-xs text-gray-600">Total Permissions: {permissions.length}</p>
            <p className="text-xs text-gray-600">Filtered Permissions: {filteredPermissions.length}</p>
            <p className="text-xs text-gray-600">Filters: {JSON.stringify(filters)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPermissionsTab;
