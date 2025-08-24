import React, { useState, useEffect } from 'react';
import { roleManagementService } from '@/services/RoleManagementService';

const RoleAssignmentModal = ({ role, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentOptions, setAssignmentOptions] = useState({
    is_active: true,
    is_primary: false,
    scope: 'organization',
    assigned_reason: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // This would typically load users from a user service
      // For now, we'll use a mock response
      const mockUsers = [
        { id: '1', email: 'user1@example.com', full_name: 'User One', status: 'active' },
        { id: '2', email: 'user2@example.com', full_name: 'User Two', status: 'active' },
        { id: '3', email: 'user3@example.com', full_name: 'User Three', status: 'active' },
      ];
      setUsers(mockUsers);
    } catch (error) {
      setError('Failed to load users');
    }
  };

  const handleUserSelection = (userId, checked) => {
    setSelectedUsers(prev =>
      checked
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedUsers(checked ? users.map(user => user.id) : []);
  };

  const handleAssignmentOptionChange = (field, value) => {
    setAssignmentOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await roleManagementService.assignRole(role.id, selectedUsers, assignmentOptions);
      onSuccess();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Assign Role: {role.display_name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Role Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Role Code:</span>
                <span className="ml-2 text-gray-900">{role.code}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Scope:</span>
                <span className="ml-2 text-gray-900 capitalize">{role.scope}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Level:</span>
                <span className="ml-2 text-gray-900">{role.level}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Current Users:</span>
                <span className="ml-2 text-gray-900">{role.users_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Assignment Options */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Assignment Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={assignmentOptions.is_active}
                  onChange={(e) => handleAssignmentOptionChange('is_active', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active Assignment
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={assignmentOptions.is_primary}
                  onChange={(e) => handleAssignmentOptionChange('is_primary', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-900">
                  Primary Role
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Scope</label>
                <select
                  value={assignmentOptions.scope}
                  onChange={(e) => handleAssignmentOptionChange('scope', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="global">Global</option>
                  <option value="organization">Organization</option>
                  <option value="department">Department</option>
                  <option value="team">Team</option>
                  <option value="personal">Personal</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Assignment Reason (Optional)
              </label>
              <textarea
                value={assignmentOptions.assigned_reason}
                onChange={(e) => handleAssignmentOptionChange('assigned_reason', e.target.value)}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter reason for assignment..."
              />
            </div>
          </div>

          {/* User Selection */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Select Users ({selectedUsers.length} selected)
              </h4>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="select_all"
                  checked={selectedUsers.length === users.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="select_all" className="ml-2 block text-sm text-gray-900">
                  Select All
                </label>
              </div>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2"
            />

            {/* Users List */}
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                  <input
                    type="checkbox"
                    id={`user_${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`user_${user.id}`} className="ml-3 flex-1 cursor-pointer">
                    <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || selectedUsers.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : `Assign to ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;
