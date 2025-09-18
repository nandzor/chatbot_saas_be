/**
 * Enhanced User List Page
 * User management dengan DataTable dan enhanced components (mirip RoleList)
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
import { toast } from 'react-hot-toast';
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
  Building2,
  Globe,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Mail,
  Shield,
  Clock
} from 'lucide-react';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import ViewUserDetailsDialog from './ViewUserDetailsDialog';
import UserPermissionsModal from './UserPermissionsModal';
import UserBulkActions from './UserBulkActions';
import UserManagementService from '@/services/UserManagementService';

const userManagementService = new UserManagementService();

const UserList = React.memo(() => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0
  });

  // Load users data from backend API
  const loadUsers = useCallback(async (customParams = {}) => {
    try {
      setLoading('initial', true);
      setError(null);

      const params = {
        page: customParams.page || pagination.currentPage,
        per_page: customParams.per_page || pagination.perPage,
        search: customParams.search !== undefined ? customParams.search : searchQuery,
        status: customParams.status !== undefined ? customParams.status : (statusFilter !== 'all' ? statusFilter : undefined),
        role: customParams.role !== undefined ? customParams.role : (roleFilter !== 'all' ? roleFilter : undefined),
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      const response = await userManagementService.getUsers(params);

      if (response.success) {
        setUsers(response.data || []);

        // Update pagination from response
        if (response.pagination) {
          console.log('Pagination data from API:', response.pagination);
          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination.current_page,
            total: response.pagination.total,
            lastPage: response.pagination.last_page
          }));
        }

        // Update statistics
        const stats = {
          total: response.pagination?.total || 0,
          active: response.data?.filter(u => u.status === 'active').length || 0,
          inactive: response.data?.filter(u => u.status === 'inactive').length || 0,
          admins: response.data?.filter(u => u.role === 'org_admin').length || 0
        };
        setStatistics(stats);

        announce('Users loaded successfully');
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'User Management Data Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [setLoading, announce, pagination.currentPage, pagination.perPage, searchQuery, statusFilter, roleFilter]);

  // Update filtered users when users change
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Load data when filters or pagination changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Loading users - isInitialLoad:', isInitialLoad);
      loadUsers({
        page: pagination.currentPage,
        per_page: pagination.perPage,
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined
      });

      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }, isInitialLoad ? 0 : 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, statusFilter, roleFilter, pagination.currentPage, pagination.perPage, isInitialLoad]);

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

  // Handle role filter change
  const handleRoleFilterChange = useCallback((value) => {
    console.log('Role filter changed to:', value);
    setRoleFilter(value);
    announce(`Filtering by role: ${value}`);
  }, [announce]);

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
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      announce('Users exported successfully');
    } catch (err) {
      handleError(err, { context: 'User Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  // Handle user actions
  const handleViewUser = useCallback((user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
    announce(`Viewing user: ${user.full_name}`);
  }, [announce]);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
    announce(`Editing user: ${user.full_name}`);
  }, [announce]);

  const handleDeleteUser = useCallback(async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the user "${user.full_name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setLoading('delete', true);

      const response = await userManagementService.deleteUser(user.id);

      if (response.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        announce(`User ${user.full_name} deleted successfully`);
        toast.success(`User ${user.full_name} deleted successfully`);
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'User Delete',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, announce]);

  const handleToggleStatus = useCallback(async (user) => {
    try {
      setLoading('toggle', true);

      const response = await userManagementService.toggleUserStatus(user.id);

      if (response.success) {
        setUsers(prev => prev.map(u =>
          u.id === user.id
            ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
            : u
        ));
        announce(`User ${user.full_name} status toggled successfully`);
        toast.success(`User ${user.full_name} status toggled successfully`);
      } else {
        throw new Error(response.message || 'Failed to toggle user status');
      }
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'User Status Toggle',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('toggle', false);
    }
  }, [setLoading, announce]);

  const handleManagePermissions = useCallback((user) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
    announce(`Managing permissions for: ${user.full_name}`);
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
              {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900 flex items-center space-x-2">
              {user.full_name}
              {user.is_admin && (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">@{user.username}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value}</span>
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
          {value ? value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
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
      key: 'last_active_at',
      title: 'Last Active',
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

  // Pagination handlers
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Kelola pengguna dan izin dalam organisasi Anda
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
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Debug pagination state */}
      {import.meta.env.DEV && (
        <div className="p-2 bg-gray-100 text-xs">
          <strong>Debug Pagination:</strong> Current: {pagination.currentPage},
          Total: {pagination.total}, LastPage: {pagination.lastPage},
          PerPage: {pagination.perPage}
        </div>
      )}

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={getLoadingState('initial')}
        error={error}
        searchable={false}
        ariaLabel="Users management table"
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
          ariaLabel="Users table pagination"
        />
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

      <UserPermissionsModal
        open={isPermissionsModalOpen}
        onOpenChange={setIsPermissionsModalOpen}
        user={selectedUser}
        onPermissionsUpdated={(updatedUser) => {
          setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
          announce('User permissions updated successfully');
        }}
      />
    </div>
  );
});

export default withErrorHandling(UserList, {
  context: 'User List Page'
});
