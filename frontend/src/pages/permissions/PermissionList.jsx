import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  Lock,
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
  Key,
  Database,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  CreditCard,
  Webhook,
  Workflow,
  Bot,
  Zap
} from 'lucide-react';
import CreatePermissionDialog from './CreatePermissionDialog';
import ViewPermissionDetailsDialog from './ViewPermissionDetailsDialog';
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

const PermissionList = () => {
  // State management
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkActions, setBulkActions] = useState([]);

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
    category: '',
    risk_level: ''
  });

  // Mock data for demonstration (replace with actual API calls)
  const mockPermissions = useMemo(() => [
    // User Management Permissions
    {
      id: 1,
      name: 'User Management',
      code: 'users.manage',
      description: 'Full control over user accounts and profiles',
      scope: 'global',
      category: 'user_management',
      risk_level: 'high',
      is_active: true,
      is_system_permission: true,
      is_dangerous: true,
      metadata: {
        created_via: 'system',
        system_permission: true,
        dangerous_permission: true,
        roles_count: 2,
        usage_count: 15
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'View Users',
      code: 'users.view',
      description: 'View user information and profiles',
      scope: 'organization',
      category: 'user_management',
      risk_level: 'low',
      is_active: true,
      is_system_permission: false,
      is_dangerous: false,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: false,
        roles_count: 8,
        usage_count: 45
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Create Users',
      code: 'users.create',
      description: 'Create new user accounts',
      scope: 'organization',
      category: 'user_management',
      risk_level: 'medium',
      is_active: true,
      is_system_permission: false,
      is_dangerous: false,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: false,
        roles_count: 5,
        usage_count: 12
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },

    // Role Management Permissions
    {
      id: 4,
      name: 'Role Management',
      code: 'roles.manage',
      description: 'Full control over roles and permissions',
      scope: 'global',
      category: 'role_management',
      risk_level: 'critical',
      is_active: true,
      is_system_permission: true,
      is_dangerous: true,
      metadata: {
        created_via: 'system',
        system_permission: true,
        dangerous_permission: true,
        roles_count: 1,
        usage_count: 2
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      name: 'View Roles',
      code: 'roles.view',
      description: 'View role information and assignments',
      scope: 'organization',
      category: 'role_management',
      risk_level: 'low',
      is_active: true,
      is_system_permission: false,
      is_dangerous: false,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: false,
        roles_count: 6,
        usage_count: 28
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },

    // Chat Management Permissions
    {
      id: 6,
      name: 'Chat Management',
      code: 'chat.manage',
      description: 'Full control over chat sessions and conversations',
      scope: 'organization',
      category: 'chat_management',
      risk_level: 'high',
      is_active: true,
      is_system_permission: false,
      is_dangerous: true,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: true,
        roles_count: 4,
        usage_count: 22
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 7,
      name: 'Handle Chats',
      code: 'chat.handle',
      description: 'Respond to and manage customer chats',
      scope: 'organization',
      category: 'chat_management',
      risk_level: 'medium',
      is_active: true,
      is_system_permission: false,
      is_dangerous: false,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: false,
        roles_count: 7,
        usage_count: 38
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },

    // Knowledge Base Permissions
    {
      id: 8,
      name: 'Knowledge Management',
      code: 'knowledge.manage',
      description: 'Full control over knowledge base content',
      scope: 'organization',
      category: 'knowledge_management',
      risk_level: 'medium',
      is_active: true,
      is_system_permission: false,
      is_dangerous: false,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: false,
        roles_count: 3,
        usage_count: 18
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 9,
      name: 'View Knowledge',
      code: 'knowledge.view',
      description: 'Access and view knowledge base articles',
      scope: 'organization',
      category: 'knowledge_management',
      risk_level: 'low',
      is_active: true,
      is_system_permission: false,
      is_dangerous: false,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: false,
        roles_count: 9,
        usage_count: 52
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },

    // Analytics Permissions
    {
      id: 10,
      name: 'Analytics Access',
      code: 'analytics.view',
      description: 'View system analytics and reports',
      scope: 'organization',
      category: 'analytics',
      risk_level: 'low',
      is_active: true,
      is_system_permission: false,
      is_dangerous: false,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: false,
        roles_count: 6,
        usage_count: 31
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },

    // Bot Management Permissions
    {
      id: 11,
      name: 'Bot Management',
      code: 'bot.manage',
      description: 'Full control over chatbot configurations',
      scope: 'organization',
      category: 'bot_management',
      risk_level: 'high',
      is_active: true,
      is_system_permission: false,
      is_dangerous: true,
      metadata: {
        created_via: 'seeder',
        system_permission: false,
        dangerous_permission: true,
        roles_count: 3,
        usage_count: 15
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },

    // API Management Permissions
    {
      id: 12,
      name: 'API Management',
      code: 'api.manage',
      description: 'Full control over API keys and endpoints',
      scope: 'global',
      category: 'api_management',
      risk_level: 'critical',
      is_active: true,
      is_system_permission: true,
      is_dangerous: true,
      metadata: {
        created_via: 'system',
        system_permission: true,
        dangerous_permission: true,
        roles_count: 1,
        usage_count: 3
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ], []);

  // Load permissions with mock data
  const loadPermissions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter permissions based on current filters
      let filteredPermissions = [...mockPermissions];

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredPermissions = filteredPermissions.filter(permission =>
          permission.name.toLowerCase().includes(searchTerm) ||
          permission.code.toLowerCase().includes(searchTerm) ||
          permission.description.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.scope) {
        filteredPermissions = filteredPermissions.filter(permission => permission.scope === filters.scope);
      }

      if (filters.is_active !== '') {
        filteredPermissions = filteredPermissions.filter(permission => permission.is_active === (filters.is_active === 'true'));
      }

      if (filters.category) {
        filteredPermissions = filteredPermissions.filter(permission => permission.category === filters.category);
      }

      if (filters.risk_level) {
        filteredPermissions = filteredPermissions.filter(permission => permission.risk_level === filters.risk_level);
      }

      setPermissions(filteredPermissions);
      setPagination({
        current_page: page,
        last_page: Math.ceil(filteredPermissions.length / pagination.per_page),
        per_page: pagination.per_page,
        total: filteredPermissions.length
      });
    } catch (err) {
      setError(err.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page]);

  // Load permissions on component mount and filter changes
  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

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
    loadPermissions(page);
  }, [loadPermissions]);

  // Handle permission actions
  const handleCreatePermission = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleEditPermission = useCallback((permission) => {
    setSelectedPermission(permission);
    setShowEditModal(true);
  }, []);

  const handleViewDetails = useCallback((permission) => {
    setSelectedPermission(permission);
    setShowDetailsModal(true);
  }, []);

  const handleCreatePermissionSubmit = useCallback(async (permissionData) => {
    try {
      setActionLoading(true);
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new permission with generated ID
      const newPermission = {
        ...permissionData,
        id: Math.max(...permissions.map(p => p.id)) + 1,
        metadata: {
          ...permissionData.metadata,
          roles_count: 0,
          usage_count: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setPermissions(prev => [newPermission, ...prev]);
      setShowCreateModal(false);

      // Show success message
      alert(`Permission "${newPermission.name}" has been created successfully`);
    } catch (error) {
      alert(`Failed to create permission: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [permissions]);

  const handleClonePermission = useCallback((permission) => {
    setSelectedPermission(permission);
    // TODO: Implement clone functionality
    alert(`Clone permission ${permission.name} functionality will be implemented here`);
  }, []);

  const handleDeletePermission = useCallback(async (permission) => {
    if (permission.is_system_permission) {
      alert('System permissions cannot be deleted');
      return;
    }

    setSelectedPermission(permission);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDeletePermission = useCallback(async () => {
    if (!selectedPermission) return;

    try {
      setActionLoading(true);
      // TODO: Implement actual delete API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPermissions(prev => prev.filter(permission => permission.id !== selectedPermission.id));
      setShowDeleteConfirm(false);
      setSelectedPermission(null);

      // Show success message
      alert(`Permission "${selectedPermission.name}" has been deleted successfully`);
    } catch (error) {
      alert(`Failed to delete permission: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, [selectedPermission]);

  // Toggle permission status
  const togglePermissionStatus = useCallback(async (permission) => {
    try {
      setActionLoading(true);
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setPermissions(prev => prev.map(p =>
        p.id === permission.id
          ? { ...p, is_active: !p.is_active }
          : p
      ));

      // Show success message
      alert(`Permission "${permission.name}" has been ${!permission.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      alert(`Failed to update permission: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  }, []);

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

  // Get category icon and color
  const getCategoryInfo = useCallback((category) => {
    switch (category) {
      case 'user_management':
        return { icon: Users, color: 'bg-blue-100 text-blue-800', label: 'User Management' };
      case 'role_management':
        return { icon: Shield, color: 'bg-red-100 text-red-800', label: 'Role Management' };
      case 'chat_management':
        return { icon: MessageSquare, color: 'bg-green-100 text-green-800', label: 'Chat Management' };
      case 'knowledge_management':
        return { icon: FileText, color: 'bg-purple-100 text-purple-800', label: 'Knowledge Management' };
      case 'analytics':
        return { icon: BarChart3, color: 'bg-orange-100 text-orange-800', label: 'Analytics' };
      case 'bot_management':
        return { icon: Bot, color: 'bg-indigo-100 text-indigo-800', label: 'Bot Management' };
      case 'api_management':
        return { icon: Webhook, color: 'bg-pink-100 text-pink-800', label: 'API Management' };
      case 'workflow_management':
        return { icon: Workflow, color: 'bg-teal-100 text-teal-800', label: 'Workflow Management' };
      case 'billing':
        return { icon: CreditCard, color: 'bg-emerald-100 text-emerald-800', label: 'Billing' };
      case 'automation':
        return { icon: Zap, color: 'bg-amber-100 text-amber-800', label: 'Automation' };
      default:
        return { icon: Settings, color: 'bg-gray-100 text-gray-800', label: category };
    }
  }, []);

  // Get risk level color
  const getRiskLevelColor = useCallback((riskLevel) => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }, []);

  // Loading state
  if (loading && permissions.length === 0) {
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
                <CardTitle className="text-3xl font-bold text-gray-900">Permission Management</CardTitle>
                <CardDescription>
                  Manage system permissions, access rights, and security policies
                </CardDescription>
              </div>
              <Button onClick={handleCreatePermission} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Permission
              </Button>
            </div>
          </CardHeader>

          {/* Advanced Filters */}
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search permissions by name, code, or description..."
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

              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="user_management">User Management</SelectItem>
                  <SelectItem value="role_management">Role Management</SelectItem>
                  <SelectItem value="chat_management">Chat Management</SelectItem>
                  <SelectItem value="knowledge_management">Knowledge Management</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="bot_management">Bot Management</SelectItem>
                  <SelectItem value="api_management">API Management</SelectItem>
                  <SelectItem value="workflow_management">Workflow Management</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.risk_level} onValueChange={(value) => handleFilterChange('risk_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Risk Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
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
                  <p className="text-sm font-medium text-gray-600">Active Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {permissions.filter(permission => permission.is_active).length}
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
                  <p className="text-sm font-medium text-gray-600">System Permissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {permissions.filter(permission => permission.is_system_permission).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">High Risk</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {permissions.filter(permission =>
                      ['critical', 'high'].includes(permission.risk_level)
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions Overview</CardTitle>
            <CardDescription>
              {permissions.length} permissions found • Showing {pagination.current_page} of {pagination.last_page} pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permission Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category & Scope
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Level
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
                  {permissions.map((permission) => {
                    const scopeInfo = getScopeInfo(permission.scope);
                    const categoryInfo = getCategoryInfo(permission.category);
                    const ScopeIcon = scopeInfo.icon;
                    const CategoryIcon = categoryInfo.icon;

                    return (
                      <tr key={permission.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-gray-100 rounded-lg mr-3">
                              <Lock className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-gray-900">{permission.name}</h3>
                                {permission.is_system_permission && (
                                  <Badge variant="destructive" className="text-xs">
                                    System
                                  </Badge>
                                )}
                                {permission.is_dangerous && (
                                  <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                                    Dangerous
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 font-mono">{permission.code}</p>
                              <p className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={categoryInfo.color}>
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                {categoryInfo.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={scopeInfo.color}>
                                <ScopeIcon className="w-3 h-3 mr-1" />
                                {scopeInfo.label}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-400">
                              {permission.metadata?.roles_count || 0} roles • {permission.metadata?.usage_count || 0} uses
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <Badge className={`${getRiskLevelColor(permission.risk_level)} border`}>
                            {permission.risk_level.charAt(0).toUpperCase() + permission.risk_level.slice(1)}
                          </Badge>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={permission.is_active}
                                onCheckedChange={() => togglePermissionStatus(permission)}
                                disabled={actionLoading || permission.is_system_permission}
                              />
                              <span className="text-sm text-gray-600">
                                {permission.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
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

                                <DropdownMenuItem onClick={() => handleViewDetails(permission)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>

                                {!permission.is_system_permission && (
                                  <DropdownMenuItem onClick={() => handleEditPermission(permission)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Permission
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={() => handleClonePermission(permission)}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Clone Permission
                                </DropdownMenuItem>

                                {!permission.is_system_permission && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeletePermission(permission)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Permission
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

            {/* Create Permission Dialog */}
      <CreatePermissionDialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePermissionSubmit}
        loading={actionLoading}
      />

      {/* View Permission Details Dialog */}
      <ViewPermissionDetailsDialog
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        permission={selectedPermission}
        onEdit={handleEditPermission}
        onClone={handleClonePermission}
        onDelete={handleDeletePermission}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Permission</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the permission <strong>"{selectedPermission.name}"</strong>?
              This action cannot be undone and will affect all roles that use this permission.
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
                onClick={confirmDeletePermission}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Permission'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionList;
