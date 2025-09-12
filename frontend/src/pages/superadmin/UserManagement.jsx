import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Users,
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
  Clock,
  UserCheck,
  Settings,
  Download,
  Upload,
  X
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
import { useUserManagement } from '@/hooks/useUserManagement';
import userManagementService from '@/services/UserManagementService';

// Import Pagination Library
import {
  Pagination
} from '@/pagination';

// Constants
const DEBOUNCE_DELAY = 300;
const INITIAL_STATISTICS = {
  totalUsers: 0,
  activeUsers: 0,
  pendingUsers: 0,
  verifiedUsers: 0
};

const STATUS_MAP = {
  active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
  inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
  suspended: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' }
};

const ROLE_MAP = {
  super_admin: { icon: Shield, color: 'bg-red-100 text-red-800', label: 'Super Admin' },
  org_admin: { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Org Admin' },
  agent: { icon: Users, color: 'bg-green-100 text-green-800', label: 'Agent' },
  client: { icon: UserCheck, color: 'bg-purple-100 text-purple-800', label: 'Client' }
};

const DEFAULT_STATUS_INFO = { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };

// Custom hook for statistics management
const useStatistics = () => {
  const [statistics, setStatistics] = useState(INITIAL_STATISTICS);
  const [loading, setLoading] = useState(true);
  const loaded = useRef(false);
  const loadingRef = useRef(false);

  const loadStatistics = useCallback(async () => {
    if (loadingRef.current || loaded.current) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await userManagementService.getUserStatistics();

      if (result.success) {
        const statisticsData = {
          totalUsers: result.data.total_users || 0,
          activeUsers: result.data.active_users || 0,
          pendingUsers: result.data.inactive_users || result.data.unverified_users || 0,
          verifiedUsers: result.data.verified_users || 0
        };

        setStatistics(statisticsData);
        loaded.current = true;
      } else {
      }
    } catch (error) {
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return { statistics, loading, loadStatistics };
};

// Custom hook for user actions
const useUserActions = (users, { createUser, updateUser, deleteUser, cloneUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
    } finally {
      setActionLoading(false);
    }
  }, [selectedUser, updateUser]);

  return {
    selectedUser,
    showCreateModal,
    showEditModal,
    showDetailsModal,
    showDeleteConfirm,
    actionLoading,
    setShowCreateModal,
    setShowEditModal,
    setShowDetailsModal,
    setShowDeleteConfirm,
    handleCreateUser,
    handleEditUser,
    handleViewDetails,
    handleCloneUser,
    handleDeleteUser,
    confirmDeleteUser,
    handleCreateUserSubmit,
    handleEditUserSubmit
  };
};

const UserManagement = () => {
  // Use the custom hook for user management with its built-in pagination
  const {
    users,
    loading: originalLoading,
    error,
    pagination: hookPagination,
    filters,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    cloneUser,
    getUserStatistics,
    updateFilters,
    updatePagination: updateHookPagination
  } = useUserManagement();

  // Custom hooks
  const { statistics, loading: statisticsLoading } = useStatistics();
  const userActions = useUserActions(users, { createUser, updateUser, deleteUser, cloneUser });

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

  // Enhanced pagination handlers
  const handlePageChange = useCallback((page) => {
    updateHookPagination({ currentPage: page });
  }, [updateHookPagination]);

  const handlePerPageChange = useCallback((perPage) => {
    updateHookPagination({ itemsPerPage: perPage });
  }, [updateHookPagination]);



  // Memoized status and role info functions
  const getStatusInfo = useCallback((status) => {
    return STATUS_MAP[status] || { ...DEFAULT_STATUS_INFO, label: status };
  }, []);

  const getRoleInfo = useCallback((role) => {
    return ROLE_MAP[role] || { ...DEFAULT_STATUS_INFO, label: role };
  }, []);

  // Memoized statistics cards to prevent unnecessary re-renders
  const statisticsCards = useMemo(() => [
    {
      title: 'Total Users',
      value: statistics.totalUsers,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: statistics.activeUsers,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Pending Users',
      value: statistics.pendingUsers,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Verified Users',
      value: statistics.verifiedUsers,
      icon: Shield,
      color: 'purple',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ], [statistics]);

  if (originalLoading) {
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadUsers(true);
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
            <Button onClick={userActions.handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {statisticsCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-2 ${card.bgColor} rounded-lg`}>
                      <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      {statisticsLoading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
                    type="text"
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => {
                      e.preventDefault();
                      handleFilterChange('search', e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                      }
                    }}
                    className="pl-10 pr-10"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFilterChange('search', '');
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
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

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {Object.values(filters).some(filter => filter !== 'all' && filter !== '')
                      ? 'Filters applied'
                      : 'No filters applied'
                    }
                  </span>
                  {Object.values(filters).some(filter => filter !== 'all' && filter !== '') && (
                    <Badge variant="secondary" className="text-xs">
                      {Object.values(filters).filter(filter => filter !== 'all' && filter !== '').length} active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Per page:</span>
                  <Select
                    value={(hookPagination.itemsPerPage || 10).toString()}
                    onValueChange={(value) => handlePerPageChange(parseInt(value))}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateHookPagination({ currentPage: 1 });
                    updateFilters({
                      search: '',
                      status: 'all',
                      role: 'all',
                      organization: 'all',
                      department: 'all'
                    });
                  }}
                  className="text-gray-600"
                >
                  Reset All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateFilters({
                      search: '',
                      status: 'all',
                      role: 'all',
                      organization: 'all',
                      department: 'all'
                    });
                  }}
                  className="text-gray-600"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Users
                </CardTitle>
                <CardDescription>
                  Manage system users and their access permissions
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {originalLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading users...
                  </div>
                )}
                {(hookPagination.totalPages || 1) > 1 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange((hookPagination.currentPage || 1) - 1)}
                      disabled={(hookPagination.currentPage || 1) <= 1 || originalLoading}
                    >
                      ←
                    </Button>
                    <span className="text-xs">
                      {hookPagination.currentPage || 1} / {hookPagination.totalPages || 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePageChange((hookPagination.currentPage || 1) + 1)}
                      disabled={(hookPagination.currentPage || 1) >= (hookPagination.totalPages || 1) || originalLoading}
                    >
                      →
                    </Button>
                  </div>
                )}
              </div>
            </div>
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
                      const statusInfo = getStatusInfo(user.status);
                      const roleInfo = getRoleInfo(user.role);
                      const StatusIcon = statusInfo.icon;
                      const RoleIcon = roleInfo.icon;

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
                              <Badge className={roleInfo.color}>
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {roleInfo.label}
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
                              <Badge className={statusInfo.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
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
                                  <DropdownMenuItem onClick={() => userActions.handleViewDetails(user)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => userActions.handleEditUser(user)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => userActions.handleCloneUser(user)}>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Clone User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => userActions.handleDeleteUser(user)}
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
                          <Button onClick={userActions.handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
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

            {/* Enhanced Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={hookPagination.currentPage || 1}
                totalPages={hookPagination.totalPages || 1}
                totalItems={hookPagination.totalItems || users.length}
                perPage={hookPagination.itemsPerPage || 10}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                variant="table"
                size="sm"
                loading={originalLoading}
                perPageOptions={[10, 25, 50, 100, 200]}
                maxVisiblePages={7}
                className="border-t pt-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <CreateUserDialog
          isOpen={userActions.showCreateModal}
          onClose={() => userActions.setShowCreateModal(false)}
          onSubmit={userActions.handleCreateUserSubmit}
          loading={userActions.actionLoading}
        />

        {/* Edit User Dialog */}
        <EditUserDialog
          isOpen={userActions.showEditModal}
          onClose={() => userActions.setShowEditModal(false)}
          user={userActions.selectedUser}
          onSubmit={userActions.handleEditUserSubmit}
          loading={userActions.actionLoading}
        />

        {/* View User Details Dialog */}
        <ViewUserDetailsDialog
          isOpen={userActions.showDetailsModal}
          onClose={() => userActions.setShowDetailsModal(false)}
          user={userActions.selectedUser}
          onEdit={userActions.handleEditUser}
          onClone={userActions.handleCloneUser}
          onDelete={userActions.handleDeleteUser}
        />

        {/* Delete Confirmation Modal */}
        {userActions.showDeleteConfirm && userActions.selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the user <strong>"{userActions.selectedUser.name}"</strong>?
                This action cannot be undone and will remove all access permissions.
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => userActions.setShowDeleteConfirm(false)}
                  disabled={userActions.actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={userActions.confirmDeleteUser}
                  disabled={userActions.actionLoading}
                >
                  {userActions.actionLoading ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics (Development Only) */}
        {import.meta.env.DEV && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Pagination Performance Metrics</CardTitle>
              <CardDescription className="text-xs">
                Development mode - Performance monitoring for pagination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 text-sm">
                Performance metrics removed - using lightweight pagination library
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
