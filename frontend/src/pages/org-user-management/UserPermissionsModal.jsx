/**
 * User Permissions Modal
 * Modal untuk mengelola permissions user
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  Shield,
  User,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { handleError } from '@/utils/errorHandler';
import UserManagementService from '@/services/UserManagementService';

const userManagementService = new UserManagementService();

const UserPermissionsModal = ({ open, onOpenChange, user, onPermissionsUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load permissions when modal opens
  useEffect(() => {
    if (open && user) {
      loadPermissions();
      loadUserPermissions();
    }
  }, [open, user]);

  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userManagementService.getPermissions();

      if (response.success) {
        setPermissions(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load permissions');
      }
    } catch (err) {
      handleError(err, { context: 'Load Permissions' });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserPermissions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await userManagementService.getUserPermissions(user.id);

      if (response.success) {
        setUserPermissions(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load user permissions');
      }
    } catch (err) {
      handleError(err, { context: 'Load User Permissions' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Group permissions by category
  const groupedPermissions = React.useMemo(() => {
    const groups = {};
    permissions.forEach(permission => {
      const category = permission.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });
    return groups;
  }, [permissions]);

  // Filter permissions based on search and category
  const filteredPermissions = React.useMemo(() => {
    let filtered = permissions;

    if (searchQuery) {
      filtered = filtered.filter(permission =>
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(permission =>
        (permission.category || 'other') === selectedCategory
      );
    }

    return filtered;
  }, [permissions, searchQuery, selectedCategory]);

  // Check if user has permission
  const hasPermission = useCallback((permissionId) => {
    return userPermissions.some(up => up.id === permissionId);
  }, [userPermissions]);

  // Toggle permission
  const togglePermission = useCallback(async (permission) => {
    if (!user) return;

    try {
      setLoading(true);
      const hasPerm = hasPermission(permission.id);

      let response;
      if (hasPerm) {
        response = await userManagementService.revokeUserPermission(user.id, permission.id);
      } else {
        response = await userManagementService.assignUserPermission(user.id, permission.id);
      }

      if (response.success) {
        // Update local state
        if (hasPerm) {
          setUserPermissions(prev => prev.filter(up => up.id !== permission.id));
        } else {
          setUserPermissions(prev => [...prev, permission]);
        }

        toast.success(`Permission ${hasPerm ? 'revoked' : 'assigned'} successfully`);
      } else {
        throw new Error(response.message || 'Failed to update permission');
      }
    } catch (err) {
      handleError(err, { context: 'Toggle Permission' });
    } finally {
      setLoading(false);
    }
  }, [user, hasPermission]);

  // Save all changes
  const handleSave = useCallback(async () => {
    try {
      setLoading(true);

      // Get current permission IDs
      const currentPermissionIds = userPermissions.map(up => up.id);

      // Get all permission IDs
      const allPermissionIds = permissions.map(p => p.id);

      // Calculate permissions to add and remove
      const permissionsToAdd = allPermissionIds.filter(id => !currentPermissionIds.includes(id));
      const permissionsToRemove = currentPermissionIds.filter(id => !allPermissionIds.includes(id));

      // Apply changes
      for (const permissionId of permissionsToAdd) {
        await userManagementService.assignUserPermission(user.id, permissionId);
      }

      for (const permissionId of permissionsToRemove) {
        await userManagementService.revokeUserPermission(user.id, permissionId);
      }

      toast.success('User permissions updated successfully');
      if (onPermissionsUpdated) {
        onPermissionsUpdated(user);
      }
      onOpenChange(false);
    } catch (err) {
      handleError(err, { context: 'Save User Permissions' });
    } finally {
      setLoading(false);
    }
  }, [user, userPermissions, permissions, onPermissionsUpdated, onOpenChange]);

  if (!user) return null;

  const categories = ['all', ...Object.keys(groupedPermissions)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Manage Permissions
          </DialogTitle>
          <DialogDescription>
            Manage permissions for {user.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Permissions List */}
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => {
              if (selectedCategory !== 'all' && selectedCategory !== category) return null;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-sm capitalize">{category} Permissions</CardTitle>
                    <CardDescription>
                      {categoryPermissions.length} permission{categoryPermissions.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categoryPermissions.map(permission => {
                        const hasPerm = hasPermission(permission.id);

                        return (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium">{permission.name}</h4>
                                {hasPerm && (
                                  <Badge variant="default" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Assigned
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                            </div>
                            <Checkbox
                              checked={hasPerm}
                              onCheckedChange={() => togglePermission(permission)}
                              disabled={loading}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {userPermissions.length} of {permissions.length} permissions assigned
                </div>
                <div className="text-sm font-medium">
                  {Math.round((userPermissions.length / permissions.length) * 100)}% assigned
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Save Permissions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserPermissionsModal;
