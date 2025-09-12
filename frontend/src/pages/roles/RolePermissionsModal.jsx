import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  Shield,
  Check,
  Search,
  Loader2,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';
import { roleManagementService } from '@/services/RoleManagementService';
import { toast } from 'react-hot-toast';
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui';

const RolePermissionsModal = ({ isOpen, onClose, role, onSuccess }) => {
  const [permissions, setPermissions] = useState([]);
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [permissionGroups, setPermissionGroups] = useState({});

  // Load permissions when modal opens
  useEffect(() => {
    if (isOpen && role) {
      loadPermissions();
      loadAssignedPermissions();
    }
  }, [isOpen, role]);

  // Load all available permissions
  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roleManagementService.getPermissions();
      
      if (response.success) {
        setPermissions(response.data || []);
        
        // Group permissions by category
        const groups = {};
        response.data?.forEach(permission => {
          const category = permission.category || 'General';
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push(permission);
        });
        setPermissionGroups(groups);
      } else {
        toast.error('Failed to load permissions');
      }
    } catch (error) {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load permissions assigned to this role
  const loadAssignedPermissions = useCallback(async () => {
    try {
      const response = await roleManagementService.getRolePermissions(role.id);
      
      if (response.success) {
        setAssignedPermissions(response.data || []);
      } else {
        toast.error('Failed to load role permissions');
      }
    } catch (error) {
      toast.error('Failed to load role permissions');
    }
  }, [role]);

  // Handle permission selection
  const handlePermissionToggle = useCallback((permissionId, checked) => {
    if (checked) {
      setAssignedPermissions(prev => [...prev, permissionId]);
    } else {
      setAssignedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      const response = await roleManagementService.updateRolePermissions(role.id, assignedPermissions);
      
      if (response.success) {
        toast.success(`Permissions for role "${role.name}" have been updated successfully`);
        
        if (onSuccess) {
          await onSuccess(response.data);
        }
        
        onClose();
      } else {
        toast.error(response.message || 'Failed to update permissions');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update permissions');
    } finally {
      setSubmitting(false);
    }
  }, [assignedPermissions, role, onSuccess, onClose]);

  // Filter permissions based on search term and active tab
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'assigned') return matchesSearch && assignedPermissions.includes(permission.id);
    if (activeTab === 'unassigned') return matchesSearch && !assignedPermissions.includes(permission.id);
    
    return matchesSearch && permission.category === activeTab;
  });

  // Get permission count by category
  const getPermissionCount = useCallback((category) => {
    if (category === 'all') return permissions.length;
    if (category === 'assigned') return assignedPermissions.length;
    if (category === 'unassigned') return permissions.length - assignedPermissions.length;
    
    return permissions.filter(p => p.category === category).length;
  }, [permissions, assignedPermissions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Permissions</h2>
              <p className="text-sm text-gray-600">
                Configure permissions for role "{role?.name}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadPermissions}
              disabled={loading || submitting}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Role Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Role Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: (role?.color || '#6B7280') + '20' }}
                  >
                    <Shield className="w-6 h-6" style={{ color: role?.color || '#6B7280' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {role?.name || 'Role Name'}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      {role?.code || 'role_code'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {role?.description || 'Role description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        {role?.scope || 'scope'}
                      </Badge>
                      <Badge variant="outline">Level {role?.level || '50'}</Badge>
                      <Badge variant="secondary">
                        {assignedPermissions.length} permissions assigned
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions Management */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  Select permissions to assign to this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search permissions by name, description, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="mb-4 border-b border-gray-200">
                    <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500 w-auto">
                      <TabsTrigger 
                        value="all"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                      >
                        All ({getPermissionCount('all')})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="assigned"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                      >
                        Assigned ({getPermissionCount('assigned')})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="unassigned"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-gray-900 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                      >
                        Unassigned ({getPermissionCount('unassigned')})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="categories"
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200"
                      >
                        Categories
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="all" className="mt-4">
                    <PermissionsList
                      permissions={filteredPermissions}
                      assignedPermissions={assignedPermissions}
                      onPermissionToggle={handlePermissionToggle}
                      loading={loading}
                      submitting={submitting}
                    />
                  </TabsContent>

                  <TabsContent value="assigned" className="mt-4">
                    <PermissionsList
                      permissions={filteredPermissions}
                      assignedPermissions={assignedPermissions}
                      onPermissionToggle={handlePermissionToggle}
                      loading={loading}
                      submitting={submitting}
                    />
                  </TabsContent>

                  <TabsContent value="unassigned" className="mt-4">
                    <PermissionsList
                      permissions={filteredPermissions}
                      assignedPermissions={assignedPermissions}
                      onPermissionToggle={handlePermissionToggle}
                      loading={loading}
                      submitting={submitting}
                    />
                  </TabsContent>

                  <TabsContent value="categories" className="mt-4">
                    <div className="space-y-4">
                      {Object.keys(permissionGroups).map(category => (
                        <div key={category} className="border border-gray-200 rounded-lg">
                          <div className="p-3 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-medium text-gray-900">{category}</h4>
                            <p className="text-sm text-gray-600">
                              {permissionGroups[category].length} permissions
                            </p>
                          </div>
                          <div className="p-4">
                            <PermissionsList
                              permissions={permissionGroups[category].filter(permission => 
                                permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
                              )}
                              assignedPermissions={assignedPermissions}
                              onPermissionToggle={handlePermissionToggle}
                              loading={loading}
                              submitting={submitting}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {assignedPermissions.length} of {permissions.length} permissions selected
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Permissions
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Permissions List Component
const PermissionsList = ({ permissions, assignedPermissions, onPermissionToggle, loading, submitting }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Loading permissions...</span>
        </div>
      </div>
    );
  }

  if (permissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No permissions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {permissions.map((permission) => (
        <div
          key={permission.id}
          className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Checkbox
            checked={assignedPermissions.includes(permission.id)}
            onCheckedChange={(checked) => onPermissionToggle(permission.id, checked)}
            disabled={submitting}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{permission.name}</h4>
              {permission.is_dangerous && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Dangerous
                </Badge>
              )}
              {permission.category && (
                <Badge variant="outline" className="text-xs">
                  {permission.category}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {permission.description}
            </p>
            {permission.resource && (
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Resource: {permission.resource}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RolePermissionsModal;
