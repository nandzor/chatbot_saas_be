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
  TabsTrigger,
  Select,
  SelectItem,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui';

const RolePermissionsModal = ({ open, onOpenChange, role, onSuccess }) => {
  const [permissions, setPermissions] = useState([]);
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [permissionGroups, setPermissionGroups] = useState({});

  // Load permissions when modal opens
  useEffect(() => {
    if (open && role) {
      loadPermissions();
      loadAssignedPermissions();
    }
  }, [open, role]);

  // Load all available permissions
  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roleManagementService.getPermissions();

      if (response.success) {
        setPermissions(response.data);

        // Group permissions by category
        const grouped = response.data.reduce((acc, permission) => {
          const category = permission.category || 'general';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(permission);
          return acc;
        }, {});
        setPermissionGroups(grouped);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load currently assigned permissions for the role
  const loadAssignedPermissions = useCallback(async () => {
    if (!role?.id) return;

    try {
      const response = await roleManagementService.getRolePermissions(role.id);
      if (response.success) {
        setAssignedPermissions(response.data.map(p => p.id));
      }
    } catch (error) {
      console.error('Error loading assigned permissions:', error);
    }
  }, [role?.id]);

  // Toggle permission assignment
  const handlePermissionToggle = useCallback((permissionId, checked) => {
    setAssignedPermissions(prev =>
      checked
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId)
    );
  }, []);

  // Submit permission changes
  const handleSubmit = useCallback(async () => {
    if (!role?.id) return;

    try {
      setSubmitting(true);
      const response = await roleManagementService.updateRolePermissions(role.id, {
        permission_ids: assignedPermissions
      });

      if (response.success) {
        toast.success('Permissions updated successfully');
        if (onSuccess) {
          await onSuccess(response.data);
        }
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to update permissions');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update permissions');
    } finally {
      setSubmitting(false);
    }
  }, [assignedPermissions, role, onSuccess, onOpenChange]);

  // Filter permissions based on search term and active tab
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === 'all' || permission.category === activeTab;

    return matchesSearch && matchesTab;
  });

  // Get permission count for tab
  const getPermissionCount = useCallback((category) => {
    if (category === 'all') return permissions.length;
    if (category === 'assigned') return assignedPermissions.length;
    if (category === 'unassigned') return permissions.length - assignedPermissions.length;
    return permissions.filter(p => p.category === category).length;
  }, [permissions, assignedPermissions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Manage Permissions
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Configure permissions for role "{role?.name}"
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6">
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
                  <p className="text-sm text-gray-600">
                    {role?.description || 'No description available'}
                  </p>
                </div>
                <Badge variant="outline">
                  {assignedPermissions.length} permissions assigned
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={loadPermissions}
                  disabled={loading || submitting}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {/* Category Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">
                    All ({getPermissionCount('all')})
                  </TabsTrigger>
                  <TabsTrigger value="assigned">
                    Assigned ({getPermissionCount('assigned')})
                  </TabsTrigger>
                  <TabsTrigger value="unassigned">
                    Unassigned ({getPermissionCount('unassigned')})
                  </TabsTrigger>
                  <TabsTrigger value="system">
                    System ({getPermissionCount('system')})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Permissions List */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select the permissions to assign to this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    <span className="text-gray-600">Loading permissions...</span>
                  </div>
                </div>
              ) : filteredPermissions.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No permissions found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={assignedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked)}
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
                        </div>
                        {permission.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {permission.description}
                          </p>
                        )}
                        {permission.resource && (
                          <p className="text-xs text-gray-500 mt-1 font-mono">
                            Resource: {permission.resource}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || loading}
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
      </DialogContent>
    </Dialog>
  );
};

export default RolePermissionsModal;
