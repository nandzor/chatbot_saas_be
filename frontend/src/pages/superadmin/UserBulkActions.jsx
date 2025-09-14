import React, { useState, useCallback } from 'react';
import {
  Trash2,
  Copy,
  Archive,
  RotateCcw,
  Download,
  Upload,
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
  UserCheck,
  UserX,
  Mail
} from 'lucide-react';
import userManagementService from '@/services/UserManagementService';
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

const UserBulkActions = ({ selectedUsers, onSuccess, onClearSelection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [bulkOptions, setBulkOptions] = useState({});

  // Available bulk actions
  const bulkActions = [
    {
      id: 'delete',
      label: 'Delete Users',
      description: 'Permanently delete selected users',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      confirmText: 'DELETE',
      dangerous: true
    },
    {
      id: 'activate',
      label: 'Activate Users',
      description: 'Activate selected users',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      confirmText: 'ACTIVATE'
    },
    {
      id: 'deactivate',
      label: 'Deactivate Users',
      description: 'Deactivate selected users',
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      confirmText: 'DEACTIVATE'
    },
    {
      id: 'change_role',
      label: 'Change Role',
      description: 'Change role of selected users',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      confirmText: 'CHANGE'
    },
    {
      id: 'send_email',
      label: 'Send Email',
      description: 'Send email to selected users',
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      confirmText: 'SEND'
    },
    {
      id: 'export',
      label: 'Export Users',
      description: 'Export selected users data',
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
      const userIds = selectedUsers.map(user => user.id);

      switch (action) {
        case 'delete':
          response = await userManagementService.bulkDelete(userIds);
          break;
        case 'activate':
          response = await userManagementService.bulkActivate(userIds);
          break;
        case 'deactivate':
          response = await userManagementService.bulkDeactivate(userIds);
          break;
        case 'change_role':
          response = await userManagementService.bulkChangeRole(userIds, bulkOptions);
          break;
        case 'send_email':
          response = await userManagementService.bulkSendEmail(userIds, bulkOptions);
          break;
        case 'export':
          response = await userManagementService.exportUsers('json', { user_ids: userIds });
          // Handle file download
          const blob = new Blob([response], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `users_export_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Users exported successfully');
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
  }, [action, confirmText, bulkOptions, selectedUsers, onSuccess, onClearSelection]);

  // Get selected action details
  const selectedActionDetails = bulkActions.find(a => a.id === action);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={selectedUsers.length === 0}
          className="flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Bulk Actions ({selectedUsers.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}
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

              {/* Selected Users Preview */}
              <div>
                <Label className="text-sm font-medium">Selected Users</Label>
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {selectedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-sm font-medium">{user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.email}
                        </Badge>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action-specific Options */}
              {action === 'change_role' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-role">New Role</Label>
                    <Select
                      value={bulkOptions.newRole || ''}
                      onValueChange={(value) => setBulkOptions(prev => ({ ...prev, newRole: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select new role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {action === 'send_email' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      placeholder="Enter email subject"
                      value={bulkOptions.subject || ''}
                      onChange={(e) => setBulkOptions(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-message">Email Message</Label>
                    <Textarea
                      id="email-message"
                      placeholder="Enter email message"
                      value={bulkOptions.message || ''}
                      onChange={(e) => setBulkOptions(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                    />
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

export default UserBulkActions;
