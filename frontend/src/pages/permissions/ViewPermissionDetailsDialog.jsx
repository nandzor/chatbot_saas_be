import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { X, Loader2, Shield, Calendar, Settings, AlertCircle, Key, Lock, Users, Edit, Copy, Trash2 } from 'lucide-react';
import { permissionManagementService } from '@/services/PermissionManagementService';

const ViewPermissionDetailsDialog = ({ open, onOpenChange, permission, onEdit, onClone, onDelete }) => {
  const [permissionDetails, setPermissionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPermissionDetails = useCallback(async () => {
    if (!permission?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await permissionManagementService.getPermission(permission.id);

      if (response.success) {
        setPermissionDetails(response.data);
      } else {
        setError(response.message || 'Failed to load permission details');
      }
    } catch (err) {
      console.error('Load permission details error:', err);
      setError(err.message || 'Failed to load permission details');
    } finally {
      setLoading(false);
    }
  }, [permission?.id]);

  useEffect(() => {
    if (open && permission?.id) {
      loadPermissionDetails();
    }
  }, [open, permission?.id, loadPermissionDetails]);

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  if (!permission) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Permission Details: {permission.name}</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this permission including settings and usage.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          ) : permissionDetails ? (
            <>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg font-semibold">{permissionDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Display Name</label>
                      <p className="text-lg">{permissionDetails.display_name || permissionDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <Badge variant="outline">
                        {permissionDetails.category || 'General'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Resource</label>
                      <p className="text-lg font-mono">{permissionDetails.resource || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge variant={permissionDetails.is_active ? 'default' : 'destructive'}>
                        {permissionDetails.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">System Permission</label>
                      <Badge variant={permissionDetails.is_system_permission ? 'default' : 'outline'}>
                        {permissionDetails.is_system_permission ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Dangerous</label>
                      <Badge variant={permissionDetails.is_dangerous ? 'destructive' : 'outline'}>
                        {permissionDetails.is_dangerous ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Visible</label>
                      <Badge variant={permissionDetails.is_visible ? 'default' : 'outline'}>
                        {permissionDetails.is_visible ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  {permissionDetails.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-700 mt-1">{permissionDetails.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Permission Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Permission Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sort Order</label>
                      <p className="text-lg">{permissionDetails.sort_order || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Guard Name</label>
                      <p className="text-lg">{permissionDetails.guard_name || 'web'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p>{permissionDetails.created_at ? new Date(permissionDetails.created_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Updated At</label>
                      <p>{permissionDetails.updated_at ? new Date(permissionDetails.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Usage Information
                  </CardTitle>
                  <CardDescription>
                    Information about how this permission is used in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assigned to Roles</label>
                      <p className="text-lg">{permissionDetails.roles_count || 0} roles</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Assigned to Users</label>
                      <p className="text-lg">{permissionDetails.users_count || 0} users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Last updated: {permission?.updated_at ? new Date(permission.updated_at).toLocaleDateString() : 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
            {onEdit && (
              <Button
                onClick={() => { onEdit(permission); handleClose(); }}
                size="sm"
                className="h-8 w-8 p-0 text-white bg-blue-600 hover:bg-blue-700"
                title="Edit Permission"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onClone && (
              <Button
                onClick={() => { onClone(permission); handleClose(); }}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                title="Clone Permission"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => { onDelete(permission); handleClose(); }}
                variant="destructive"
                size="sm"
                className="h-8 w-8 p-0 text-white bg-red-600 hover:bg-red-700"
                title="Delete Permission"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewPermissionDetailsDialog;
