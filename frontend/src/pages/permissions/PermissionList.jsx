import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Plus,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Settings,
  Key,
  Lock,
  Users,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Download,
  Upload,
  BarChart3,
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  useLoadingStates,
  LoadingWrapper,
  SkeletonCard
} from '@/utils/loadingStates';
import {
  handleError,
  withErrorHandling
} from '@/utils/errorHandler';
import {
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  sanitizeInput,
  validateInput
} from '@/utils/securityUtils';

import { usePermissionManagement } from '@/hooks/usePermissionManagement';
import { usePermissionCheck } from '@/hooks/usePermissionCheck';

import CreatePermissionDialog from './CreatePermissionDialog';
import ViewPermissionDetailsDialog from './ViewPermissionDetailsDialog';
import EditPermissionDialog from './EditPermissionDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import PermissionBulkActions from './PermissionBulkActions';

import {// Header & container
  PageHeaderWithActions, DataContainer, // Filters
  FilterBar, // Cards
  Card, CardContent, CardDescription, CardHeader, CardTitle, // Badges & Buttons
  Badge, Button, // Input & Select
  Input, Label, Select, SelectItem, // Table & pagination
  DataTable, Pagination, // Dropdown
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, // Alert
  Alert, AlertDescription, // Confirm dialog - DeleteConfirmDialog removed (not available)
  // States
  Skeleton, EmptyState, ErrorMessage} from '@/components/ui';

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const PermissionList = () => {
  // Accessibility and loading hooks
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // Hooks
  const {
    permissions,
    loading,
    error,
    filters,
    pagination,
    loadPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    clearError,
    handlePageChange,
    handlePerPageChange,
    refreshPermissions,
    setFilters,
  } = usePermissionManagement();
  const { can } = usePermissionCheck();

  // Local UI state
  const [selected, setSelected] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Initial load ref to prevent duplicate API calls
  const initialLoadRef = useRef(false);

  // Get permission category icon and color
  const getCategoryInfo = useCallback((category) => {
    switch (category) {
      case 'system':
        return { icon: Shield, color: 'bg-red-100 text-red-800', label: 'System' };
      case 'user_management':
        return { icon: Users, color: 'bg-blue-100 text-blue-800', label: 'User Management' };
      case 'role_management':
        return { icon: Key, color: 'bg-purple-100 text-purple-800', label: 'Role Management' };
      case 'permission_management':
        return { icon: Lock, color: 'bg-green-100 text-green-800', label: 'Permission Management' };
      case 'content_management':
        return { icon: FileText, color: 'bg-yellow-100 text-yellow-800', label: 'Content Management' };
      case 'settings':
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Settings' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Other' };
    }
  }, []);

  // Load permissions on mount and when filters change
  useEffect(() => {
    setLoading('initial', true);
    loadPermissions().finally(() => {
      setLoading('initial', false);
      setIsInitialLoad(false);
    });
  }, [filters, loadPermissions]); // Remove setLoading from deps to prevent re-renders

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  // Error surface
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Permission action handlers
  const handleViewPermission = useCallback((permission) => {
    setSelected(permission);
    setShowDetails(true);
    announce(`Viewing permission: ${permission.name}`);
  }, [announce]);

  const handleEditPermission = useCallback((permission) => {
    setSelected(permission);
    setShowEdit(true);
    announce(`Editing permission: ${permission.name}`);
  }, [announce]);

  const handleClonePermission = useCallback((permission) => {
    navigator.clipboard.writeText(permission.name);
    announce(`Permission name copied: ${permission.name}`);
  }, [announce]);

  const handleDeletePermission = useCallback((permission) => {
    setSelected(permission);
    setShowDeleteConfirm(true);
    announce(`Deleting permission: ${permission.name}`);
  }, [announce]);

  const handleViewRoles = useCallback((permission) => {
    // TODO: Implement view roles modal
    toast.info(`Viewing roles for permission: ${permission.name}`);
    announce(`Viewing roles for permission: ${permission.name}`);
  }, [announce]);

  const handleViewUsers = useCallback((permission) => {
    // TODO: Implement view users modal
    toast.info(`Viewing users for permission: ${permission.name}`);
    announce(`Viewing users for permission: ${permission.name}`);
  }, [announce]);

  // Search and filter handlers
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);
    setFilters(prev => ({ ...prev, search: value }));
    announce(`Searching for: ${value}`);
  }, [setFilters, announce]);

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }));
    announce(`Filtering by status: ${value}`);
  }, [setFilters, announce]);

  const handleTypeFilterChange = useCallback((value) => {
    setTypeFilter(value);
    setFilters(prev => ({ ...prev, is_system: value === 'all' ? '' : value }));
    announce(`Filtering by type: ${value}`);
  }, [setFilters, announce]);

  const handleCategoryFilterChange = useCallback((value) => {
    setCategoryFilter(value);
    setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }));
    announce(`Filtering by category: ${value}`);
  }, [setFilters, announce]);

  // Bulk selection handlers
  const handleSelectionChange = useCallback((selectedItems) => {
    setSelectedPermissions(selectedItems);
  }, []);

  const handleSelectAll = useCallback((checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedPermissions(permissions);
    } else {
      setSelectedPermissions([]);
    }
  }, [permissions]);

  const handleBulkActionSuccess = useCallback(() => {
    loadPermissions();
    setSelectedPermissions([]);
    setSelectAll(false);
  }, [loadPermissions]);

  // Derived data
  const categoryOptions = useMemo(() => {
    const set = new Set(permissions.map(p => p.category).filter(Boolean));
    return Array.from(set);
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    let result = permissions;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.code || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.resource || '').toLowerCase().includes(q) ||
        (p.action || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(p => p.is_system_permission === (typeFilter === 'true'));
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }

    return result;
  }, [permissions, searchQuery, statusFilter, typeFilter, categoryFilter]);


  // Columns config for DataTable
  const columns = useMemo(() => {
    return [
      {
        header: 'Permission',
        key: 'name',
        className: 'w-[30%] min-w-[240px]',
        render: (_val, item) => (
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
              style={{ backgroundColor: (item.color || '#6B7280') + '20' }}
            >
              <Shield className="w-5 h-5" style={{ color: item.color || '#6B7280' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
                {item.is_system_permission && (
                  <Badge variant="destructive" className="text-xs">SYS</Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 font-mono">{item.code}</p>
              {item.description && (
                <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">{item.description}</p>
              )}
            </div>
          </div>
        )
      },
      {
        header: 'Category & Resource',
        key: 'category',
        className: 'w-[30%] min-w-[220px]',
        render: (_val, item) => {
          const categoryInfo = getCategoryInfo(item.category);
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={categoryInfo.color}>
                  <categoryInfo.icon className="w-3 h-3 mr-1" />
                  {categoryInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Resource:</span>
                <Badge variant="outline" className="font-mono">
                  {item.resource || 'N/A'}
                </Badge>
              </div>
              <div className="text-xs text-gray-400">Action: {item.action || 'N/A'}</div>
            </div>
          );
        }
      },
      {
        header: 'Access & Scope',
        key: 'scope',
        className: 'w-[20%] min-w-[180px]',
        render: (_val, item) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <Badge variant={item.is_system_permission ? 'destructive' : 'outline'}>
                {item.is_system_permission ? 'System' : 'Custom'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Visible:</span>
              <Badge variant={item.is_visible ? 'default' : 'secondary'}>
                {item.is_visible ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">{item.metadata?.scope || 'Global'} scope</div>
          </div>
        )
      },
      {
        header: 'Status',
        key: 'status',
        className: 'w-[10%] min-w-[120px]',
        render: (val) => (
          val === 'active' ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="w-3 h-3 mr-1" />
              {val || 'Inactive'}
            </Badge>
          )
        )
      },
      {
        header: 'Actions',
        key: 'actions',
        className: 'w-[10%] min-w-[100px]',
        sortable: false,
        render: (value, permission) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewPermission(permission)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditPermission(permission)}
                disabled={!can('permissions.update')}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Permission
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleClonePermission(permission)}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewRoles(permission)}>
                <Shield className="mr-2 h-4 w-4" />
                View Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleViewUsers(permission)}>
                <Users className="mr-2 h-4 w-4" />
                View Users
              </DropdownMenuItem>
              {!permission.is_system_permission && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeletePermission(permission)}
                    className="text-red-600"
                    disabled={!can('permissions.delete')}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Permission
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ];
  }, [getCategoryInfo, handleViewPermission, handleEditPermission, handleClonePermission, handleDeletePermission, handleViewRoles, handleViewUsers, can]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await refreshPermissions();
      announce('Permissions refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Permission Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [refreshPermissions, setLoading, announce]);

  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      announce('Permissions exported successfully');
    } catch (err) {
      handleError(err, { context: 'Permission Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  const handleCreateSubmit = async (data) => {
    try {
      setActionLoading(true);
      const res = await createPermission(data);
      if (res.success) {
        toast.success('Permission created');
        setShowCreate(false);
        announce('Permission created successfully');
      } else {
        toast.error(res.error || 'Failed to create');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const onEdit = (permission) => {
    setSelected(permission);
    setShowEdit(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      if (!selected) return;
      setActionLoading(true);
      const res = await updatePermission(selected.id, data);
      if (res.success) {
        toast.success('Permission updated');
        setShowEdit(false);
        setSelected(null);
      } else {
        toast.error(res.error || 'Failed to update');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const onView = (permission) => {
    setSelected(permission);
    setShowDetails(true);
  };

  const onClone = (permission) => {
    setSelected({ ...permission, id: undefined, name: `${permission.name} (Copy)` });
    setShowCreate(true);
  };

  const onAskDelete = (permission) => {
    setSelected(permission);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (!selected) return;
      setActionLoading(true);
      const res = await deletePermission(selected.id);
      if (res.success) {
        toast.success('Permission deleted');
        setShowDeleteConfirm(false);
        setSelected(null);
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state (skeleton) - AFTER all hooks
  if (loading && permissions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showEmpty = !loading && permissions.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={focusRef}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
            <p className="text-muted-foreground">
              Manage system permissions, access controls, and security policies across the system
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={getLoadingState('refresh')}
              aria-label="Refresh permissions"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={getLoadingState('export')}
              aria-label="Export permissions"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button
              onClick={() => { setSelected(null); setShowCreate(true); }}
              disabled={!can('permissions.create')}
              aria-label="Create new permission"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Permission
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Permissions</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, description, or code..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilterChange}
                  placeholder="All statuses"
                >
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Type</Label>
                <Select
                  value={typeFilter}
                  onValueChange={handleTypeFilterChange}
                  placeholder="All types"
                >
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="true">System Permissions</SelectItem>
                  <SelectItem value="false">Custom Permissions</SelectItem>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={handleCategoryFilterChange}
                  placeholder="All categories"
                >
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DataContainer>
            <div className="p-0">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total || permissions.length}</p>
                </div>
              </div>
            </div>
          </DataContainer>

          <DataContainer>
            <div className="p-0">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
            </div>
          </DataContainer>

          <DataContainer>
            <div className="p-0">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.filter(p => p.is_system_permission).length}</p>
                </div>
              </div>
            </div>
          </DataContainer>

          <DataContainer>
            <div className="p-0">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Copy className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Custom Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.filter(p => !p.is_system_permission).length}</p>
                </div>
              </div>
            </div>
          </DataContainer>
        </div>

        {/* Table or Empty */}
        <DataContainer>
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Permissions Overview</h3>
            <p className="text-sm text-gray-600">
              {pagination.total} permissions found • Showing {pagination.current_page} of {pagination.last_page} pages
            </p>
          </div>

          {showEmpty ? (
            <EmptyState
              title="No permissions found"
              description="Try adjusting filters or create a new permission."
              actionText={can('permissions.create') ? 'Create Permission' : undefined}
              onAction={can('permissions.create') ? () => { setSelected(null); setShowCreate(true); } : undefined}
              className=""
            />
          ) : (
            <>
              <DataTable
                data={permissions}
                columns={columns}
                loading={getLoadingState('initial')}
                error={error}
                searchable={false}
                ariaLabel="Permissions management table"
                pagination={null}
                selectable={true}
                selectedItems={selectedPermissions}
                onSelectionChange={handleSelectionChange}
                selectAll={selectAll}
                onSelectAll={handleSelectAll}
              />

              {/* Pagination */}
              {pagination.total > 0 && (
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  totalItems={pagination.total}
                  perPage={pagination.per_page}
                  onPageChange={handlePageChange}
                  onPerPageChange={handlePerPageChange}
                  variant="table"
                  showPageNumbers={true}
                  showFirstLast={true}
                  showPrevNext={true}
                  showPerPageSelector={true}
                  perPageOptions={[5, 10, 15, 25, 50]}
                  maxVisiblePages={5}
                  ariaLabel="Permissions table pagination"
                />
              )}

              {/* Bulk Actions */}
              {selectedPermissions.length > 0 && (
                <div className="mt-4">
                  <PermissionBulkActions
                    selectedPermissions={selectedPermissions}
                    onSuccess={handleBulkActionSuccess}
                    onClearSelection={() => {
                      setSelectedPermissions([]);
                      setSelectAll(false);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </DataContainer>
      </div>

      {/* Create */}
      <CreatePermissionDialog open={showCreate} onOpenChange={setShowCreate} onSubmit={handleCreateSubmit} />

      {/* Edit */}
      <EditPermissionDialog open={showEdit} onOpenChange={setShowEdit} permission={selected} onSubmit={handleEditSubmit} />

      {/* Details */}
      <ViewPermissionDetailsDialog open={showDetails} onOpenChange={setShowDetails} permission={selected} onEdit={onEdit} onClone={onClone} onDelete={onAskDelete} />

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        permission={selected}
        loading={actionLoading}
      />

    </div>
  );
};

export default React.memo(PermissionList);
