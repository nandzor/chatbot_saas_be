/**
 * Enhanced User Management Page
 * User management dengan DataTable dan enhanced components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  useLoadingStates
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
  sanitizeInput
} from '@/utils/securityUtils';
import {
  Users,
  User,
  UserPlus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  SelectItem,
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
  Skeleton,
  Alert,
  AlertDescription,
  DataTable,
  DataContainer,
  EmptyState,
  Pagination
} from '@/components/ui';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import ViewUserDetailsDialog from './ViewUserDetailsDialog';
import UserBulkActions from './UserBulkActions';
import { useUserManagement } from '@/hooks/useUserManagement';

const UserManagement = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // Use user management hook
  const {
    users,
    loading,
    error,
    pagination,
    filters,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    handlePageChange,
    handlePerPageChange,
    updateFilters
  } = useUserManagement();

  // Local UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  // Bulk selection handlers
  const handleSelectionChange = useCallback((selectedItems) => {
    setSelectedUsers(selectedItems);
  }, []);

  const handleSelectAll = useCallback((checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(users);
    } else {
      setSelectedUsers([]);
    }
  }, [users]);

  const handleBulkActionSuccess = useCallback(() => {
    // Hook will handle reloading
    setSelectedUsers([]);
    setSelectAll(false);
  }, []);

  // Header action handlers
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      // Hook will handle the actual refresh
      announce('Users refreshed successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'User Refresh',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('refresh', false);
    }
  }, [setLoading, announce]);

  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      announce('Users exported successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'User Export',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  // Load data on mount
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);
    updateFilters({ search: value });
  }, [updateFilters]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    updateFilters({ status: value === 'all' ? '' : value });
    announce(`Filtering by status: ${value}`);
  }, [updateFilters, announce]);

  // Handle role filter change
  const handleRoleFilterChange = useCallback((value) => {
    setRoleFilter(value);
    updateFilters({ role: value === 'all' ? '' : value });
    announce(`Filtering by role: ${value}`);
  }, [updateFilters, announce]);


  // Handle user actions
  const handleViewUser = useCallback((user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
    announce(`Viewing user: ${user.name}`);
  }, [announce]);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
    announce(`Editing user: ${user.name}`);
  }, [announce]);

  const handleDeleteUser = useCallback(async (user) => {
    try {
      setLoading('delete', true);

      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUsers(prev => prev.filter(u => u.id !== user.id));
      announce(`User ${user.name} deleted successfully`);
    } catch (err) {
      handleError(err, { context: 'User Delete' });
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, announce]);

  const handleCloneUser = useCallback((user) => {
    navigator.clipboard.writeText(user.email);
    announce(`User email copied: ${user.email}`);
  }, [announce]);

  const handleViewPermissions = useCallback((user) => {
    // TODO: Implement view permissions modal
    toast.info(`Viewing permissions for user: ${user.name}`);
    announce(`Viewing permissions for user: ${user.name}`);
  }, [announce]);

  const handleViewRoles = useCallback((user) => {
    // TODO: Implement view roles modal
    toast.info(`Viewing roles for user: ${user.name}`);
    announce(`Viewing roles for user: ${user.name}`);
  }, [announce]);

  // DataTable columns configuration
  const columns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (value) => (
        <Badge variant={value === 'admin' ? 'default' : value === 'manager' ? 'secondary' : 'outline'}>
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
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A'}
        </Badge>
      )
    },
    {
      key: 'organization',
      title: 'Organization',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
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
      render: (value, user) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewUser(user)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditUser(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCloneUser(user)}>
              <Copy className="mr-2 h-4 w-4" />
              Clone User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewPermissions(user)}>
              <Shield className="mr-2 h-4 w-4" />
              View Permissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewRoles(user)}>
              <Users className="mr-2 h-4 w-4" />
              View Roles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteUser(user)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
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

  // Loading state (skeleton) - AFTER all hooks
  if (loading && users.length === 0) {
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

  const showEmpty = !loading && users.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={focusRef}>
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={getLoadingState('refresh')}
            aria-label="Refresh users"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={getLoadingState('export')}
            aria-label="Export users"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            aria-label="Create new user"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
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
              <label className="text-sm font-medium">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or organization..."
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
              <label className="text-sm font-medium">Role</label>
              <Select
                value={roleFilter}
                onValueChange={handleRoleFilterChange}
                placeholder="All roles"
              >
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
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
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total || users.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
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
                <p className="text-sm font-medium text-gray-600">Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </div>
        </DataContainer>

        <DataContainer>
          <div className="p-0">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Regular Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'user').length}</p>
              </div>
            </div>
          </div>
        </DataContainer>
      </div>

      {/* Table or Empty */}
      <DataContainer>
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Users Overview</h3>
          <p className="text-sm text-gray-600">
            {pagination.total} users found • Showing {pagination.current_page} of {pagination.last_page} pages
          </p>
        </div>

        {showEmpty ? (
          <EmptyState
            title="No users found"
            description="Try adjusting filters or create a new user."
            actionText="Create User"
            onAction={() => setIsCreateDialogOpen(true)}
            className=""
          />
        ) : (
          <>
            <DataTable
              data={users}
              columns={columns}
              loading={loading}
              error={error}
              searchable={false} // We handle search in filters
              ariaLabel="Users management table"
              pagination={null}
              selectable={true}
              selectedItems={selectedUsers}
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
                ariaLabel="Users table pagination"
              />
            )}
          </>
        )}
      </DataContainer>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="mt-4">
          <UserBulkActions
            selectedUsers={selectedUsers}
            onSuccess={handleBulkActionSuccess}
            onClearSelection={() => {
              setSelectedUsers([]);
              setSelectAll(false);
            }}
          />
        </div>
      )}

      {/* Dialogs */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onUserCreated={(newUser) => {
          setUsers(prev => [...prev, newUser]);
          announce('New user created successfully');
        }}
      />

      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onUserUpdated={(updatedUser) => {
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          announce('User updated successfully');
        }}
      />

      <ViewUserDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        user={selectedUser}
      />
      </div>
    </div>
  );
};

export default withErrorHandling(UserManagement, {
  context: 'User Management Page'
});
