import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Globe,
  UserCheck,
  Settings,
  Key,
  Database,
  FileText,
  MessageSquare,
  BarChart3,
  CreditCard,
  Webhook,
  Workflow,
  Bot,
  Zap,
  Plus,
  Download,
  Upload
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
import CreateUserDialog from './CreateUserDialog';
import ViewUserDetailsDialog from './ViewUserDetailsDialog';
import EditUserDialog from './EditUserDialog';
import { useUserManagement } from '../../hooks/useUserManagement';

const UserManagement = () => {
  // Use the custom hook for user management
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
    toggleUserStatus,
    cloneUser,
    getUserStatistics,
    updateFilters,
    updatePagination
  } = useUserManagement();

  // Local state for UI
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    verifiedUsers: 0
  });

  // Refs to prevent multiple API calls
  const statisticsLoaded = useRef(false);
  const statisticsLoading = useRef(false);
  const componentMounted = useRef(false);

  // Load statistics on component mount (only once)
  useEffect(() => {
    let isMounted = true;

    const loadStatistics = async () => {
      // Prevent multiple simultaneous calls (including React StrictMode double mounting)
      if (statisticsLoading.current || statisticsLoaded.current || componentMounted.current) {
        console.log('🔍 UserManagement: Skipping statistics load - already loaded, loading, or component mounted');
        return;
      }

      componentMounted.current = true;
      statisticsLoading.current = true;
      console.log('🔍 UserManagement: Loading statistics...');

      try {
        const result = await getUserStatistics();
        if (isMounted && result.success) {
          setStatistics({
            totalUsers: result.data.total_users || 0,
            activeUsers: result.data.active_users || 0,
            pendingUsers: result.data.pending_users || 0,
            verifiedUsers: result.data.verified_users || 0
          });
          statisticsLoaded.current = true;
          console.log('✅ UserManagement: Statistics loaded successfully');
        }
      } catch (error) {
        console.error('❌ UserManagement: Failed to load statistics:', error);
      } finally {
        statisticsLoading.current = false;
      }
    };

    loadStatistics();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  // No need for local loadUsers function - using the hook's loadUsers

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
    }, 300); // 300ms debounce
  }, [updateFilters]);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    updatePagination({ currentPage: page });
  }, [updatePagination]);

  // Handle user actions
  const handleCreateUser = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  }, []);

  const handleViewDetails = useCallback((user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  }, []);

  const handleCloneUser = useCallback(async (user) => {
    const newEmail = prompt(`Enter new email for cloned user (${user.name}):`);
    if (!newEmail) return;

    try {
      setActionLoading(true);
      const result = await cloneUser(user.id, newEmail);

      if (result.success) {
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to clone user:', error);
    } finally {
      setActionLoading(false);
    }
  }, [cloneUser]);

  const handleDeleteUser = useCallback((user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const result = await deleteUser(selectedUser.id);

      if (result.success) {
        setShowDeleteConfirm(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedUser, deleteUser]);

  const handleCreateUserSubmit = useCallback(async (userData) => {
    try {
      setActionLoading(true);
      const result = await createUser(userData);

      if (result.success) {
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    } finally {
      setActionLoading(false);
    }
  }, [createUser]);

  const handleEditUserSubmit = useCallback(async (userData) => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      const result = await updateUser(selectedUser.id, userData);

      if (result.success) {
        setShowEditModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setActionLoading(false);
    }
  }, [selectedUser, updateUser]);

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'active':
        return { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' };
      case 'inactive':
        return { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' };
      case 'pending':
        return { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'suspended':
        return { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  // Get role info
  const getRoleInfo = (role) => {
    switch (role) {
      case 'super_admin':
        return { icon: Shield, color: 'bg-red-100 text-red-800', label: 'Super Admin' };
      case 'org_admin':
        return { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Org Admin' };
      case 'agent':
        return { icon: Users, color: 'bg-green-100 text-green-800', label: 'Agent' };
      case 'client':
        return { icon: UserCheck, color: 'bg-purple-100 text-purple-800', label: 'Client' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: role };
    }
  };

  // Statistics are now loaded from the API and stored in state

  // Debug logging
  console.log('🔍 UserManagement Component: Current state:', {
    users: users,
    usersLength: users.length,
    loading: loading,
    error: error,
    pagination: pagination,
    filters: filters
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
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
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users, roles, and permissions</p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalUsers}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Users</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.pendingUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.verifiedUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="org_admin">Org Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                <Select value={filters.organization} onValueChange={(value) => handleFilterChange('organization', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    <SelectItem value="TechCorp Inc.">TechCorp Inc.</SelectItem>
                    <SelectItem value="ClientCorp Ltd.">ClientCorp Ltd.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>
              Manage system users and their access permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Organization</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => {
                      const StatusIcon = getStatusInfo(user.status).icon;
                      const RoleIcon = getRoleInfo(user.role).icon;

                      return (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <p className="text-xs text-gray-400">{user.position}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Badge className={getRoleInfo(user.role).color}>
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {getRoleInfo(user.role).label}
                              </Badge>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <p className="text-sm text-gray-900">{user.organization}</p>
                              <p className="text-xs text-gray-500">{user.department}</p>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Badge className={getStatusInfo(user.status).color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {getStatusInfo(user.status).label}
                              </Badge>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-900">
                              {user.last_login ? (
                                <div>
                                  <p>{new Date(user.last_login).toLocaleDateString()}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(user.last_login).toLocaleTimeString()}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-400">Never</span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <TooltipProvider>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCloneUser(user)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Clone User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipProvider>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Users className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                          <p className="text-gray-500 mb-4">
                            {Object.values(filters).some(filter => filter !== 'all' && filter !== '')
                              ? 'Try adjusting your filters to see more results.'
                              : 'Get started by creating your first user.'
                            }
                          </p>
                          <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Create User
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-700">
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                  {pagination.totalItems} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <CreateUserDialog
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUserSubmit}
          loading={actionLoading}
        />

        {/* Edit User Dialog */}
        <EditUserDialog
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={selectedUser}
          onSubmit={handleEditUserSubmit}
          loading={actionLoading}
        />

        {/* View User Details Dialog */}
        <ViewUserDetailsDialog
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          user={selectedUser}
          onEdit={handleEditUser}
          onClone={handleCloneUser}
          onDelete={handleDeleteUser}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the user <strong>"{selectedUser.name}"</strong>?
                This action cannot be undone and will remove all access permissions.
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteUser}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
