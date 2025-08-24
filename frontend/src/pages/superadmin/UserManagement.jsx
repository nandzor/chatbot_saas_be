import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
    organization: 'all',
    department: 'all'
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Mock data for demonstration
  const mockUsers = useMemo(() => [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      avatar: null,
      status: 'active',
      role: 'super_admin',
      organization: 'TechCorp Inc.',
      department: 'IT',
      position: 'Chief Technology Officer',
      location: 'San Francisco, CA',
      timezone: 'America/Los_Angeles',
      last_login: '2024-01-25 14:30:00',
      created_at: '2023-01-15 10:00:00',
      updated_at: '2024-01-25 14:30:00',
      is_verified: true,
      is_2fa_enabled: true,
      login_count: 156,
      permissions: ['users.manage', 'roles.manage', 'system.admin'],
      metadata: {
        employee_id: 'EMP001',
        hire_date: '2023-01-15',
        manager: 'CEO',
        cost_center: 'IT-001'
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0124',
      avatar: null,
      status: 'active',
      role: 'org_admin',
      organization: 'TechCorp Inc.',
      department: 'HR',
      position: 'HR Director',
      location: 'New York, NY',
      timezone: 'America/New_York',
      last_login: '2024-01-24 09:15:00',
      created_at: '2023-03-20 14:30:00',
      updated_at: '2024-01-24 09:15:00',
      is_verified: true,
      is_2fa_enabled: false,
      login_count: 89,
      permissions: ['users.view', 'hr.manage'],
      metadata: {
        employee_id: 'EMP002',
        hire_date: '2023-03-20',
        manager: 'COO',
        cost_center: 'HR-001'
      }
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1-555-0125',
      avatar: null,
      status: 'inactive',
      role: 'agent',
      organization: 'TechCorp Inc.',
      department: 'Support',
      position: 'Support Specialist',
      location: 'Austin, TX',
      timezone: 'America/Chicago',
      last_login: '2024-01-20 16:45:00',
      created_at: '2023-06-10 11:00:00',
      updated_at: '2024-01-20 16:45:00',
      is_verified: true,
      is_2fa_enabled: false,
      login_count: 45,
      permissions: ['support.view', 'tickets.manage'],
      metadata: {
        employee_id: 'EMP003',
        hire_date: '2023-06-10',
        manager: 'Support Manager',
        cost_center: 'SUP-001'
      }
    },
    {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      phone: '+1-555-0126',
      avatar: null,
      status: 'active',
      role: 'client',
      organization: 'ClientCorp Ltd.',
      department: 'Marketing',
      position: 'Marketing Manager',
      location: 'London, UK',
      timezone: 'Europe/London',
      last_login: '2024-01-25 12:00:00',
      created_at: '2023-08-15 09:00:00',
      updated_at: '2024-01-25 12:00:00',
      is_verified: true,
      is_2fa_enabled: true,
      login_count: 67,
      permissions: ['dashboard.view', 'reports.view'],
      metadata: {
        client_id: 'CLI001',
        contract_start: '2023-08-15',
        account_manager: 'John Doe',
        subscription_plan: 'Enterprise'
      }
    },
    {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie.wilson@example.com',
      phone: '+1-555-0127',
      avatar: null,
      status: 'pending',
      role: 'agent',
      organization: 'TechCorp Inc.',
      department: 'Sales',
      position: 'Sales Representative',
      location: 'Chicago, IL',
      timezone: 'America/Chicago',
      last_login: null,
      created_at: '2024-01-20 15:00:00',
      updated_at: '2024-01-20 15:00:00',
      is_verified: false,
      is_2fa_enabled: false,
      login_count: 0,
      permissions: ['sales.view'],
      metadata: {
        employee_id: 'EMP004',
        hire_date: '2024-01-20',
        manager: 'Sales Manager',
        cost_center: 'SAL-001'
      }
    }
  ], []);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Apply filters
      let filteredUsers = [...mockUsers];

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.organization.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === filters.status);
      }

      if (filters.role !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.role === filters.role);
      }

      if (filters.organization !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.organization === filters.organization);
      }

      if (filters.department !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.department === filters.department);
      }

      setUsers(filteredUsers);
      setPagination(prev => ({
        ...prev,
        totalItems: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / prev.itemsPerPage)
      }));
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load users on component mount and filter changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle filter changes
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

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

  const handleCloneUser = useCallback((user) => {
    // TODO: Implement user cloning
    alert(`Cloning user: ${user.name}`);
  }, []);

  const handleDeleteUser = useCallback((user) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setShowDeleteConfirm(false);
      setSelectedUser(null);

      alert(`User "${selectedUser.name}" has been deleted successfully`);
    } catch (error) {
      alert(`Failed to delete user: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [selectedUser]);

  const handleCreateUserSubmit = useCallback(async (userData) => {
    try {
      setActionLoading(true);
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new user with generated ID
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        login_count: 0,
        permissions: userData.permissions || [],
        metadata: {
          ...userData.metadata,
          employee_id: `EMP${String(Math.max(...users.map(u => parseInt(u.metadata?.employee_id?.replace('EMP', '') || '0'))) + 1).padStart(3, '0')}`
        }
      };

      setUsers(prev => [newUser, ...prev]);
      setShowCreateModal(false);

      // Show success message
      alert(`User "${newUser.name}" has been created successfully`);
    } catch (error) {
      alert(`Failed to create user: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [users]);

  const handleEditUserSubmit = useCallback(async (userData) => {
    try {
      setActionLoading(true);
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUsers(prev => prev.map(user =>
        user.id === selectedUser.id
          ? { ...user, ...userData, updated_at: new Date().toISOString() }
          : user
      ));

      setShowEditModal(false);
      setSelectedUser(null);

      alert(`User "${userData.name}" has been updated successfully`);
    } catch (error) {
      alert(`Failed to update user: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [selectedUser]);

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

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    const pendingUsers = users.filter(user => user.status === 'pending').length;
    const verifiedUsers = users.filter(user => user.is_verified).length;

    return { totalUsers, activeUsers, pendingUsers, verifiedUsers };
  }, [users]);

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
                <Button onClick={loadUsers}>Try Again</Button>
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
                  {users.map((user) => {
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
                  })}
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
