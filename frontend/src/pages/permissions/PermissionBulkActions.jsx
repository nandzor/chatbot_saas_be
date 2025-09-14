import React, { useState, useCallback } from 'react';
import {
  Trash2,
  Copy,
  Archive,
  RotateCcw,
  Download,
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Key,
  Lock
} from 'lucide-react';
import { permissionManagementService } from '@/services/PermissionManagementService';
import { toast } from 'react-hot-toast';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@/components/ui';

const PermissionBulkActions = ({ selectedPermissions, onSuccess, onClearSelection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [bulkOptions, setBulkOptions] = useState({});

  // Available bulk actions
  const bulkActions = [
    {
      id: 'delete',
      label: 'Delete Permissions',
      description: 'Permanently delete selected permissions',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      confirmText: 'DELETE',
      dangerous: true
    },
    {
      id: 'clone',
      label: 'Clone Permissions',
      description: 'Create copies of selected permissions',
      icon: Copy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      confirmText: 'CLONE'
    },
    {
      id: 'archive',
      label: 'Archive Permissions',
      description: 'Archive selected permissions',
      icon: Archive,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      confirmText: 'ARCHIVE'
    },
    {
      id: 'unarchive',
      label: 'Unarchive Permissions',
      description: 'Restore archived permissions',
      icon: RotateCcw,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      confirmText: 'UNARCHIVE'
    },
    {
      id: 'change_status',
      label: 'Change Status',
      description: 'Change status of selected permissions',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      confirmText: 'CHANGE'
    },
    {
      id: 'export',
      label: 'Export Permissions',
      description: 'Export selected permissions data',
      icon: Download,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      confirmText: 'EXPORT'
    }
  ];

  // Handle action selection
  const handleActionSelect = useCallback((selectedAction) => {
    setAction(selectedAction);
    setConfirmText('');
    setBulkOptions({});
  }, []);

  // Handle bulk action execution
  const handleExecuteAction = useCallback(async () => {
    if (!action) return;

    const selectedAction = bulkActions.find(a => a.id === action);
    if (!selectedAction) return;

    // Validate confirmation text for dangerous actions
    if (selectedAction.dangerous && confirmText !== selectedAction.confirmText) {
      toast.error(`Please type "${selectedAction.confirmText}" to confirm`);
      return;
    }

    try {
      setLoading(true);

      let response;
      const permissionIds = selectedPermissions.map(permission => permission.id);

      switch (action) {
        case 'delete':
          response = await permissionManagementService.bulkDelete(permissionIds);
          break;
        case 'clone':
          response = await permissionManagementService.bulkClone(permissionIds, bulkOptions);
          break;
        case 'archive':
          response = await permissionManagementService.bulkArchive(permissionIds);
          break;
        case 'unarchive':
          response = await permissionManagementService.bulkUnarchive(permissionIds);
          break;
        case 'change_status':
          response = await permissionManagementService.bulkChangeStatus(permissionIds, bulkOptions);
          break;
        case 'export':
          response = await permissionManagementService.exportPermissions('json', { permission_ids: permissionIds });
          // Handle file download
          const blob = new Blob([response], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `permissions_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Permissions exported successfully');
          setIsOpen(false);
          return;
        default:
          throw new Error('Unknown action');
      }

      if (response.success) {
        toast.success(response.message || `${selectedAction.label} completed successfully`);

        if (onSuccess) {
          await onSuccess(response.data);
        }

        if (onClearSelection) {
          onClearSelection();
        }

        setIsOpen(false);
      } else {
        toast.error(response.message || `Failed to ${selectedAction.label.toLowerCase()}`);
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${selectedAction.label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [action, confirmText, bulkOptions, selectedPermissions, onSuccess, onClearSelection]);

  // Get selected action details
  const selectedActionDetails = bulkActions.find(a => a.id === action);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={selectedPermissions.length === 0}
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Bulk Actions ({selectedPermissions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedPermissions.length} selected permission{selectedPermissions.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Selection */}
          {!action && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bulkActions.map((bulkAction) => (
                <Card
                  key={bulkAction.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${bulkAction.borderColor}`}
                  onClick={() => handleActionSelect(bulkAction.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${bulkAction.bgColor}`}>
                        <bulkAction.icon className={`w-5 h-5 ${bulkAction.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{bulkAction.label}</CardTitle>
                        <CardDescription className="text-sm">
                          {bulkAction.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {/* Action Configuration */}
          {action && selectedActionDetails && (
            <div className="space-y-4">
              {/* Selected Action Header */}
              <div className={`p-4 rounded-lg ${selectedActionDetails.bgColor} ${selectedActionDetails.borderColor} border`}>
                <div className="flex items-center gap-3">
                  <selectedActionDetails.icon className={`w-6 h-6 ${selectedActionDetails.color}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedActionDetails.label}</h3>
                    <p className="text-sm text-gray-600">{selectedActionDetails.description}</p>
                  </div>
                </div>
              </div>

              {/* Selected Permissions Preview */}
              <div>
                <Label className="text-sm font-medium">Selected Permissions</Label>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {selectedPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Key className="w-3 h-3 text-gray-500" />
                        <span className="text-sm font-medium">{permission.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {permission.category || 'General'}
                        </Badge>
                        <Badge variant={permission.is_active ? 'default' : 'destructive'} className="text-xs">
                          {permission.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action-specific Options */}
              {action === 'clone' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="clone-prefix">Name Prefix</Label>
                    <Input
                      id="clone-prefix"
                      placeholder="e.g., Copy of"
                      value={bulkOptions.prefix || ''}
                      onChange={(e) => setBulkOptions(prev => ({ ...prev, prefix: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clone-suffix">Name Suffix</Label>
                    <Input
                      id="clone-suffix"
                      placeholder="e.g., (Copy)"
                      value={bulkOptions.suffix || ''}
                      onChange={(e) => setBulkOptions(prev => ({ ...prev, suffix: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clone-category">New Category</Label>
                    <Select
                      value={bulkOptions.newCategory || ''}
                      onValueChange={(value) => setBulkOptions(prev => ({ ...prev, newCategory: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Keep original category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="user_management">User Management</SelectItem>
                        <SelectItem value="role_management">Role Management</SelectItem>
                        <SelectItem value="permission_management">Permission Management</SelectItem>
                        <SelectItem value="system_settings">System Settings</SelectItem>
                        <SelectItem value="content_management">Content Management</SelectItem>
                        <SelectItem value="reporting">Reporting</SelectItem>
                        <SelectItem value="api_access">API Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {action === 'change_status' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-status">New Status</Label>
                    <Select
                      value={bulkOptions.newStatus || ''}
                      onValueChange={(value) => setBulkOptions(prev => ({ ...prev, newStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Confirmation for Dangerous Actions */}
              {selectedActionDetails.dangerous && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Dangerous Action</p>
                      <p className="text-sm text-red-700">
                        This action cannot be undone. Please type "{selectedActionDetails.confirmText}" to confirm.
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirm-text">Confirmation</Label>
                    <Input
                      id="confirm-text"
                      placeholder={`Type "${selectedActionDetails.confirmText}" to confirm`}
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className={confirmText === selectedActionDetails.confirmText ? 'border-green-500' : ''}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-3">
            {action && (
              <Button
                variant="outline"
                onClick={() => {
                  setAction('');
                  setConfirmText('');
                  setBulkOptions({});
                }}
                disabled={loading}
              >
                Back
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            {action && (
              <Button
                onClick={handleExecuteAction}
                disabled={loading || (selectedActionDetails?.dangerous && confirmText !== selectedActionDetails.confirmText)}
                className={selectedActionDetails?.dangerous ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {selectedActionDetails?.label}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PermissionBulkActions;
