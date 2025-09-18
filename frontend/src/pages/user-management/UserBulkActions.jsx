/**
 * User Bulk Actions Component
 * Component untuk aksi massal pada user
 */

import React, { useState, useCallback } from 'react';
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
  SelectItem,
  Textarea,
  Alert,
  AlertDescription
} from '@/components/ui';
import {
  Users,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Loader2,
  User,
  Mail,
  Shield,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { handleError } from '@/utils/errorHandler';
import UserManagementService from '@/services/UserManagementService';

const userManagementService = new UserManagementService();

const UserBulkActions = ({ selectedUsers, onClearSelection, onBulkAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [bulkOptions, setBulkOptions] = useState({});

  // Available bulk actions
  const bulkActions = [
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
      icon: Shield,
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
      id: 'delete',
      label: 'Delete Users',
      description: 'Permanently delete selected users',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      confirmText: 'DELETE',
      dangerous: true
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
        case 'activate':
          response = await userManagementService.bulkUpdateUsers({
            user_ids: userIds,
            status: 'active'
          });
          break;
        case 'deactivate':
          response = await userManagementService.bulkUpdateUsers({
            user_ids: userIds,
            status: 'inactive'
          });
          break;
        case 'change_role':
          response = await userManagementService.bulkUpdateUsers({
            user_ids: userIds,
            role: bulkOptions.role
          });
          break;
        case 'send_email':
          response = await userManagementService.bulkUpdateUsers({
            user_ids: userIds,
            action: 'send_email',
            email_data: bulkOptions
          });
          break;
        case 'delete':
          // Delete users one by one
          for (const user of selectedUsers) {
            await userManagementService.deleteUser(user.id);
          }
          response = { success: true, message: 'Users deleted successfully' };
          break;
        default:
          throw new Error('Unknown action');
      }

      if (response.success) {
        toast.success(response.message || `${selectedAction.label} completed successfully`);

        if (onBulkAction) {
          await onBulkAction(action);
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
  }, [action, confirmText, bulkOptions, selectedUsers, onBulkAction, onClearSelection]);

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
                        <span className="text-sm font-medium">{user.full_name}</span>
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
                      value={bulkOptions.role || ''}
                      onValueChange={(value) => setBulkOptions(prev => ({ ...prev, role: value }))}
                      placeholder="Select new role"
                    >
                      <SelectItem value="org_admin">Admin</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="user">User</SelectItem>
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
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This action cannot be undone. Please type "{selectedActionDetails.confirmText}" to confirm.
                    </AlertDescription>
                  </Alert>
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
