import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/AuthService';
import { debugAuth, clearAuthDebug, testApiAuth } from '@/utils/authDebug';
import { testAuthentication, testRoleManagement, testPermissionManagement, testUserManagement } from '@/utils/testAuth';

const AuthDebugPanel = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    if (import.meta.env.DEV) {
      updateDebugInfo();
    }
  }, [user, isAuthenticated]);

  const updateDebugInfo = () => {
    const info = {
      isAuthenticated,
      isLoading,
      user: user ? {
        id: user.id,
        name: user.name || user.full_name,
        email: user.email,
        username: user.username,
        role: user.role,
        roles: user.roles,
        permissions: user.permissions
      } : null,
      tokens: authService.getTokens(),
      localStorage: {
        jwt_token: localStorage.getItem('jwt_token') ? 'Present' : 'Missing',
        sanctum_token: localStorage.getItem('sanctum_token') ? 'Present' : 'Missing',
        refresh_token: localStorage.getItem('refresh_token') ? 'Present' : 'Missing',
        chatbot_user: localStorage.getItem('chatbot_user') ? 'Present' : 'Missing'
      }
    };
    setDebugInfo(info);
  };

  const runTest = async (testName, testFunction) => {
    setTestResults(prev => ({ ...prev, [testName]: 'Running...' }));
    try {
      await testFunction();
      setTestResults(prev => ({ ...prev, [testName]: 'Completed' }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testName]: `Error: ${error.message}` }));
    }
  };

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Auth Debug Panel</h3>
        <button
          onClick={() => setDebugInfo(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 text-xs">
        {/* Authentication Status */}
        <div>
          <div className="font-medium text-gray-700">Authentication Status:</div>
          <div className={`inline-block px-2 py-1 rounded text-xs ${
            isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div>
            <div className="font-medium text-gray-700">User Info:</div>
            <div className="text-gray-600">
              <div>Name: {user.name || user.full_name}</div>
              <div>Email: {user.email}</div>
              <div>Role: {user.role}</div>
              <div>Permissions: {user.permissions?.length || 0}</div>
            </div>
          </div>
        )}

        {/* Token Status */}
        <div>
          <div className="font-medium text-gray-700">Tokens:</div>
          <div className="text-gray-600">
            <div>JWT: {localStorage.getItem('jwt_token') ? '✅' : '❌'}</div>
            <div>Sanctum: {localStorage.getItem('sanctum_token') ? '✅' : '❌'}</div>
            <div>Refresh: {localStorage.getItem('refresh_token') ? '✅' : '❌'}</div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-2">
          <div className="font-medium text-gray-700">Tests:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => runTest('auth', testAuthentication)}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
            >
              Test Auth
            </button>
            <button
              onClick={() => runTest('users', testUserManagement)}
              className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs hover:bg-green-200"
            >
              Test Users
            </button>
            <button
              onClick={() => runTest('roles', testRoleManagement)}
              className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs hover:bg-purple-200"
            >
              Test Roles
            </button>
            <button
              onClick={() => runTest('permissions', testPermissionManagement)}
              className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs hover:bg-orange-200"
            >
              Test Perms
            </button>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div>
            <div className="font-medium text-gray-700">Test Results:</div>
            <div className="text-gray-600">
              {Object.entries(testResults).map(([test, result]) => (
                <div key={test}>
                  {test}: {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Actions */}
        <div className="space-y-2">
          <div className="font-medium text-gray-700">Debug Actions:</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                debugAuth();
                updateDebugInfo();
              }}
              className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs hover:bg-gray-200"
            >
              Debug Auth
            </button>
            <button
              onClick={() => {
                clearAuthDebug();
                updateDebugInfo();
              }}
              className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
            >
              Clear Auth
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPanel;
