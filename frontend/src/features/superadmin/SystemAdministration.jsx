import React, { useState, useEffect } from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Badge, Alert, AlertDescription, Skeleton, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, Select, SelectItem, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Checkbox, Tabs, TabsContent, TabsList, TabsTrigger, Textarea} from '@/components/ui';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Settings,
  Users,
  Key,
  Activity,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Save,
  RotateCcw,
  Database,
  Server,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import superAdminService from '@/api/superAdminService';

const SystemAdministration = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('roles');

  // Roles state
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [roleSearch, setRoleSearch] = useState('');

  // Permissions state
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [permissionGroupFilter, setPermissionGroupFilter] = useState('all');

  // Dialog states
  const [createRoleDialogOpen, setCreateRoleDialogOpen] = useState(false);
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false);
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [createPermissionDialogOpen, setCreatePermissionDialogOpen] = useState(false);
  const [editPermissionDialogOpen, setEditPermissionDialogOpen] = useState(false);
  const [deletePermissionDialogOpen, setDeletePermissionDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState(null);

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });

  const [permissionForm, setPermissionForm] = useState({
    name: '',
    display_name: '',
    description: '',
    group: '',
    guard_name: 'web'
  });

  // Load roles data
  const loadRoles = async () => {
    try {
      setLoading(true);
      const result = await superAdminService.getRoles();

      if (result.success) {
        const data = result.data.data;
        setRoles(data.roles || []);
        setFilteredRoles(data.roles || []);
      }
    } catch (err) {
      setError('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load permissions data
  const loadPermissions = async () => {
    try {
      setLoading(true);
      const result = await superAdminService.getPermissions();

      if (result.success) {
        const data = result.data.data;
        setPermissions(data.permissions || []);
        setFilteredPermissions(data.permissions || []);
      }
    } catch (err) {
      setError('Failed to load permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter roles
  const filterRoles = () => {
    let filtered = [...roles];

    if (roleSearch) {
      filtered = filtered.filter(role =>
        role.name?.toLowerCase().includes(roleSearch.toLowerCase()) ||
        role.display_name?.toLowerCase().includes(roleSearch.toLowerCase())
      );
    }

    setFilteredRoles(filtered);
  };

  // Filter permissions
  const filterPermissions = () => {
    let filtered = [...permissions];

    if (permissionSearch) {
      filtered = filtered.filter(permission =>
        permission.name?.toLowerCase().includes(permissionSearch.toLowerCase()) ||
        permission.display_name?.toLowerCase().includes(permissionSearch.toLowerCase())
      );
    }

    if (permissionGroupFilter !== 'all') {
      filtered = filtered.filter(permission => permission.group === permissionGroupFilter);
    }

    setFilteredPermissions(filtered);
  };

  // Create role
  const handleCreateRole = async () => {
    try {
      const result = await superAdminService.createRole(roleForm);

      if (result.success) {
        setCreateRoleDialogOpen(false);
        resetRoleForm();
        loadRoles();
      } else {
        setError(result.error || 'Failed to create role');
      }
    } catch (err) {
      setError('Failed to create role. Please try again.');
    }
  };

  // Update role
  const handleUpdateRole = async () => {
    try {
      const result = await superAdminService.updateRole(selectedRole.id, roleForm);

      if (result.success) {
        setEditRoleDialogOpen(false);
        resetRoleForm();
        loadRoles();
      } else {
        setError(result.error || 'Failed to update role');
      }
    } catch (err) {
      setError('Failed to update role. Please try again.');
    }
  };

  // Delete role
  const handleDeleteRole = async () => {
    try {
      const result = await superAdminService.deleteRole(selectedRole.id);

      if (result.success) {
        setDeleteRoleDialogOpen(false);
        setSelectedRole(null);
        loadRoles();
      } else {
        setError(result.error || 'Failed to delete role');
      }
    } catch (err) {
      setError('Failed to delete role. Please try again.');
    }
  };

  // Create permission
  const handleCreatePermission = async () => {
    try {
      const result = await superAdminService.createPermission(permissionForm);

      if (result.success) {
        setCreatePermissionDialogOpen(false);
        resetPermissionForm();
        loadPermissions();
      } else {
        setError(result.error || 'Failed to create permission');
      }
    } catch (err) {
      setError('Failed to create permission. Please try again.');
    }
  };

  // Update permission
  const handleUpdatePermission = async () => {
    try {
      const result = await superAdminService.updatePermission(selectedPermission.id, permissionForm);

      if (result.success) {
        setEditPermissionDialogOpen(false);
        resetPermissionForm();
        loadPermissions();
      } else {
        setError(result.error || 'Failed to update permission');
      }
    } catch (err) {
      setError('Failed to update permission. Please try again.');
    }
  };

  // Delete permission
  const handleDeletePermission = async () => {
    try {
      const result = await superAdminService.deletePermission(selectedPermission.id);

      if (result.success) {
        setDeletePermissionDialogOpen(false);
        setSelectedPermission(null);
        loadPermissions();
      } else {
        setError(result.error || 'Failed to delete permission');
      }
    } catch (err) {
      setError('Failed to delete permission. Please try again.');
    }
  };

  // Reset forms
  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      display_name: '',
      description: '',
      permissions: []
    });
    setSelectedRole(null);
  };

  const resetPermissionForm = () => {
    setPermissionForm({
      name: '',
      display_name: '',
      description: '',
      group: '',
      guard_name: 'web'
    });
    setSelectedPermission(null);
  };

  // Open edit dialogs
  const openEditRoleDialog = (role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name || '',
      display_name: role.display_name || '',
      description: role.description || '',
      permissions: role.permissions || []
    });
    setEditRoleDialogOpen(true);
  };

  const openEditPermissionDialog = (permission) => {
    setSelectedPermission(permission);
    setPermissionForm({
      name: permission.name || '',
      display_name: permission.display_name || '',
      description: permission.description || '',
      group: permission.group || '',
      guard_name: permission.guard_name || 'web'
    });
    setEditPermissionDialogOpen(true);
  };

  // Open delete dialogs
  const openDeleteRoleDialog = (role) => {
    setSelectedRole(role);
    setDeleteRoleDialogOpen(true);
  };

  const openDeletePermissionDialog = (permission) => {
    setSelectedPermission(permission);
    setDeletePermissionDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get permission groups
  const getPermissionGroups = () => {
    const groups = [...new Set(permissions.map(p => p.group).filter(Boolean))];
    return groups;
  };

  // Load data on component mount
  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  // Filter data when search or filters change
  useEffect(() => {
    filterRoles();
  }, [roleSearch, roles]);

  useEffect(() => {
    filterPermissions();
  }, [permissionSearch, permissionGroupFilter, permissions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
          <p className="text-muted-foreground">Manage roles, permissions, and system settings</p>
        </div>
        <Button onClick={() => {
          loadRoles();
          loadPermissions();
        }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* Roles Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Role Management</h2>
              <p className="text-muted-foreground">Manage user roles and their permissions</p>
            </div>
            <Button onClick={() => setCreateRoleDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </div>

          {/* Role Search */}
          <Card>
            <CardHeader>
              <CardTitle>Search Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles by name or display name..."
                  value={roleSearch}
                  onChange={(e) => setRoleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Roles ({filteredRoles.length})</CardTitle>
              <CardDescription>Manage system roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="font-medium">{role.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{role.display_name || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {role.description || 'No description'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions?.slice(0, 3).map((permission, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {permission.name}
                              </Badge>
                            ))}
                            {role.permissions?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {role.created_at ? formatDate(role.created_at) : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditRoleDialog(role)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeleteRoleDialog(role)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          {/* Permissions Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Permission Management</h2>
              <p className="text-muted-foreground">Manage system permissions and access controls</p>
            </div>
            <Button onClick={() => setCreatePermissionDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Permission
            </Button>
          </div>

          {/* Permission Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search permissions by name or display name..."
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={permissionGroupFilter} onValueChange={setPermissionGroupFilter} className="w-full md:w-48" placeholder="Filter by group">
              <SelectItem value="all">All Groups</SelectItem>
                    {getPermissionGroups().map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
</Select>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions ({filteredPermissions.length})</CardTitle>
              <CardDescription>Manage system permissions and access controls</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Permission Name</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPermissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Key className="w-4 h-4 text-primary" />
                            <span className="font-medium font-mono text-sm">{permission.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{permission.display_name || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{permission.group || 'Default'}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {permission.description || 'No description'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {permission.created_at ? formatDate(permission.created_at) : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditPermissionDialog(permission)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openDeletePermissionDialog(permission)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={createRoleDialogOpen} onOpenChange={setCreateRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>
              Create a new role with specific permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                placeholder="e.g., content_manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-display-name">Display Name</Label>
              <Input
                id="role-display-name"
                value={roleForm.display_name}
                onChange={(e) => setRoleForm({ ...roleForm, display_name: e.target.value })}
                placeholder="e.g., Content Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Describe the role's purpose and responsibilities"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role-name">Role Name</Label>
              <Input
                id="edit-role-name"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                placeholder="e.g., content_manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-display-name">Display Name</Label>
              <Input
                id="edit-role-display-name"
                value={roleForm.display_name}
                onChange={(e) => setRoleForm({ ...roleForm, display_name: e.target.value })}
                placeholder="e.g., Content Manager"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role-description">Description</Label>
              <Textarea
                id="edit-role-description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                placeholder="Describe the role's purpose and responsibilities"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Dialog */}
      <Dialog open={deleteRoleDialogOpen} onOpenChange={setDeleteRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Role: <strong>{selectedRole?.display_name || selectedRole?.name}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Permission Dialog */}
      <Dialog open={createPermissionDialogOpen} onOpenChange={setCreatePermissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Permission</DialogTitle>
            <DialogDescription>
              Create a new permission for the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="permission-name">Permission Name</Label>
              <Input
                id="permission-name"
                value={permissionForm.name}
                onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                placeholder="e.g., users.create"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission-display-name">Display Name</Label>
              <Input
                id="permission-display-name"
                value={permissionForm.display_name}
                onChange={(e) => setPermissionForm({ ...permissionForm, display_name: e.target.value })}
                placeholder="e.g., Create Users"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission-group">Group</Label>
              <Input
                id="permission-group"
                value={permissionForm.group}
                onChange={(e) => setPermissionForm({ ...permissionForm, group: e.target.value })}
                placeholder="e.g., users"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission-description">Description</Label>
              <Textarea
                id="permission-description"
                value={permissionForm.description}
                onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                placeholder="Describe what this permission allows"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePermissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePermission}>
              Create Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={editPermissionDialogOpen} onOpenChange={setEditPermissionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Update permission information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-permission-name">Permission Name</Label>
              <Input
                id="edit-permission-name"
                value={permissionForm.name}
                onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                placeholder="e.g., users.create"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-permission-display-name">Display Name</Label>
              <Input
                id="edit-permission-display-name"
                value={permissionForm.display_name}
                onChange={(e) => setPermissionForm({ ...permissionForm, display_name: e.target.value })}
                placeholder="e.g., Create Users"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-permission-group">Group</Label>
              <Input
                id="edit-permission-group"
                value={permissionForm.group}
                onChange={(e) => setPermissionForm({ ...permissionForm, group: e.target.value })}
                placeholder="e.g., users"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-permission-description">Description</Label>
              <Textarea
                id="edit-permission-description"
                value={permissionForm.description}
                onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                placeholder="Describe what this permission allows"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPermissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePermission}>
              Update Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Permission Dialog */}
      <Dialog open={deletePermissionDialogOpen} onOpenChange={setDeletePermissionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this permission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Permission: <strong>{selectedPermission?.display_name || selectedPermission?.name}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePermissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePermission}>
              Delete Permission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemAdministration;
