import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Shield,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Building2,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Settings,
  Download,
  Upload,
  X,
  Lock,
  Users,
  FileText
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton,
  Switch
} from '@/components/ui';
import CreatePermissionDialog from './CreatePermissionDialog';
import ViewPermissionDetailsDialog from './ViewPermissionDetailsDialog';
import EditPermissionDialog from './EditPermissionDialog';
import { usePermissionManagement } from '@/hooks/usePermissionManagement';
import permissionManagementService from '@/services/PermissionManagementService';
import { toast } from 'react-hot-toast';

// Import Pagination Library
import Pagination from '@/components/ui/Pagination';

// Constants
const DEBOUNCE_DELAY = 300;
const INITIAL_STATISTICS = {
  totalPermissions: 0,
  activePermissions: 0,
  systemPermissions: 0,
  customPermissions: 0
};

const STATUS_MAP = {
  active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
  inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  suspended: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' }
};

const CATEGORY_MAP = {
  system_administration: { icon: Shield, color: 'bg-red-100 text-red-800', label: 'System Administration' },
  user_management: { icon: Users, color: 'bg-blue-100 text-blue-800', label: 'User Management' },
  role_management: { icon: Key, color: 'bg-purple-100 text-purple-800', label: 'Role Management' },
  permission_management: { icon: Lock, color: 'bg-green-100 text-green-800', label: 'Permission Management' },
  content_management: { icon: FileText, color: 'bg-yellow-100 text-yellow-800', label: 'Content Management' },
  analytics: { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Analytics' },
  billing: { icon: Building2, color: 'bg-orange-100 text-orange-800', label: 'Billing' },
  api_management: { icon: Settings, color: 'bg-indigo-100 text-indigo-800', label: 'API Management' }
};

const DEFAULT_STATUS_INFO = { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };

// Custom hook for statistics
const useStatistics = () => {
  const [statistics, setStatistics] = useState(INITIAL_STATISTICS);
  const [loading, setLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await permissionManagementService.getPermissions({ per_page: 1000 });

      if (response.success) {
        const permissions = response.data || [];
        const stats = {
          totalPermissions: permissions.length,
          activePermissions: permissions.filter(p => p.status === 'active').length,
          systemPermissions: permissions.filter(p => p.is_system).length,
          customPermissions: permissions.filter(p => !p.is_system).length
        };
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Failed to load permission statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return { statistics, loading, loadStatistics };
};

// Custom hook for permission actions
const usePermissionActions = (permissions, { createPermission, updatePermission, deletePermission, clonePermission }) => {
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreatePermission = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleEditPermission = useCallback((permission) => {
    setSelectedPermission(permission);
    setShowEditModal(true);
  }, []);

  const handleViewDetails = useCallback((permission) => {
    setSelectedPermission(permission);
    setShowDetailsModal(true);
  }, []);

  const handleClonePermission = useCallback(async (permission) => {
    const newName = prompt(`Enter new name for cloned permission (${permission.name}):`);
    if (!newName) return;

    try {
      setActionLoading(true);
      const result = await clonePermission({
        ...permission,
        name: newName,
        code: `${permission.code}_copy`
      });
      if (result.success) {
        setShowDeleteConfirm(false);
        setSelectedPermission(null);
      }
    } catch (error) {
      console.error('Failed to clone permission:', error);
    } finally {
      setActionLoading(false);
    }
  }, [clonePermission]);

  const handleDeletePermission = useCallback((permission) => {
    setSelectedPermission(permission);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeletePermission = useCallback(async () => {
    if (!selectedPermission) return;

    try {
      setActionLoading(true);
      const result = await deletePermission(selectedPermission.id);
      if (result.success) {
        setShowDeleteConfirm(false);
        setSelectedPermission(null);
      }
    } catch (error) {
      console.error('Failed to delete permission:', error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedPermission, deletePermission]);

  const handleCreatePermissionSubmit = useCallback(async (permissionData) => {
    try {
      setActionLoading(true);
      const result = await createPermission(permissionData);
      if (result.success) {
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create permission:', error);
    } finally {
      setActionLoading(false);
    }
  }, [createPermission]);

  const handleEditPermissionSubmit = useCallback(async (permissionData) => {
    if (!selectedPermission) return;

    try {
      setActionLoading(true);
      const result = await updatePermission(selectedPermission.id, permissionData);
      if (result.success) {
        setShowEditModal(false);
        setSelectedPermission(null);
      }
    } catch (error) {
      console.error('Failed to update permission:', error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedPermission, updatePermission]);

  return {
    selectedPermission,
    showCreateModal,
    showEditModal,
    showDetailsModal,
    showDeleteConfirm,
    actionLoading,
    setShowCreateModal,
    setShowEditModal,
    setShowDetailsModal,
    setShowDeleteConfirm,
    handleCreatePermission,
    handleEditPermission,
    handleViewDetails,
    handleClonePermission,
    handleDeletePermission,
    confirmDeletePermission,
    handleCreatePermissionSubmit,
    handleEditPermissionSubmit
  };
};

const PermissionManagement = () => {
  // Use the custom hook for permission management with its built-in pagination
  const {
    permissions,
    loading: originalLoading,
    error,
    pagination: hookPagination,
    filters,
    loadPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    clonePermission,
    updateFilters,
    updatePagination: updateHookPagination
  } = usePermissionManagement();

  // Custom hooks
  const { statistics, loading: statisticsLoading } = useStatistics();
  const permissionActions = usePermissionActions(permissions, { createPermission, updatePermission, deletePermission, clonePermission });

  // Debounce filter changes
  const filterTimeoutRef = useRef(null);

  // Handle filter changes with debouncing
  const handleFilterChange = useCallback((field, value) => {
    // Clear existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // Set new timeout for debouncing
    filterTimeoutRef.current = setTimeout(() => {
      updateFilters({ [field]: value });
      // Reset to first page when filters change
      updateHookPagination({ currentPage: 1 });
    }, DEBOUNCE_DELAY);
  }, [updateFilters, updateHookPagination]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  // Error handling with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Enhanced pagination handlers
  const handlePageChange = useCallback((page) => {
    updateHookPagination({ currentPage: page });
  }, [updateHookPagination]);

  const handlePerPageChange = useCallback((perPage) => {
    updateHookPagination({ itemsPerPage: perPage });
  }, [updateHookPagination]);

  // Memoized status and category info functions
  const getStatusInfo = useCallback((status) => {
    return STATUS_MAP[status] || { ...DEFAULT_STATUS_INFO, label: status };
  }, []);

  const getCategoryInfo = useCallback((category) => {
    return CATEGORY_MAP[category] || { ...DEFAULT_STATUS_INFO, label: category };
  }, []);

  // Memoized filtered permissions for better performance
  const filteredPermissions = useMemo(() => {
    if (!permissions.length) return [];

    return permissions.filter(permission => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          permission.name,
          permission.code,
          permission.description,
          permission.category,
          permission.resource,
          permission.action
        ].filter(Boolean);

        const matchesSearch = searchableFields.some(field =>
          field.toLowerCase().includes(searchTerm)
        );

        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && permission.category !== filters.category) {
        return false;
      }

      // Type filter
      if (filters.type) {
        const isSystem = permission.is_system;
        if (filters.type === 'system' && !isSystem) return false;
        if (filters.type === 'custom' && isSystem) return false;
      }

      // Status filter
      if (filters.status && permission.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [permissions, filters]);

  // Loading state
  if (originalLoading && permissions.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && permissions.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading permissions</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <Button onClick={() => loadPermissions()} variant="outline" disabled={originalLoading}>
                {originalLoading ? 'Loading...' : 'Try Again'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permission Management</h1>
            <p className="text-gray-600">Manage system permissions, access controls, and security policies</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadPermissions();
              }}
              disabled={originalLoading}
            >
              <Settings className="w-4 h-4 mr-2" />
              {originalLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={permissionActions.handleCreatePermission} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Permission
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statisticsLoading ? '...' : statistics.totalPermissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statisticsLoading ? '...' : statistics.activePermissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statisticsLoading ? '...' : statistics.systemPermissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Copy className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Custom Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statisticsLoading ? '...' : statistics.customPermissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              {Object.keys(filters).some(key => filters[key] && filters[key] !== '') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateFilters({});
                    updateHookPagination({ currentPage: 1 });
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search permissions..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <Select value={filters.category || ''} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {Object.keys(CATEGORY_MAP).map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_MAP[category].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Select value={filters.type || ''} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={filters.status || ''} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>
              Manage system permissions and access controls.
              Showing {filteredPermissions.length} of {pagination.total || permissions.length} permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {originalLoading && permissions.length === 0 ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                filteredPermissions.map((permission) => {
                const statusInfo = getStatusInfo(permission.status);
                const categoryInfo = getCategoryInfo(permission.category);
                const StatusIcon = statusInfo.icon;
                const CategoryIcon = categoryInfo.icon;

                return (
                  <div key={permission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${categoryInfo.color.split(' ')[0].replace('bg-', '')}20` }}>
                            <CategoryIcon className="w-5 h-5" style={{ color: categoryInfo.color.split(' ')[1].replace('text-', '') }} />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {permission.name}
                            </h3>
                            {permission.is_system && (
                              <Badge variant="destructive" className="text-xs">SYS</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 font-mono">{permission.code}</p>
                          {permission.description && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-md">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge className={categoryInfo.color}>
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {categoryInfo.label}
                          </Badge>
                          <div className="mt-1">
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => permissionActions.handleViewDetails(permission)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => permissionActions.handleEditPermission(permission)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Permission
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => permissionActions.handleClonePermission(permission)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Clone Permission
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => permissionActions.handleDeletePermission(permission)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Permission
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
                })
              )}

              {filteredPermissions.length === 0 && !originalLoading && (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {Object.keys(filters).some(key => filters[key] && filters[key] !== '')
                      ? 'Try adjusting your filters to see more results.'
                      : 'Get started by creating a new permission.'}
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    {Object.keys(filters).some(key => filters[key] && filters[key] !== '') ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          updateFilters({});
                          updateHookPagination({ currentPage: 1 });
                        }}
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={permissionActions.handleCreatePermission}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Permission
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  totalItems={pagination.total}
                  perPage={pagination.per_page}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CreatePermissionDialog
        isOpen={permissionActions.showCreateModal}
        onClose={() => permissionActions.setShowCreateModal(false)}
        onSubmit={permissionActions.handleCreatePermissionSubmit}
        loading={permissionActions.actionLoading}
      />

      <EditPermissionDialog
        isOpen={permissionActions.showEditModal}
        onClose={() => permissionActions.setShowEditModal(false)}
        permission={permissionActions.selectedPermission}
        onSubmit={permissionActions.handleEditPermissionSubmit}
        loading={permissionActions.actionLoading}
      />

      <ViewPermissionDetailsDialog
        isOpen={permissionActions.showDetailsModal}
        onClose={() => permissionActions.setShowDetailsModal(false)}
        permission={permissionActions.selectedPermission}
        onEdit={permissionActions.handleEditPermission}
        onClone={permissionActions.handleClonePermission}
        onDelete={permissionActions.handleDeletePermission}
      />

      {/* Delete Confirmation Dialog */}
      {permissionActions.showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Permission</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{permissionActions.selectedPermission?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => permissionActions.setShowDeleteConfirm(false)}
                disabled={permissionActions.actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={permissionActions.confirmDeletePermission}
                disabled={permissionActions.actionLoading}
              >
                {permissionActions.actionLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;
