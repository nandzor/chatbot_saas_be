import { useState, useEffect, useCallback, useRef } from 'react';
import organizationManagementService from '../services/OrganizationManagementService';
import toast from 'react-hot-toast';

export const useOrganizationPermissions = (organizationId) => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Refs to prevent unnecessary re-renders
  const isInitialLoad = useRef(true);
  const lastLoadParams = useRef(null);

  // Load roles
  const loadRoles = useCallback(async (forceRefresh = false) => {
    if (!organizationId) {
      console.log('🔍 useOrganizationPermissions: No organization ID provided');
      return;
    }

    const currentParams = { organization_id: organizationId };

    // Check if we need to load (avoid duplicate calls)
    if (!forceRefresh && !isInitialLoad.current &&
        JSON.stringify(currentParams) === JSON.stringify(lastLoadParams.current)) {
      console.log('🔍 useOrganizationPermissions: Skipping load - same parameters');
      return;
    }

    setLoading(true);
    setError(null);
    lastLoadParams.current = currentParams;

    try {
      console.log('🔍 useOrganizationPermissions: Loading roles for organization:', organizationId);

      // Get organization roles from API
      const rolesResponse = await organizationManagementService.getOrganizationRoles(organizationId);

      if (rolesResponse.success) {
        console.log('✅ useOrganizationPermissions: Roles loaded successfully:', rolesResponse.data);
        setRoles(rolesResponse.data);

        // Initialize role permissions
        const initialRolePermissions = {};
        rolesResponse.data.forEach(role => {
          initialRolePermissions[role.id] = [...role.permissions];
        });
        setRolePermissions(initialRolePermissions);
        return;
      }

      // Fallback to mock data if API fails
      const mockRoles = [
        {
          id: 1,
          name: 'Organization Admin',
          description: 'Full access to organization settings and user management',
          permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'settings.read', 'settings.update'],
          userCount: 2,
          isSystem: true
        },
        {
          id: 2,
          name: 'Agent',
          description: 'Access to chatbot management and customer interactions',
          permissions: ['chatbot.read', 'chatbot.update', 'conversations.read', 'conversations.update'],
          userCount: 5,
          isSystem: false
        },
        {
          id: 3,
          name: 'Viewer',
          description: 'Read-only access to organization data',
          permissions: ['users.read', 'chatbot.read', 'conversations.read'],
          userCount: 3,
          isSystem: false
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('✅ useOrganizationPermissions: Roles loaded successfully:', mockRoles);
      setRoles(mockRoles);

      // Initialize role permissions
      const initialRolePermissions = {};
      mockRoles.forEach(role => {
        initialRolePermissions[role.id] = [...role.permissions];
      });
      setRolePermissions(initialRolePermissions);

    } catch (error) {
      console.error('❌ useOrganizationPermissions: Error loading roles:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load roles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [organizationId]);

  // Load permissions
  const loadPermissions = useCallback(async () => {
    try {
      console.log('🔍 useOrganizationPermissions: Loading permissions');

      // Get permissions from API
      const permissionsResponse = await organizationManagementService.getPermissions();

      if (permissionsResponse.success) {
        console.log('✅ useOrganizationPermissions: Permissions loaded successfully:', permissionsResponse.data);
        setPermissions(permissionsResponse.data);
        return;
      }

      // Fallback to mock data if API fails
      const mockPermissions = [
        {
          category: 'User Management',
          permissions: [
            { id: 'users.create', name: 'Create Users', description: 'Add new users to the organization' },
            { id: 'users.read', name: 'View Users', description: 'View user information and lists' },
            { id: 'users.update', name: 'Edit Users', description: 'Modify user information and settings' },
            { id: 'users.delete', name: 'Delete Users', description: 'Remove users from the organization' }
          ]
        },
        {
          category: 'Chatbot Management',
          permissions: [
            { id: 'chatbot.create', name: 'Create Chatbots', description: 'Create new chatbot instances' },
            { id: 'chatbot.read', name: 'View Chatbots', description: 'View chatbot configurations and data' },
            { id: 'chatbot.update', name: 'Edit Chatbots', description: 'Modify chatbot settings and behavior' },
            { id: 'chatbot.delete', name: 'Delete Chatbots', description: 'Remove chatbot instances' }
          ]
        },
        {
          category: 'Conversations',
          permissions: [
            { id: 'conversations.read', name: 'View Conversations', description: 'Access conversation history' },
            { id: 'conversations.update', name: 'Manage Conversations', description: 'Modify conversation data' },
            { id: 'conversations.delete', name: 'Delete Conversations', description: 'Remove conversation records' }
          ]
        },
        {
          category: 'Settings',
          permissions: [
            { id: 'settings.read', name: 'View Settings', description: 'Access organization settings' },
            { id: 'settings.update', name: 'Edit Settings', description: 'Modify organization configuration' }
          ]
        },
        {
          category: 'Analytics',
          permissions: [
            { id: 'analytics.read', name: 'View Analytics', description: 'Access analytics and reports' },
            { id: 'analytics.export', name: 'Export Data', description: 'Export analytics data' }
          ]
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('✅ useOrganizationPermissions: Permissions loaded successfully:', mockPermissions);
      setPermissions(mockPermissions);

    } catch (error) {
      console.error('❌ useOrganizationPermissions: Error loading permissions:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load permissions';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, [loadRoles, loadPermissions]);

  // Update role permissions
  const updateRolePermissions = useCallback((roleId, permissionId, granted) => {
    setRolePermissions(prev => {
      const rolePermissions = prev[roleId] || [];
      const newPermissions = granted
        ? [...rolePermissions, permissionId]
        : rolePermissions.filter(p => p !== permissionId);

      setHasChanges(true);
      return {
        ...prev,
        [roleId]: newPermissions
      };
    });
  }, []);

  // Save role permissions
  const saveRolePermissions = useCallback(async (roleId, permissions) => {
    if (!organizationId) {
      toast.error('No organization selected');
      return { success: false, error: 'No organization selected' };
    }

    setLoading(true);
    try {
      console.log('🔍 useOrganizationPermissions: Saving role permissions:', organizationId, roleId, permissions);

      // Save role permissions via API
      const response = await organizationManagementService.saveRolePermissions(organizationId, roleId, permissions);

      if (response.success) {
        console.log('✅ useOrganizationPermissions: Role permissions saved successfully');
        toast.success('Role permissions saved successfully');

        // Update local state
        setRolePermissions(prev => ({
          ...prev,
          [roleId]: permissions
        }));

        setHasChanges(false);

        return { success: true };
      } else {
        console.error('❌ useOrganizationPermissions: Failed to save role permissions:', response.error);
        toast.error(response.error || 'Failed to save role permissions');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('❌ useOrganizationPermissions: Error saving role permissions:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save role permissions';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Save all permissions
  const saveAllPermissions = useCallback(async () => {
    if (!organizationId) {
      toast.error('No organization selected');
      return { success: false, error: 'No organization selected' };
    }

    setLoading(true);
    try {
      console.log('🔍 useOrganizationPermissions: Saving all permissions:', organizationId, rolePermissions);

      // Save all permissions via API
      const response = await organizationManagementService.saveAllPermissions(organizationId, rolePermissions);

      if (response.success) {
        console.log('✅ useOrganizationPermissions: All permissions saved successfully');
        toast.success('All permissions saved successfully');

        setHasChanges(false);

        return { success: true };
      } else {
        console.error('❌ useOrganizationPermissions: Failed to save all permissions:', response.error);
        toast.error(response.error || 'Failed to save all permissions');
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('❌ useOrganizationPermissions: Error saving all permissions:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save all permissions';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [organizationId, rolePermissions]);

  // Reset permissions
  const resetPermissions = useCallback(() => {
    const initialPermissions = {};
    roles.forEach(role => {
      initialPermissions[role.id] = [...role.permissions];
    });
    setRolePermissions(initialPermissions);
    setHasChanges(false);
  }, [roles]);

  // Check if permission is granted
  const isPermissionGranted = useCallback((roleId, permissionId) => {
    return rolePermissions[roleId]?.includes(permissionId) || false;
  }, [rolePermissions]);

  // Get permission info
  const getPermissionInfo = useCallback((permissionId) => {
    for (const category of permissions) {
      const permission = category.permissions.find(p => p.id === permissionId);
      if (permission) return permission;
    }
    return null;
  }, [permissions]);

  // Refresh data
  const refreshData = useCallback(() => {
    loadRoles(true);
    loadPermissions();
  }, [loadRoles, loadPermissions]);

  return {
    roles,
    permissions,
    rolePermissions,
    loading,
    error,
    hasChanges,
    updateRolePermissions,
    saveRolePermissions,
    saveAllPermissions,
    resetPermissions,
    isPermissionGranted,
    getPermissionInfo,
    refreshData
  };
};
