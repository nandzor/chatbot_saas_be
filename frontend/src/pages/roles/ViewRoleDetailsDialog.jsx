import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Button, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { X, Loader2, Shield, Users, Calendar, Settings, AlertCircle } from 'lucide-react';
import { roleManagementService } from '@/services/RoleManagementService';
import { toast } from 'react-hot-toast';

const ViewRoleDetailsDialog = ({ open, onOpenChange, role }) => {
  const [roleDetails, setRoleDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRoleDetails = useCallback(async () => {
    if (!role?.id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await roleManagementService.getRole(role.id);

      if (response.success) {
        setRoleDetails(response.data);
      } else {
        setError(response.message || 'Failed to load role details');
      }
    } catch (err) {
      console.error('Load role details error:', err);
      setError(err.message || 'Failed to load role details');
    } finally {
      setLoading(false);
    }
  }, [role?.id]);

  useEffect(() => {
    if (open && role?.id) {
      loadRoleDetails();
    }
  }, [open, role?.id, loadRoleDetails]);

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  if (!role) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Role Details: {role.name}</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this role including permissions and assignments.
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
          ) : roleDetails ? (
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
                      <p className="text-lg font-semibold">{roleDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Display Name</label>
                      <p className="text-lg">{roleDetails.display_name || roleDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Code</label>
                      <p className="text-lg font-mono">{roleDetails.code || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Scope</label>
                      <Badge variant={roleDetails.scope === 'global' ? 'default' : 'secondary'}>
                        {roleDetails.scope?.charAt(0).toUpperCase() + roleDetails.scope?.slice(1) || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge variant={roleDetails.is_active ? 'default' : 'destructive'}>
                        {roleDetails.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">System Role</label>
                      <Badge variant={roleDetails.is_system_role ? 'default' : 'outline'}>
                        {roleDetails.is_system_role ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  {roleDetails.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-700 mt-1">{roleDetails.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Permissions ({roleDetails.permissions?.length || 0})
                  </CardTitle>
                  <CardDescription>
                    List of permissions assigned to this role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {roleDetails.permissions?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {roleDetails.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">{permission.name}</span>
                          {permission.category && (
                            <Badge variant="outline" className="text-xs">
                              {permission.category}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No permissions assigned</p>
                  )}
                </CardContent>
              </Card>

              {/* Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assigned Users ({roleDetails.users?.length || 0})
                  </CardTitle>
                  <CardDescription>
                    Users who have been assigned this role
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {roleDetails.users?.length > 0 ? (
                    <div className="space-y-2">
                      {roleDetails.users.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                          <Badge variant="outline">
                            {user.role_assignment?.is_primary ? 'Primary' : 'Secondary'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No users assigned to this role</p>
                  )}
                </CardContent>
              </Card>

              {/* Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-500">Created At</label>
                      <p>{roleDetails.created_at ? new Date(roleDetails.created_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Updated At</label>
                      <p>{roleDetails.updated_at ? new Date(roleDetails.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Level</label>
                      <p>{roleDetails.level || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-500">Organization</label>
                      <p>{roleDetails.organization?.name || 'Global'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewRoleDetailsDialog;
