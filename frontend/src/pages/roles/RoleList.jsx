import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Settings
} from 'lucide-react';
import CreateRoleDialog from './CreateRoleDialog';
import ViewRoleDetailsDialog from './ViewRoleDetailsDialog';
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
  Skeleton
} from '@/components/ui';

const RoleList = () => {
  // State management
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination and filters
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    scope: '',
    is_active: '',
    is_system_role: '',
    level_min: '',
    level_max: ''
  });

  // Mock data for demonstration (replace with actual API calls)
  const mockRoles = useMemo(() => [
    {
      id: 1,
      name: 'Super Administrator',
      code: 'super_admin',
      display_name: 'Super Administrator',
      description: 'Full system access with all permissions and capabilities',
      scope: 'global',
      level: 100,
      is_system_role: true,
      is_default: false,
      is_active: true,
      current_users: 2,
      max_users: null,
      color: '#DC2626',
      icon: 'shield-check',
      badge_text: 'SUPER',
      metadata: {
        created_via: 'system',
        system_role: true,
        dangerous_role: true,
        permissions_count: 150
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'System Administrator',
      code: 'system_admin',
      display_name: 'System Administrator',
      description: 'System-wide administration and configuration management',
      scope: 'global',
      level: 90,
      is_system_role: true,
      is_default: false,
      is_active: true,
      current_users: 5,
      max_users: 10,
      color: '#2563EB',
      icon: 'settings',
      badge_text: 'SYS',
      metadata: {
        created_via: 'system',
        system_role: true,
        permissions_count: 120
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Organization Administrator',
      code: 'org_admin',
      display_name: 'Organization Administrator',
      description: 'Full organization access and management capabilities',
      scope: 'organization',
      level: 80,
      is_system_role: false,
      is_default: true,
      is_active: true,
      current_users: 15,
      max_users: 50,
      color: '#059669',
      icon: 'building',
      badge_text: 'ORG',
      metadata: {
        created_via: 'seeder',
        system_role: false,
        permissions_count: 85
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Agent Manager',
      code: 'agent_manager',
      display_name: 'Agent Manager',
      description: 'Manage agents and customer interaction workflows',
      scope: 'organization',
      level: 60,
      is_system_role: false,
      is_default: false,
      is_active: true,
      current_users: 8,
      max_users: 20,
      color: '#7C3AED',
      icon: 'users',
      badge_text: 'MGR',
      metadata: {
        created_via: 'seeder',
        system_role: false,
        permissions_count: 45
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      name: 'Customer Agent',
      code: 'customer_agent',
      display_name: 'Customer Agent',
      description: 'Handle customer chats and provide support services',
      scope: 'organization',
      level: 40,
      is_system_role: false,
      is_default: true,
      is_active: true,
      current_users: 45,
      max_users: 100,
      color: '#EA580C',
      icon: 'message-circle',
      badge_text: 'AGENT',
      metadata: {
        created_via: 'seeder',
        system_role: false,
        permissions_count: 25
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 6,
      name: 'Content Manager',
      code: 'content_manager',
      display_name: 'Content Manager',
      description: 'Manage knowledge base and content creation',
      scope: 'organization',
      level: 50,
      is_system_role: false,
      is_default: false,
      is_active: true,
      current_users: 12,
      max_users: 30,
      color: '#0891B2',
      icon: 'file-text',
      badge_text: 'CONTENT',
      metadata: {
        created_via: 'seeder',
        system_role: false,
        permissions_count: 35
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ], []);

  // Load roles with mock data
  const loadRoles = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter roles based on current filters
      let filteredRoles = [...mockRoles];

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredRoles = filteredRoles.filter(role =>
          role.name.toLowerCase().includes(searchTerm) ||
          role.code.toLowerCase().includes(searchTerm) ||
          role.description.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.scope) {
        filteredRoles = filteredRoles.filter(role => role.scope === filters.scope);
      }

      if (filters.is_active !== '') {
        filteredRoles = filteredRoles.filter(role => role.is_active === (filters.is_active === 'true'));
      }

      if (filters.is_system_role !== '') {
        filteredRoles = filteredRoles.filter(role => role.is_system_role === (filters.is_system_role === 'true'));
      }

      if (filters.level_min) {
        filteredRoles = filteredRoles.filter(role => role.level >= parseInt(filters.level_min));
      }

      if (filters.level_max) {
        filteredRoles = filteredRoles.filter(role => role.level <= parseInt(filters.level_max));
      }

      setRoles(filteredRoles);
      setPagination({
        current_page: page,
        last_page: Math.ceil(filteredRoles.length / pagination.per_page),
        per_page: pagination.per_page,
        total: filteredRoles.length
      });
    } catch (err) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page]);

  // Load roles on component mount and filter changes
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
    loadRoles(page);
  }, [loadRoles]);

  // Handle role actions
  const handleCreateRole = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleEditRole = useCallback((role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  }, []);

  const handleViewDetails = useCallback((role) => {
    setSelectedRole(role);
    setShowDetailsModal(true);
  }, []);

  const handleCreateRoleSubmit = useCallback(async (roleData) => {
    try {
      setActionLoading(true);
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new role with generated ID
      const newRole = {
        ...roleData,
        id: Math.max(...roles.map(r => r.id)) + 1,
        current_users: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setRoles(prev => [newRole, ...prev]);
      setShowCreateModal(false);

      // Show success message
      alert(`Role "${newRole.name}" has been created successfully`);
    } catch (error) {
      alert(`Failed to create role: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [roles]);

  const handleCloneRole = useCallback((role) => {
    setSelectedRole(role);
    // TODO: Implement clone functionality
    alert(`Clone role ${role.name} functionality will be implemented here`);
  }, []);

  const handleDeleteRole = useCallback(async (role) => {
    if (role.is_system_role) {
      alert('System roles cannot be deleted');
      return;
    }

    setSelectedRole(role);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteRole = useCallback(async () => {
    if (!selectedRole) return;

    try {
      setActionLoading(true);
      // TODO: Implement actual delete API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRoles(prev => prev.filter(role => role.id !== selectedRole.id));
      setShowDeleteConfirm(false);
      setSelectedRole(null);

      // Show success message
      alert(`Role "${selectedRole.name}" has been deleted successfully`);
    } catch (error) {
      alert(`Failed to delete role: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [selectedRole]);

  // Get scope icon and color
  const getScopeInfo = useCallback((scope) => {
    switch (scope) {
      case 'global':
        return { icon: Globe, color: 'bg-purple-100 text-purple-800', label: 'Global' };
      case 'organization':
        return { icon: Building2, color: 'bg-blue-100 text-blue-800', label: 'Organization' };
      case 'department':
        return { icon: Users, color: 'bg-green-100 text-green-800', label: 'Department' };
      case 'team':
        return { icon: UserCheck, color: 'bg-yellow-100 text-yellow-800', label: 'Team' };
      case 'personal':
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: 'Personal' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: scope };
    }
  }, []);

  // Loading state
  if (loading && roles.length === 0) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-gray-900">Role Management</CardTitle>
                <CardDescription>
                  Manage user roles, permissions, and access control across the system
                </CardDescription>
              </div>
              <Button onClick={handleCreateRole} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Role
              </Button>
            </div>
          </CardHeader>

          {/* Advanced Filters */}
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search roles by name, code, or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full"
                  icon={<Search className="w-4 h-4" />}
                />
              </div>

              <Select value={filters.scope} onValueChange={(value) => handleFilterChange('scope', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Scopes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Scopes</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.is_active} onValueChange={(value) => handleFilterChange('is_active', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.is_system_role} onValueChange={(value) => handleFilterChange('is_system_role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="true">System Roles</SelectItem>
                  <SelectItem value="false">Custom Roles</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.level_min} onValueChange={(value) => handleFilterChange('level_min', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Level</SelectItem>
                  {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(level => (
                    <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Roles</p>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Roles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roles.filter(role => role.is_active).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Roles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roles.filter(role => role.is_system_role).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {roles.reduce((sum, role) => sum + role.current_users, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles Overview</CardTitle>
            <CardDescription>
              {roles.length} roles found • Showing {pagination.current_page} of {pagination.last_page} pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scope & Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users & Limits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role) => {
                    const scopeInfo = getScopeInfo(role.scope);
                    const ScopeIcon = scopeInfo.icon;

                    return (
                      <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                              style={{ backgroundColor: role.color + '20' }}
                            >
                              <Shield className="w-5 h-5" style={{ color: role.color }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900">{role.name}</h3>
                                {role.is_system_role && (
                                  <Badge variant="destructive" className="text-xs">
                                    {role.badge_text}
                                  </Badge>
                                )}
                                {role.is_default && (
                                  <Badge variant="secondary" className="text-xs">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 font-mono">{role.code}</p>
                              <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={scopeInfo.color}>
                                <ScopeIcon className="w-3 h-3 mr-1" />
                                {scopeInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Level:</span>
                              <Badge variant="outline" className="font-mono">
                                {role.level}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-400">
                              {role.metadata?.permissions_count || 0} permissions
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Current:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {role.current_users}
                              </span>
                            </div>
                            {role.max_users && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Max:</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {role.max_users}
                                </span>
                              </div>
                            )}
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: role.max_users
                                    ? `${(role.current_users / role.max_users) * 100}%`
                                    : '100%'
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {role.is_active ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <TooltipProvider>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => handleViewDetails(role)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>

                                {!role.is_system_role && (
                                  <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Role
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => handleCloneRole(role)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Clone Role
                                </DropdownMenuItem>

                                {!role.is_system_role && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteRole(role)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Role
                                    </DropdownMenuItem>
                                  </>
                                )}
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
            {pagination.last_page > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                  {pagination.total} results
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === pagination.current_page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

            {/* Create Role Dialog */}
      <CreateRoleDialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRoleSubmit}
        loading={actionLoading}
      />

      {/* View Role Details Dialog */}
      <ViewRoleDetailsDialog
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        role={selectedRole}
        onEdit={handleEditRole}
        onClone={handleCloneRole}
        onDelete={handleDeleteRole}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Role</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the role <strong>"{selectedRole.name}"</strong>?
              This action cannot be undone and will affect all users assigned to this role.
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
                onClick={confirmDeleteRole}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Role'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleList;
