import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  UserPlus,
  Key,
  Archive,
  Download
} from 'lucide-react';
import CreateRoleDialog from './CreateRoleDialog';
import ViewRoleDetailsDialog from './ViewRoleDetailsDialog';
import EditRoleDialog from './EditRoleDialog';
import RoleAssignmentModal from './RoleAssignmentModal';
import RolePermissionsModal from './RolePermissionsModal';
import RoleBulkActions from './RoleBulkActions';
import RoleAnalytics from './RoleAnalytics';
import { roleManagementService } from '@/services/RoleManagementService';
import { toast } from 'react-hot-toast';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Checkbox
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
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const initialLoadRef = useRef(false);

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

  // Load roles from API
  const loadRoles = useCallback(async (page = 1, customFilters = null, customPerPage = null) => {
    try {
      setLoading(true);
      setError(null);

      // Use provided parameters or current state
      const currentFilters = customFilters || filters;
      const currentPerPage = customPerPage || pagination.per_page;

      // Prepare API parameters
      const params = {
        page: page,
        per_page: currentPerPage,
        ...currentFilters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await roleManagementService.getRoles(params);

      if (response.success) {
        setRoles(response.data || []);

        // Update pagination from API response
        if (response.meta && response.meta.pagination) {
          setPagination({
            current_page: response.meta.pagination.current_page || page,
            last_page: response.meta.pagination.last_page || 1,
            per_page: response.meta.pagination.per_page || 15,
            total: response.meta.pagination.total || 0
          });
        }
      } else {
        setError(response.message || 'Failed to load roles');
      }
    } catch (err) {
      console.error('Error loading roles:', err);
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loops

  // Load roles on component mount only
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadRoles();
    }
  }, []); // Empty dependency array - only run on mount

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  // Reload when filters change with debouncing
  useEffect(() => {
    // Skip initial load (handled by mount useEffect)
    if (initialLoadRef.current) {
      const hasActiveFilters = filters.search !== '' || Object.values(filters).some(f => f !== '');
      if (hasActiveFilters) {
        const timeoutId = setTimeout(() => {
          loadRoles(1, filters);
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timeoutId);
      }
    }
  }, [filters, loadRoles]);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
    loadRoles(page, filters);
  }, [loadRoles, filters]);

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

      const formattedData = roleManagementService.formatRoleData(roleData);
      const response = await roleManagementService.createRole(formattedData);

      if (response.success) {
        toast.success(`Role "${response.data.name}" has been created successfully`);
        setShowCreateModal(false);
        // Reload roles to show the new role
        loadRoles(pagination.current_page, filters);
      } else {
        toast.error(response.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(error.message || 'Failed to create role');
    } finally {
      setActionLoading(false);
    }
  }, [loadRoles, pagination.current_page]);

  const handleCloneRole = useCallback(async (role) => {
    try {
      setActionLoading(true);

      // Clone the role data
      const cloneData = {
        ...role,
        name: `${role.name} (Copy)`,
        code: `${role.code}_copy`,
        display_name: `${role.display_name} (Copy)`,
        description: `${role.description} (Cloned from ${role.name})`,
        is_system_role: false // Cloned roles are always custom
      };

      const formattedData = roleManagementService.formatRoleData(cloneData);
      const response = await roleManagementService.createRole(formattedData);

      if (response.success) {
        toast.success(`Role "${response.data.name}" has been cloned successfully`);
        // Reload roles to show the cloned role
        loadRoles(pagination.current_page, filters);
      } else {
        toast.error(response.message || 'Failed to clone role');
      }
    } catch (error) {
      console.error('Error cloning role:', error);
      toast.error(error.message || 'Failed to clone role');
    } finally {
      setActionLoading(false);
    }
  }, [loadRoles, pagination.current_page]);

  const handleEditRoleSubmit = useCallback(async (updatedRoleData) => {
    try {
      setActionLoading(true);

      // Ensure we have valid role data
      if (!updatedRoleData || !updatedRoleData.id) {
        console.error('Invalid role data received:', updatedRoleData);
        toast.error('Invalid role data received');
        return;
      }

      // Update local state with the updated role data
      setRoles(prevRoles =>
        prevRoles.map(role =>
          role.id === updatedRoleData.id ? updatedRoleData : role
        )
      );

      setShowEditModal(false);
      setSelectedRole(null);

      // Reload roles to ensure data consistency with backend
      loadRoles(pagination.current_page, filters);
    } catch (error) {
      console.error('Error handling role update:', error);
      toast.error('Failed to update role list');
    } finally {
      setActionLoading(false);
    }
  }, [loadRoles, pagination.current_page]);

  const handleDeleteRole = useCallback((role) => {
    if (role.is_system_role) {
      toast.error('System roles cannot be deleted');
      return;
    }

    setSelectedRole(role);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeleteRole = useCallback(async () => {
    if (!selectedRole) return;

    try {
      setActionLoading(true);

      const response = await roleManagementService.deleteRole(selectedRole.id);

      if (response.success) {
        toast.success(`Role "${selectedRole.name}" has been deleted successfully`);
        setShowDeleteConfirm(false);
        setSelectedRole(null);
        // Reload roles to reflect the deletion
        loadRoles(pagination.current_page, filters);
      } else {
        toast.error(response.message || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(error.message || 'Failed to delete role');
    } finally {
      setActionLoading(false);
    }
  }, [selectedRole, loadRoles, pagination.current_page]);

  // Handle role selection for bulk actions
  const handleRoleSelection = useCallback((roleId, checked) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  }, []);

  // Handle bulk action success
  const handleBulkActionSuccess = useCallback(async (data) => {
    await loadRoles(pagination.current_page, filters);
    setSelectedRoles([]);
  }, [loadRoles, pagination.current_page, filters]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedRoles([]);
  }, []);

  // Handle role assignment
  const handleRoleAssignment = useCallback((role) => {
    setSelectedRole(role);
    setShowAssignmentModal(true);
  }, []);

  // Handle role permissions
  const handleRolePermissions = useCallback((role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  }, []);

  // Handle assignment success
  const handleAssignmentSuccess = useCallback(async (data) => {
    await loadRoles(pagination.current_page, filters);
  }, [loadRoles, pagination.current_page, filters]);

  // Handle permissions success
  const handlePermissionsSuccess = useCallback(async (data) => {
    await loadRoles(pagination.current_page, filters);
  }, [loadRoles, pagination.current_page, filters]);

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
              <div className="flex items-center gap-3">
                <RoleBulkActions
                  selectedRoles={selectedRoles}
                  onSuccess={handleBulkActionSuccess}
                  onClearSelection={handleClearSelection}
                />
                <Button onClick={handleCreateRole} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Tabs */}
          <CardContent className="px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-6 pb-4 border-b border-gray-200">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 w-auto">
                  <TabsTrigger
                    value="list"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Role List
                  </TabsTrigger>
                  <TabsTrigger
                    value="analytics"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="list" className="space-y-6 px-6 pt-6">
                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  <div className="lg:col-span-2">
                    <Input
                      placeholder="Search roles by name, code, or description..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full"
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
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 px-6 pt-6">
                <RoleAnalytics />
              </TabsContent>
            </Tabs>
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
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
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
                    {roles.filter(role => role.status === 'active').length}
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
                    {roles.reduce((sum, role) => sum + (role.current_users || 0), 0)}
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
              {pagination.total} roles found • Showing {pagination.current_page} of {pagination.last_page} pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Checkbox
                        checked={selectedRoles.length === roles.length && roles.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoles(roles.map(role => role.id));
                          } else {
                            setSelectedRoles([]);
                          }
                        }}
                      />
                    </th>
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
                          <Checkbox
                            checked={selectedRoles.includes(role.id)}
                            onCheckedChange={(checked) => handleRoleSelection(role.id, checked)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                              style={{ backgroundColor: (role.color || '#6B7280') + '20' }}
                            >
                              <Shield className="w-5 h-5" style={{ color: role.color || '#6B7280' }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900">{role.name}</h3>
                                {role.is_system_role && (
                                  <Badge variant="destructive" className="text-xs">
                                    {role.badge_text || 'SYS'}
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
                              {role.permissions_count || 0} permissions
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Current:</span>
                              <span className="text-sm font-medium text-gray-900">
                                {role.current_users || 0}
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
                                    ? `${((role.current_users || 0) / role.max_users) * 100}%`
                                    : '100%'
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {role.status === 'active' ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="w-3 h-3 mr-1" />
                                {role.status || 'Inactive'}
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

                                <DropdownMenuItem onClick={() => handleEditRole(role)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Role
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleCloneRole(role)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Clone Role
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleRoleAssignment(role)}>
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Assign Users
                                </DropdownMenuItem>

                                <DropdownMenuItem onClick={() => handleRolePermissions(role)}>
                                  <Key className="w-4 h-4 mr-2" />
                                  Manage Permissions
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onClick={() => window.open(`/api/v1/roles/${role.id}/export`, '_blank')}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Export Role
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

      {/* Edit Role Dialog */}
      <EditRoleDialog
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        role={selectedRole}
        onSubmit={handleEditRoleSubmit}
        loading={actionLoading}
      />

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        role={selectedRole}
        onSuccess={handleAssignmentSuccess}
      />

      {/* Role Permissions Modal */}
      <RolePermissionsModal
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        role={selectedRole}
        onSuccess={handlePermissionsSuccess}
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
