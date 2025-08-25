import React, { useState, useCallback } from 'react';
import {
  Trash2,
  Copy,
  Archive,
  RotateCcw,
  Download,
  Upload,
  Users,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { roleManagementService } from '@/services/RoleManagementService';
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

const RoleBulkActions = ({ selectedRoles, onSuccess, onClearSelection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [bulkOptions, setBulkOptions] = useState({});

  // Available bulk actions
  const bulkActions = [
    {
      id: 'delete',
      label: 'Delete Roles',
      description: 'Permanently delete selected roles',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      confirmText: 'DELETE',
      dangerous: true
    },
    {
      id: 'clone',
      label: 'Clone Roles',
      description: 'Create copies of selected roles',
      icon: Copy,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      confirmText: 'CLONE'
    },
    {
      id: 'archive',
      label: 'Archive Roles',
      description: 'Archive selected roles',
      icon: Archive,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      confirmText: 'ARCHIVE'
    },
    {
      id: 'unarchive',
      label: 'Unarchive Roles',
      description: 'Restore archived roles',
      icon: RotateCcw,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      confirmText: 'UNARCHIVE'
    },
    {
      id: 'assign_users',
      label: 'Assign Users',
      description: 'Assign users to selected roles',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      confirmText: 'ASSIGN'
    },
    {
      id: 'export',
      label: 'Export Roles',
      description: 'Export selected roles data',
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
      const roleIds = selectedRoles.map(role => role.id);

      switch (action) {
        case 'delete':
          response = await roleManagementService.bulkDelete(roleIds);
          break;
        case 'clone':
          response = await roleManagementService.bulkClone(roleIds, bulkOptions);
          break;
        case 'archive':
          response = await roleManagementService.bulkArchive(roleIds);
          break;
        case 'unarchive':
          response = await roleManagementService.bulkUnarchive(roleIds);
          break;
        case 'assign_users':
          response = await roleManagementService.bulkAssignUsers(roleIds, bulkOptions);
          break;
        case 'export':
          response = await roleManagementService.exportRoles('json', { role_ids: roleIds });
          // Handle file download
          const blob = new Blob([response], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `roles_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Roles exported successfully');
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
      console.error('Error executing bulk action:', error);
      toast.error(error.message || `Failed to ${selectedAction.label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  }, [action, confirmText, bulkOptions, selectedRoles, onSuccess, onClearSelection]);

  // Get selected action details
  const selectedActionDetails = bulkActions.find(a => a.id === action);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={selectedRoles.length === 0}
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Bulk Actions ({selectedRoles.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedRoles.length} selected role{selectedRoles.length !== 1 ? 's' : ''}
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

              {/* Selected Roles Preview */}
              <div>
                <Label className="text-sm font-medium">Selected Roles</Label>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {selectedRoles.map((role) => (
                    <div key={role.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color || '#6B7280' }}
                      />
                      <span className="text-sm font-medium">{role.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {role.scope}
                      </Badge>
                      {role.is_system_role && (
                        <Badge variant="secondary" className="text-xs">
                          System
                        </Badge>
                      )}
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
                    <Label htmlFor="clone-scope">New Scope</Label>
                    <Select
                      value={bulkOptions.newScope || ''}
                      onValueChange={(value) => setBulkOptions(prev => ({ ...prev, newScope: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Keep original scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {action === 'assign_users' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="user-ids">User IDs (comma-separated)</Label>
                    <Textarea
                      id="user-ids"
                      placeholder="Enter user IDs separated by commas"
                      value={bulkOptions.userIds || ''}
                      onChange={(e) => setBulkOptions(prev => ({ ...prev, userIds: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignment-scope">Assignment Scope</Label>
                    <Select
                      value={bulkOptions.assignmentScope || 'organization'}
                      onValueChange={(value) => setBulkOptions(prev => ({ ...prev, assignmentScope: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
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

export default RoleBulkActions;
