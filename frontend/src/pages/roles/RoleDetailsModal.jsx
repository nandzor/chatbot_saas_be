import React, { useState, useEffect } from 'react';
import { roleManagementService } from '@/services/RoleManagementService';

const RoleDetailsModal = ({ role, onClose }) => {
  const [roleDetails, setRoleDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRoleDetails();
  }, [role.id]);

  const loadRoleDetails = async () => {
    try {
      setLoading(true);
      const response = await roleManagementService.getRole(role.id);
      setRoleDetails(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Role Details: {roleDetails?.display_name}
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

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'permissions', name: 'Permissions' },
                { id: 'users', name: 'Users' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Name:</span>
                        <p className="text-sm text-gray-900">{roleDetails?.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Code:</span>
                        <p className="text-sm text-gray-900 font-mono">{roleDetails?.code}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Display Name:</span>
                        <p className="text-sm text-gray-900">{roleDetails?.display_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Level:</span>
                        <p className="text-sm text-gray-900">{roleDetails?.level}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Scope:</span>
                        <p className="text-sm text-gray-900 capitalize">{roleDetails?.scope}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          roleDetails?.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {roleDetails?.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {roleDetails?.description && (
                      <div className="mt-4">
                        <span className="text-sm font-medium text-gray-500">Description:</span>
                        <p className="text-sm text-gray-900 mt-1">{roleDetails.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">{roleDetails?.users_count || 0}</div>
                      <div className="text-sm text-blue-600">Assigned Users</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">{roleDetails?.permissions_count || 0}</div>
                      <div className="text-sm text-green-600">Permissions</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {roleDetails?.is_system_role ? 'System' : 'Custom'}
                      </div>
                      <div className="text-sm text-purple-600">Role Type</div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {roleDetails?.metadata && Object.keys(roleDetails.metadata).length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Metadata</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-900 overflow-x-auto">
                        {JSON.stringify(roleDetails.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'permissions' && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Permissions ({roleDetails?.permissions?.length || 0})
                </h4>
                {roleDetails?.permissions && roleDetails.permissions.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roleDetails.permissions.map((permission) => (
                        <div key={permission.id} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {permission.display_name}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {permission.code}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {permission.category} • {permission.resource}.{permission.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No s.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Assigned Users ({roleDetails?.users?.length || 0})
                </h4>
                {roleDetails?.users && roleDetails.users.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {roleDetails.users.map((user) => (
                        <div key={user.id} className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              {user.organization && (
                                <div className="text-xs text-gray-400">
                                  {user.organization.name}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                              {user.pivot && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {user.pivot.is_primary && (
                                    <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">
                                      Primary
                                    </span>
                                  )}
                                  {user.pivot.is_active ? 'Active' : 'Inactive'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No users assigned to this role.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetailsModal;
