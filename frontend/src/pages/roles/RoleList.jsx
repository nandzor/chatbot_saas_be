/**
 * Enhanced Role List Page
 * Role management dengan DataTable dan enhanced components
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Alert,
  AlertDescription,
  Badge,
  Select,
  SelectItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DataTable,
  Pagination
} from '@/components/ui';
import {
  Shield,
  Users,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Eye,
  Copy,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Globe,
  UserCheck,
  Settings,
  BarChart3,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import CreateRoleDialog from './CreateRoleDialog';
import EditRoleDialog from './EditRoleDialog';
import ViewRoleDetailsDialog from './ViewRoleDetailsDialog';
import RolePermissionsModal from './RolePermissionsModal';
import RoleAssignmentModal from './RoleAssignmentModal';
import RoleBulkActions from './RoleBulkActions';
import { roleManagementService } from '@/services/RoleManagementService';

const RoleList = React.memo(() => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [error, setError] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10, // Set to 10 items per page
    total: 0,
    lastPage: 1
  });

  // Load roles data from backend API
  const loadRoles = useCallback(async (customParams = {}) => {
    try {
      setLoading('initial', true);
      setError(null);

      const params = {
        page: customParams.page || pagination.currentPage,
        per_page: customParams.per_page || pagination.perPage,
        search: customParams.search !== undefined ? customParams.search : searchQuery,
        scope: customParams.scope !== undefined ? customParams.scope : (typeFilter !== 'all' ? typeFilter : undefined),
        is_active: customParams.is_active !== undefined ? customParams.is_active : (statusFilter !== 'all' ? (statusFilter === 'active') : undefined),
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      const response = await roleManagementService.getRoles(params);

      if (response.success) {
        setRoles(response.data || []);

        // Update pagination from response
        if (response.pagination) {
          console.log('Pagination data from API:', response.pagination);
          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination.current_page,
            total: response.pagination.total,
            lastPage: response.pagination.last_page
          }));
        } else {
          console.log('No pagination data in response:', response);
        }

        announce('Roles loaded successfully');
      } else {
        throw new Error(response.message || 'Failed to load roles');
      }
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Role Management Data Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [setLoading, announce]);

  // Update filtered roles when roles change (backend handles filtering)
  useEffect(() => {
    setFilteredRoles(roles);
  }, [roles]);

  // Load data when filters or pagination changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Loading roles - isInitialLoad:', isInitialLoad);
      loadRoles({
        page: pagination.currentPage,
        per_page: pagination.perPage,
        search: searchQuery,
        scope: typeFilter !== 'all' ? typeFilter : undefined,
        is_active: statusFilter !== 'all' ? (statusFilter === 'active') : undefined
      });

      // Mark initial load as complete
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }, isInitialLoad ? 0 : 300); // No debounce for initial load

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, typeFilter, pagination.currentPage, pagination.perPage, isInitialLoad]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value) => {
    console.log('Status filter changed to:', value);
    setStatusFilter(value);
    announce(`Filtering by status: ${value}`);
  }, [announce]);

  // Handle type filter change
  const handleTypeFilterChange = useCallback((value) => {
    console.log('Type filter changed to:', value);
    setTypeFilter(value);
    announce(`Filtering by type: ${value}`);
  }, [announce]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await loadRoles();
      announce('Roles refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Role Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [loadRoles, setLoading, announce]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);

      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));

      announce('Roles exported successfully');
    } catch (err) {
      handleError(err, { context: 'Role Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  // Handle role actions
  const handleViewRole = useCallback((role) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
    announce(`Viewing role: ${role.name}`);
  }, [announce]);

  const handleEditRole = useCallback((role) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
    announce(`Editing role: ${role.name}`);
  }, [announce]);

  const handleDeleteRole = useCallback(async (role) => {
    try {
      setLoading('delete', true);

      const response = await roleManagementService.deleteRole(role.id);

      if (response.success) {
        setRoles(prev => prev.filter(r => r.id !== role.id));
        announce(`Role ${role.name} deleted successfully`);
      } else {
        throw new Error(response.message || 'Failed to delete role');
      }
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Role Delete',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, announce]);

  const handleManagePermissions = useCallback((role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
    announce(`Managing permissions for: ${role.name}`);
  }, [announce]);

  const handleAssignUsers = useCallback((role) => {
    setSelectedRole(role);
    setIsAssignmentModalOpen(true);
    announce(`Assigning users to: ${role.name}`);
  }, [announce]);

  const handleCopyRole = useCallback((role) => {
    navigator.clipboard.writeText(role.name);
    announce(`Role name copied: ${role.name}`);
  }, [announce]);

  // DataTable columns configuration (memoized to prevent re-renders)
  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'Role',
      sortable: true,
      render: (value, role) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center space-x-2">
              {value}
              {role.is_system_role && (
                <Badge variant="secondary" className="text-xs">
                  System
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">{role.description || 'No description'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'scope',
      title: 'Scope',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A'}
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
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </Badge>
      )
    },
    {
      key: 'users_count',
      title: 'Users',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'permissions_count',
      title: 'Permissions',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value || 0}</span>
        </div>
      )
    },
    {
      key: 'updated_at',
      title: 'Last Updated',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (value, role) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewRole(role)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditRole(role)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleManagePermissions(role)}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Permissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAssignUsers(role)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Assign Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyRole(role)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Name
            </DropdownMenuItem>
            {!role.is_system_role && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteRole(role)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Role
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [handleViewRole, handleEditRole, handleDeleteRole, handleManagePermissions, handleAssignUsers, handleCopyRole]);


  // Pagination handlers (memoized)
  const handlePageChange = useCallback((page) => {
    console.log('Page change requested:', page);
    setPagination(prev => {
      console.log('Previous pagination:', prev);
      const newPagination = { ...prev, currentPage: page };
      console.log('New pagination:', newPagination);
      return newPagination;
    });
  }, []);

  const handlePerPageChange = useCallback((newPerPage) => {
    console.log('Per page change requested:', newPerPage);
    setPagination(prev => {
      console.log('Previous pagination:', prev);
      const newPagination = { ...prev, perPage: newPerPage, currentPage: 1 };
      console.log('New pagination:', newPagination);
      return newPagination;
    });
    announce(`Changed to ${newPerPage} items per page`);
  }, [announce]);

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and access controls
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={getLoadingState('refresh')}
            aria-label="Refresh roles"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={getLoadingState('export')}
            aria-label="Export roles"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            aria-label="Create new role"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role
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
              <label className="text-sm font-medium">Search Roles</label>
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
              <label className="text-sm font-medium">Status</label>
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
              <label className="text-sm font-medium">Scope</label>
              <Select
                value={typeFilter}
                onValueChange={handleTypeFilterChange}
                placeholder="All scopes"
              >
                <SelectItem value="all">All Scopes</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRoles.length > 0 && (
        <RoleBulkActions
          selectedRoles={selectedRoles}
          onClearSelection={() => setSelectedRoles([])}
          onBulkAction={(action) => {
            announce(`Bulk action ${action} applied to ${selectedRoles.length} roles`);
          }}
        />
      )}

      {/* Debug pagination state */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 bg-gray-100 text-xs">
          <strong>Debug Pagination:</strong> Current: {pagination.currentPage},
          Total: {pagination.total}, LastPage: {pagination.lastPage},
          PerPage: {pagination.perPage}
        </div>
      )}

      {/* Roles Table */}
      <DataTable
        data={filteredRoles}
        columns={columns}
        loading={getLoadingState('initial')}
        error={error}
        searchable={false} // We handle search in filters
        ariaLabel="Roles management table"
        pagination={null}
      />

      {/* Pagination */}
      {pagination.total > pagination.perPage && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.lastPage}
          totalItems={pagination.total}
          perPage={pagination.perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          variant="table"
          showPageNumbers={true}
          showFirstLast={true}
          showPrevNext={true}
          showPerPageSelector={true}
          perPageOptions={[5, 10, 15, 25, 50]}
          maxVisiblePages={5}
          ariaLabel="Roles table pagination"
        />
      )}

      {/* Dialogs */}
      <CreateRoleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onRoleCreated={(newRole) => {
          setRoles(prev => [...prev, newRole]);
          announce('New role created successfully');
        }}
      />

      <EditRoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        role={selectedRole}
        onRoleUpdated={(updatedRole) => {
          setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
          announce('Role updated successfully');
        }}
      />

      <ViewRoleDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        role={selectedRole}
      />

      <RolePermissionsModal
        open={isPermissionsModalOpen}
        onOpenChange={setIsPermissionsModalOpen}
        role={selectedRole}
        onPermissionsUpdated={(updatedRole) => {
          setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
          announce('Role permissions updated successfully');
        }}
      />

      <RoleAssignmentModal
        open={isAssignmentModalOpen}
        onOpenChange={setIsAssignmentModalOpen}
        role={selectedRole}
        onUsersAssigned={(updatedRole) => {
          setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
          announce('Users assigned to role successfully');
        }}
      />
    </div>
  );
});

export default withErrorHandling(RoleList, {
  context: 'Role List Page'
});
