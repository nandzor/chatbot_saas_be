/**
 * Enhanced User List Page
 * User management dengan DataTable dan enhanced components (mirip RoleList)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
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
  Pagination,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui';
import {
  Users,
  User,
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
  UserCheck,
  UserX,
  Settings,
  Download,
  RefreshCw,
  Shield,
  Clock
} from 'lucide-react';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import ViewUserDetailsDialog from './ViewUserDetailsDialog';
import UserPermissionsModal from './UserPermissionsModal';
import UserBulkActions from './UserBulkActions';
import { useOrgUserManagement } from '@/hooks/useOrgUserManagement';

const UserList = React.memo(() => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // Use org user management hook
  const {
    users,
    loading,
    error,
    pagination,
    statistics,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    updateFilters,
    handlePageChange,
    handlePerPageChange
  } = useOrgUserManagement();

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
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
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

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await loadUsers();
      announce('Users refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'User Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [loadUsers, setLoading, announce]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);

      // Create CSV content
      const csvContent = [
        ['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created At'],
        ...users.map(user => [
          user.name || '',
          user.email || '',
          user.role || '',
          user.status || '',
          user.last_login ? new Date(user.last_login).toLocaleDateString() : '',
          user.created_at ? new Date(user.created_at).toLocaleDateString() : ''
        ])
      ].map(row => row.join(',')).join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      announce('Users exported successfully');
      toast.success('Users exported successfully');
    } catch (err) {
      handleError(err, { context: 'User Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce, users]);

  // Handle user actions
  const handleViewUser = useCallback((user, e) => {
    e?.stopPropagation();
    setSelectedUser(user);
    setIsViewDialogOpen(true);
    announce(`Viewing user: ${user.name}`);
  }, [announce]);

  const handleEditUser = useCallback((user, e) => {
    e?.stopPropagation();
    setSelectedUser(user);
    setIsEditDialogOpen(true);
    announce(`Editing user: ${user.name}`);
  }, [announce]);

  const handleDeleteUser = useCallback(async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the user "${user.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading('delete', true);
      await deleteUser(user.id);
      announce(`User ${user.name} deleted successfully`);
    } catch (err) {
      handleError(err, { context: 'User Delete' });
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, announce, deleteUser]);

  const handleToggleStatus = useCallback(async (user) => {
    try {
      setLoading('toggle', true);
      await toggleUserStatus(user.id);
      announce(`User ${user.name} status toggled successfully`);
    } catch (err) {
      handleError(err, { context: 'User Status Toggle' });
    } finally {
      setLoading('toggle', false);
    }
  }, [setLoading, announce, toggleUserStatus]);

  const handleManagePermissions = useCallback((user) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
    announce(`Managing permissions for: ${user.name}`);
  }, [announce]);

  const handleCopyUser = useCallback((user) => {
    navigator.clipboard.writeText(user.email);
    announce(`User email copied: ${user.email}`);
  }, [announce]);

  // DataTable columns configuration
  const columns = useMemo(() => [
    {
      key: 'user',
      title: 'User',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>
              {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 flex items-center space-x-2">
              {user.name}
              {user.role === 'org_admin' && (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
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
        <Badge variant={value === 'org_admin' ? 'default' : 'outline'}>
          {value === 'org_admin' ? (
            <Shield className="w-3 h-3 mr-1" />
          ) : (
            <User className="w-3 h-3 mr-1" />
          )}
          {value ? value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'No Role'}
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
      key: 'last_login',
      title: 'Last Login',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {value ? new Date(value).toLocaleDateString() : 'Never'}
          </span>
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
            <DropdownMenuItem onClick={() => handleManagePermissions(user)}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Permissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
              {user.status === 'active' ? (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyUser(user)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Email
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
  ], [handleViewUser, handleEditUser, handleDeleteUser, handleToggleStatus, handleManagePermissions, handleCopyUser]);


  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  // Loading state (skeleton) - AFTER all hooks
  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 w-full bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const showEmpty = !loading && users.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" ref={focusRef}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Kelola pengguna dan izin dalam organisasi Anda
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">
              All users in organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Inactive users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.admins}</div>
            <p className="text-xs text-muted-foreground">
              Users with admin access
            </p>
          </CardContent>
        </Card>
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
                  placeholder="Search by name, email, or username..."
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
                <SelectItem value="pending">Pending</SelectItem>
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
                <SelectItem value="org_admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <UserBulkActions
          selectedUsers={selectedUsers}
          onClearSelection={() => setSelectedUsers([])}
          onBulkAction={(action) => {
            announce(`Bulk action ${action} applied to ${selectedUsers.length} users`);
          }}
        />
      )}


      {/* Table or Empty */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                {pagination.totalItems} users found • Showing {pagination.currentPage} of {pagination.totalPages} pages
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showEmpty ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-sm text-gray-500 mb-4">Try adjusting filters or create a new user.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          ) : (
            <DataTable
              data={users}
              columns={columns}
              loading={loading}
              error={error}
              searchable={false}
              ariaLabel="Users management table"
              pagination={null}
              selectable={true}
              selectedItems={selectedUsers}
              onSelectionChange={handleSelectionChange}
              selectAll={selectAll}
              onSelectAll={handleSelectAll}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!showEmpty && pagination.totalItems > pagination.perPage && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
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
          ariaLabel="Users table pagination"
        />
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="mt-4">
          <UserBulkActions
            selectedUsers={selectedUsers}
            onSuccess={() => {
              setSelectedUsers([]);
              setSelectAll(false);
            }}
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
        onUserCreated={async (newUser) => {
          try {
            await createUser(newUser);
            announce('New user created successfully');
            setIsCreateDialogOpen(false);
          } catch (err) {
            // Error already handled in hook
          }
        }}
      />

      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onUserUpdated={async (updatedUser) => {
          try {
            await updateUser(updatedUser.id, updatedUser);
            announce('User updated successfully');
            setIsEditDialogOpen(false);
          } catch (err) {
            // Error already handled in hook
          }
        }}
      />

      <ViewUserDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        user={selectedUser}
      />

      <UserPermissionsModal
        open={isPermissionsModalOpen}
        onOpenChange={setIsPermissionsModalOpen}
        user={selectedUser}
        onPermissionsUpdated={async (updatedUser) => {
          try {
            await updateUser(updatedUser.id, updatedUser);
            announce('User permissions updated successfully');
            setIsPermissionsModalOpen(false);
          } catch (err) {
            // Error already handled in hook
          }
        }}
      />
      </div>
    </div>
  );
});

UserList.displayName = 'UserList';

const EnhancedUserList = withErrorHandling(UserList, {
  context: 'User List Page'
});

export default EnhancedUserList;
