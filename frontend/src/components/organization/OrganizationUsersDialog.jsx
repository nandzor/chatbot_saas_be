import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  UserCheck,
  UserX
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Pagination
} from '@/components/ui';
import { usePagination } from '@/hooks/usePagination';
import { useOrganizationUsers } from '@/hooks/useOrganizationUsers';

const OrganizationUsersDialog = ({
  isOpen,
  onClose,
  organization,
  onAddUser,
  onEditUser,
  onRemoveUser,
  onToggleUserStatus,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Use organization users hook
  const {
    users,
    loading: usersLoading,
    error: usersError,
    pagination,
    filters,
    loadUsers,
    addUser,
    removeUser,
    updateUser,
    toggleUserStatus,
    updateFilters,
    updatePagination,
    resetFilters
  } = useOrganizationUsers(organization?.id);

  // Handle search change
  const handleSearchChange = useCallback((value) => {
    updateFilters({ search: value });
  }, [updateFilters]);

  // Handle role filter change
  const handleRoleFilterChange = useCallback((value) => {
    updateFilters({ role: value });
  }, [updateFilters]);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value) => {
    updateFilters({ status: value });
  }, [updateFilters]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !filters.search ||
      user.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus = filters.status === 'all' || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get status info
  const getStatusInfo = (status) => {
    const statusMap = {
      active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      suspended: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Suspended' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };
    return statusMap[status] || { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  };

  // Get role info
  const getRoleInfo = (role) => {
    const roleMap = {
      org_admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin' },
      agent: { color: 'bg-blue-100 text-blue-800', label: 'Agent' },
      viewer: { color: 'bg-gray-100 text-gray-800', label: 'Viewer' }
    };
    return roleMap[role] || { color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle user selection
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action) => {
    // Implement bulk actions
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('all');
      setSelectedUsers([]);
      resetFilters();
    }
  }, [isOpen, resetFilters]);

  if (!isOpen || !organization) return null;

  const tabs = [
    { id: 'all', label: 'All Users', count: users.length },
    { id: 'active', label: 'Active', count: users.filter(u => u.status === 'active').length },
    { id: 'inactive', label: 'Inactive', count: users.filter(u => u.status === 'inactive').length },
    { id: 'pending', label: 'Pending', count: users.filter(u => u.status === 'pending').length }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Users</h2>
              <p className="text-sm text-gray-500">{organization.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => onAddUser(organization)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b flex-shrink-0">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                <Badge variant="outline" className="text-xs">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Filters and Search */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.role} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="org_admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">
                {selectedUsers.length} user(s) selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
              >
                <UserX className="h-4 w-4 mr-1" />
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const statusInfo = getStatusInfo(user.status);
                      const roleInfo = getRoleInfo(user.role);
                      const isSelected = selectedUsers.includes(user.id);

                      return (
                        <TableRow key={user.id} className={isSelected ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleUserSelect(user.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-white">
                                  {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{user.full_name || 'N/A'}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${roleInfo.color} text-xs`}>
                              {roleInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusInfo.color} text-xs`}>
                              <statusInfo.icon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDate(user.last_login)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {formatDate(user.created_at)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEditUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onToggleUserStatus(user)}>
                                  {user.status === 'active' ? (
                                    <>
                                      <UserX className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onRemoveUser(organization, user)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500 mb-4">
                          {filters.search || filters.role !== 'all' || filters.status !== 'all'
                            ? 'No users match your current filters.'
                            : 'This organization doesn\'t have any users yet.'
                          }
                        </p>
                        <Button onClick={() => onAddUser(organization)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination && pagination.total > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                totalItems={pagination.total}
                perPage={pagination.per_page}
                onPageChange={(page) => updatePagination({ current_page: page })}
                showPageInfo={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationUsersDialog;
