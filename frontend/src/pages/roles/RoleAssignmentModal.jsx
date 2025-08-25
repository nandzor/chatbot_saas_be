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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox
} from '@/components/ui';

const RoleAssignmentModal = ({ isOpen, onClose, role, onSuccess }) => {
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
    if (isOpen && role) {
      loadAvailableUsers();
    }
  }, [isOpen, role]);

  // Load available users for role assignment
  const loadAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Get users that can be assigned to this role
      const response = await roleManagementService.getAvailableUsersForRole(role.id);

      if (response.success) {
        setUsers(response.data || []);
      } else {
        toast.error('Failed to load available users');
      }
    } catch (error) {
      console.error('Error loading available users:', error);
      toast.error('Failed to load available users');
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Handle user selection
  const handleUserSelection = useCallback((userId, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  }, []);

  // Handle assignment option changes
  const handleAssignmentOptionChange = useCallback((field, value) => {
    setAssignmentOptions(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    try {
      setSubmitting(true);

      const assignmentData = {
        role_id: role.id,
        user_ids: selectedUsers,
        ...assignmentOptions
      };

      const response = await roleManagementService.assignRole(role.id, selectedUsers, assignmentOptions);

      if (response.success) {
        toast.success(`Role "${role.name}" has been assigned to ${selectedUsers.length} user(s) successfully`);

        if (onSuccess) {
          await onSuccess(response.data);
        }

        onClose();
      } else {
        toast.error(response.message || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(error.message || 'Failed to assign role');
    } finally {
      setSubmitting(false);
    }
  }, [selectedUsers, assignmentOptions, role, onSuccess, onClose]);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign Role</h2>
              <p className="text-sm text-gray-600">
                Assign "{role?.name}" role to users
              </p>
            </div>
          </div>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
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
                    <p className="text-sm text-gray-500 font-mono">
                      {role?.code || 'role_code'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {role?.description || 'Role description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {role?.scope || 'scope'}
                      </Badge>
                      <Badge variant="outline">Level {role?.level || '50'}</Badge>
                    </div>
                  </div>
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
                      Effective Until (Optional)
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
                    Assignment Reason (Optional)
                  </label>
                  <textarea
                    value={assignmentOptions.assigned_reason}
                    onChange={(e) => handleAssignmentOptionChange('assigned_reason', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter reason for assignment..."
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
                  Choose users to assign this role to ({selectedUsers.length} selected)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users by name, email, or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Users List */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading available users...</span>
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">
                        {searchTerm ? 'No users found matching your search' : 'No users available for assignment'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleUserSelection(user.id, checked)}
                          disabled={submitting}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{user.name || user.full_name}</h4>
                            {user.is_primary_role && (
                              <Badge variant="secondary" className="text-xs">Primary</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.current_roles && user.current_roles.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-gray-400">Current roles:</span>
                              {user.current_roles.slice(0, 2).map((role, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {role.name}
                                </Badge>
                              ))}
                              {user.current_roles.length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{user.current_roles.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
              disabled={submitting || selectedUsers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
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
        </form>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;
