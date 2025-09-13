/**
 * Enhanced Role List Page
 * Role management dengan DataTable dan enhanced components
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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DataTable
} from '@/components/ui';
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
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import CreateRoleDialog from './CreateRoleDialog';
import EditRoleDialog from './EditRoleDialog';
import ViewRoleDetailsDialog from './ViewRoleDetailsDialog';
import RolePermissionsModal from './RolePermissionsModal';
import RoleAssignmentModal from './RoleAssignmentModal';
import RoleBulkActions from './RoleBulkActions';

const RoleList = () => {
  const { announce } = useAnnouncement();
  const { focusRef, setFocus } = useFocusManagement();
  const { setLoading, getLoadingState } = useLoadingStates();

  // State management
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [error, setError] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  // Sample data - in production, this would come from API
  const sampleRoles = useMemo(() => [
    {
      id: 1,
      name: 'Super Admin',
      description: 'Full system access and control',
      type: 'system',
      status: 'active',
      userCount: 2,
      permissionCount: 25,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      permissions: ['user.read', 'user.write', 'user.delete', 'system.settings'],
      isSystem: true
    },
    {
      id: 2,
      name: 'Admin',
      description: 'Administrative access to most features',
      type: 'admin',
      status: 'active',
      userCount: 5,
      permissionCount: 18,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-14T15:45:00Z',
      permissions: ['user.read', 'user.write', 'role.read', 'role.write'],
      isSystem: false
    },
    {
      id: 3,
      name: 'Manager',
      description: 'Management access to team and content',
      type: 'manager',
      status: 'active',
      userCount: 12,
      permissionCount: 12,
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-13T09:15:00Z',
      permissions: ['user.read', 'content.read', 'content.write'],
      isSystem: false
    },
    {
      id: 4,
      name: 'Agent',
      description: 'Customer support agent access',
      type: 'agent',
      status: 'active',
      userCount: 25,
      permissionCount: 8,
      createdAt: '2024-01-04T00:00:00Z',
      updatedAt: '2024-01-12T14:20:00Z',
      permissions: ['conversation.read', 'conversation.write', 'knowledge.read'],
      isSystem: false
    },
    {
      id: 5,
      name: 'Viewer',
      description: 'Read-only access to reports and data',
      type: 'viewer',
      status: 'inactive',
      userCount: 0,
      permissionCount: 5,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-10T11:30:00Z',
      permissions: ['report.read', 'dashboard.read'],
      isSystem: false
    }
  ], []);

  // Load roles data
  const loadRoles = useCallback(async () => {
    try {
      setLoading('initial', true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRoles(sampleRoles);
      announce('Roles loaded successfully');
    } catch (err) {
      const errorResult = handleError(err, {
        context: 'Role Management Data Loading',
        showToast: true
      });
      setError(errorResult.message);
    } finally {
      setLoading('initial', false);
    }
  }, [sampleRoles, setLoading, announce]);

  // Filter roles based on search and filters
  const filterRoles = useCallback(() => {
    let filtered = roles;

    // Search filter
    if (searchQuery) {
      const sanitizedQuery = sanitizeInput(searchQuery.toLowerCase());
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(sanitizedQuery) ||
        role.description.toLowerCase().includes(sanitizedQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(role => role.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(role => role.type === typeFilter);
    }

    setFilteredRoles(filtered);
  }, [roles, searchQuery, statusFilter, typeFilter]);

  // Load data on mount
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Filter roles when filters change
  useEffect(() => {
    filterRoles();
  }, [filterRoles]);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = sanitizeInput(e.target.value);
    setSearchQuery(value);
  }, []);

  // Handle status filter change
  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
    announce(`Filtering by status: ${value}`);
  }, [announce]);

  // Handle type filter change
  const handleTypeFilterChange = useCallback((value) => {
    setTypeFilter(value);
    announce(`Filtering by type: ${value}`);
  }, [announce]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    try {
      setLoading('refresh', true);
      await loadRoles();
      announce('Roles refreshed successfully');
    } catch (err) {
      handleError(err, { context: 'Role Refresh' });
    } finally {
      setLoading('refresh', false);
    }
  }, [loadRoles, setLoading, announce]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      setLoading('export', true);

      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));

      announce('Roles exported successfully');
    } catch (err) {
      handleError(err, { context: 'Role Export' });
    } finally {
      setLoading('export', false);
    }
  }, [setLoading, announce]);

  // Handle role actions
  const handleViewRole = useCallback((role) => {
    setSelectedRole(role);
    setIsViewDialogOpen(true);
    announce(`Viewing role: ${role.name}`);
  }, [announce]);

  const handleEditRole = useCallback((role) => {
    setSelectedRole(role);
    setIsEditDialogOpen(true);
    announce(`Editing role: ${role.name}`);
  }, [announce]);

  const handleDeleteRole = useCallback(async (role) => {
    try {
      setLoading('delete', true);

      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 1000));

      setRoles(prev => prev.filter(r => r.id !== role.id));
      announce(`Role ${role.name} deleted successfully`);
    } catch (err) {
      handleError(err, { context: 'Role Delete' });
    } finally {
      setLoading('delete', false);
    }
  }, [setLoading, announce]);

  const handleManagePermissions = useCallback((role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
    announce(`Managing permissions for: ${role.name}`);
  }, [announce]);

  const handleAssignUsers = useCallback((role) => {
    setSelectedRole(role);
    setIsAssignmentModalOpen(true);
    announce(`Assigning users to: ${role.name}`);
  }, [announce]);

  const handleCopyRole = useCallback((role) => {
    navigator.clipboard.writeText(role.name);
    announce(`Role name copied: ${role.name}`);
  }, [announce]);

  // DataTable columns configuration
  const columns = [
    {
      key: 'name',
      title: 'Role',
      sortable: true,
      render: (value, role) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center space-x-2">
              {value}
              {role.isSystem && (
                <Badge variant="secondary" className="text-xs">
                  System
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">{role.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {value.charAt(0).toUpperCase() + value.slice(1)}
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
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      key: 'userCount',
      title: 'Users',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'permissionCount',
      title: 'Permissions',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">{value}</span>
        </div>
      )
    },
    {
      key: 'updatedAt',
      title: 'Last Updated',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (value, role) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleViewRole(role)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditRole(role)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleManagePermissions(role)}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Permissions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAssignUsers(role)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Assign Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyRole(role)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Name
            </DropdownMenuItem>
            {!role.isSystem && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteRole(role)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Role
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  // Focus management on mount
  useEffect(() => {
    setFocus();
  }, [setFocus]);

  return (
    <div className="space-y-6" ref={focusRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and access controls
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={getLoadingState('refresh')}
            aria-label="Refresh roles"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${getLoadingState('refresh') ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={getLoadingState('export')}
            aria-label="Export roles"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            aria-label="Create new role"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Role
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
              <label className="text-sm font-medium">Search Roles</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRoles.length > 0 && (
        <RoleBulkActions
          selectedRoles={selectedRoles}
          onClearSelection={() => setSelectedRoles([])}
          onBulkAction={(action) => {
            announce(`Bulk action ${action} applied to ${selectedRoles.length} roles`);
          }}
        />
      )}

      {/* Roles Table */}
      <DataTable
        data={filteredRoles}
        columns={columns}
        loading={getLoadingState('initial')}
        error={error}
        searchable={false} // We handle search in filters
        ariaLabel="Roles management table"
        pagination={{
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          onNext: () => {},
          onPrevious: () => {}
        }}
      />

      {/* Dialogs */}
      <CreateRoleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onRoleCreated={(newRole) => {
          setRoles(prev => [...prev, newRole]);
          announce('New role created successfully');
        }}
      />

      <EditRoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        role={selectedRole}
        onRoleUpdated={(updatedRole) => {
          setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
          announce('Role updated successfully');
        }}
      />

      <ViewRoleDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        role={selectedRole}
      />

      <RolePermissionsModal
        open={isPermissionsModalOpen}
        onOpenChange={setIsPermissionsModalOpen}
        role={selectedRole}
        onPermissionsUpdated={(updatedRole) => {
          setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
          announce('Role permissions updated successfully');
        }}
      />

      <RoleAssignmentModal
        open={isAssignmentModalOpen}
        onOpenChange={setIsAssignmentModalOpen}
        role={selectedRole}
        onUsersAssigned={(updatedRole) => {
          setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r));
          announce('Users assigned to role successfully');
        }}
      />
    </div>
  );
};

export default withErrorHandling(RoleList, {
  context: 'Role List Page'
});
