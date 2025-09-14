import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  Users,
  UserPlus,
  Search,
  Check,
  Loader2,
  AlertCircle
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
  Select,
  SelectItem,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui';

const RoleAssignmentModal = ({ open, onOpenChange, role, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentOptions, setAssignmentOptions] = useState({
    is_active: true,
    is_primary: false,
    scope: 'organization',
    scope_context: {},
    effective_from: new Date().toISOString().split('T')[0],
    effective_until: '',
    assigned_reason: ''
  });

  // Load available users when modal opens
  useEffect(() => {
    if (open && role) {
      loadAvailableUsers();
    }
  }, [open, role]);

  // Load available users for role assignment
  const loadAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roleManagementService.getAvailableUsersForRole(role.id);

      if (response.success) {
        setUsers(response.data);
      } else {
        toast.error(response.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [role?.id]);

  // Handle user selection
  const handleUserToggle = useCallback((userId, checked) => {
    setSelectedUsers(prev =>
      checked
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  }, []);

  // Handle assignment option changes
  const handleAssignmentOptionChange = useCallback((field, value) => {
    setAssignmentOptions(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Submit role assignment
  const handleSubmit = useCallback(async () => {
    if (!role?.id || selectedUsers.length === 0) return;

    try {
      setSubmitting(true);
      const response = await roleManagementService.bulkAssignRole(role.id, {
        user_ids: selectedUsers,
        ...assignmentOptions
      });

      if (response.success) {
        toast.success(`Role assigned to ${selectedUsers.length} user(s) successfully`);
        if (onSuccess) {
          await onSuccess(response.data);
        }
        onOpenChange(false);
      } else {
        toast.error(response.message || 'Failed to assign role');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to assign role');
    } finally {
      setSubmitting(false);
    }
  }, [selectedUsers, assignmentOptions, role, onSuccess, onOpenChange]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Role
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
          <DialogDescription>
            Assign "{role?.name}" role to users
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6">
          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: (role?.color || '#6B7280') + '20' }}
                >
                  <Users className="w-6 h-6" style={{ color: role?.color || '#6B7280' }} />
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
                  {selectedUsers.length} user(s) selected
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Options */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Options</CardTitle>
              <CardDescription>
                Configure how the role will be assigned to users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={assignmentOptions.is_active}
                    onCheckedChange={(checked) => handleAssignmentOptionChange('is_active', checked)}
                    disabled={submitting}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Active Assignment
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_primary"
                    checked={assignmentOptions.is_primary}
                    onCheckedChange={(checked) => handleAssignmentOptionChange('is_primary', checked)}
                    disabled={submitting}
                  />
                  <label htmlFor="is_primary" className="text-sm font-medium">
                    Primary Role
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
                <Select
                  value={assignmentOptions.scope}
                  onValueChange={(value) => handleAssignmentOptionChange('scope', value)}
                  disabled={submitting}
                >
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective From
                  </label>
                  <Input
                    type="date"
                    value={assignmentOptions.effective_from}
                    onChange={(e) => handleAssignmentOptionChange('effective_from', e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Until
                  </label>
                  <Input
                    type="date"
                    value={assignmentOptions.effective_until}
                    onChange={(e) => handleAssignmentOptionChange('effective_until', e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Reason
                </label>
                <Input
                  placeholder="Enter reason for role assignment..."
                  value={assignmentOptions.assigned_reason}
                  onChange={(e) => handleAssignmentOptionChange('assigned_reason', e.target.value)}
                  disabled={submitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Users</CardTitle>
              <CardDescription>
                Choose users to assign this role to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Users List */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading users...</span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleUserToggle(user.id, checked)}
                        disabled={submitting}
                      />
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.username && (
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        )}
                      </div>
                      <Badge variant="outline">
                        {user.status || 'Active'}
                      </Badge>
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
            disabled={submitting || loading || selectedUsers.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleAssignmentModal;
