/**
 * Enhanced Permission Management Page
 * Permission management dengan DataTable dan enhanced components
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FileText,
  Filter,
  RefreshCw
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
  Switch,
  Alert,
  AlertDescription,
  DataTable
} from '@/components/ui';
import CreatePermissionDialog from './CreatePermissionDialog';
import EditPermissionDialog from './EditPermissionDialog';
import ViewPermissionDetailsDialog from './ViewPermissionDetailsDialog';

const PermissionManagement = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Sample data - in production, this would come from API
  const samplePermissions = useMemo(() => [
    {
      id: 1,
      name: 'user.read',
      displayName: 'Read Users',
      description: 'View user information and profiles',
      category: 'users',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      assignedRoles: ['admin', 'manager'],
      resource: 'users',
      action: 'read'
    },
    {
      id: 2,
      name: 'user.write',
      displayName: 'Write Users',
      description: 'Create, update, and modify user information',
      category: 'users',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      assignedRoles: ['admin'],
      resource: 'users',
      action: 'write'
    },
    {
      id: 3,
      name: 'permission.read',
      displayName: 'Read Permissions',
      description: 'View permission information and assignments',
      category: 'permissions',
      status: 'active',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-14T15:45:00Z',
      assignedRoles: ['admin', 'manager'],
      resource: 'permissions',
      action: 'read'
    },
    {
      id: 4,
      name: 'system.settings',
      displayName: 'System Settings',
      description: 'Access and modify system configuration',
      category: 'system',
      status: 'active',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-13T09:15:00Z',
      assignedRoles: ['admin'],
      resource: 'system',
      action: 'manage'
    }
  ], []);

  // Load permissions data
  const loadPermissions = useCallback(async () => {
    try {
      setLoading('initial', true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPermissions(samplePermissions);
      announce('Permissions loaded successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Permission Management Data Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [samplePermissions, setLoading, announce]);

  // Filter permissions based on search and filters
  const filterPermissions = useCallback(() => {
    let filtered = permissions;

    // Search filter
    if (searchQuery) {
      const sanitizedQuery = sanitizeInput(searchQuery.toLowerCase());
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(sanitizedQuery) ||
        permission.displayName.toLowerCase().includes(sanitizedQuery) ||
        permission.description.toLowerCase().includes(sanitizedQuery)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(permission => permission.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(permission => permission.status === statusFilter);
    }

    setFilteredPermissions(filtered);
  }, [permissions, searchQuery, categoryFilter, statusFilter]);

  // Load data on mount
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Filter permissions when filters change
  useEffect(() => {
    filterPermissions();
  }, [filterPermissions]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);
  }, []);

  // Handle category filter change
  const handleCategoryFilterChange = useCallback((value) => {
    setCategoryFilter(value);
    announce(`Filtering by category: ${value}`);
  }, [announce]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    announce(`Filtering by status: ${value}`);
  }, [announce]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await loadPermissions();
      announce('Permissions refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Permission Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [loadPermissions, setLoading, announce]);

  // Handle export
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

  // Handle permission actions
  const handleViewPermission = useCallback((permission) => {
    setSelectedPermission(permission);
    setIsViewDialogOpen(true);
    announce(`Viewing permission: ${permission.displayName}`);
  }, [announce]);

  const handleEditPermission = useCallback((permission) => {
    setSelectedPermission(permission);
    setIsEditDialogOpen(true);
    announce(`Editing permission: ${permission.displayName}`);
  }, [announce]);

  const handleDeletePermission = useCallback(async (permission) => {
    try {
      setLoading('delete', true);

      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPermissions(prev => prev.filter(p => p.id !== permission.id));
      announce(`Permission ${permission.displayName} deleted successfully`);
    } catch (err) {
      handleError(err, { context: 'Permission Delete' });
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, announce]);

  const handleCopyPermission = useCallback((permission) => {
    navigator.clipboard.writeText(permission.name);
    announce(`Permission name copied: ${permission.name}`);
  }, [announce]);

  // DataTable columns configuration
  const columns = [
    {
      key: 'name',
      title: 'Permission',
      sortable: true,
      render: (value, permission) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{permission.displayName}</div>
            <div className="text-sm text-gray-500 font-mono">{permission.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      title: 'Description',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {value}
        </div>
      )
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'active' ? 'default' : 'destructive'}>
          {value === 'active' ? (
            <CheckCircle className="w-3 h-3 mr-1" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'assignedRoles',
      title: 'Assigned Roles',
      sortable: false,
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.map((role, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {role}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'updatedAt',
      title: 'Last Updated',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
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
            <DropdownMenuItem onClick={() => handleEditPermission(permission)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Permission
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyPermission(permission)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Name
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeletePermission(permission)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permission
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
          <p className="text-muted-foreground">
            Manage system permissions and access controls
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
            onClick={() => setIsCreateDialogOpen(true)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Permissions</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="permissions">Permissions</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Table */}
      <DataTable
        data={filteredPermissions}
        columns={columns}
        loading={getLoadingState('initial')}
        error={error}
        searchable={false} // We handle search in filters
        ariaLabel="Permissions management table"
        pagination={{
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          onNext: () => {},
          onPrevious: () => {}
        }}
      />

      {/* Dialogs */}
      <CreatePermissionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPermissionCreated={(newPermission) => {
          setPermissions(prev => [...prev, newPermission]);
          announce('New permission created successfully');
        }}
      />

      <EditPermissionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        permission={selectedPermission}
        onPermissionUpdated={(updatedPermission) => {
          setPermissions(prev => prev.map(p => p.id === updatedPermission.id ? updatedPermission : p));
          announce('Permission updated successfully');
        }}
      />

      <ViewPermissionDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        permission={selectedPermission}
      />
    </div>
  );
};

export default withErrorHandling(PermissionManagement, {
  context: 'Permission Management Page'
});
