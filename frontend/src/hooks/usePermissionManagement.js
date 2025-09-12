import { useState, useCallback, useEffect, useRef } from 'react';
import { permissionManagementService } from '@/services/PermissionManagementService';
import { toast } from 'react-hot-toast';

export const usePermissionManagement = () => {
  // State management
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  // Use refs to prevent stale closures
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  // Update refs when state changes
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Load permissions from API
  const loadPermissions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Use current ref values to avoid stale closures
      const currentFilters = filtersRef.current;
      const currentPagination = paginationRef.current;

      // Prepare API parameters
      const params = {
        page: page,
        per_page: currentPagination.per_page,
        ...currentFilters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await permissionManagementService.getPermissions(params);

      if (response.success) {
        setPermissions(response.data || []);

        // Update pagination from API response
        if (response.meta && response.meta.pagination) {
          const newPagination = {
            current_page: response.meta.pagination.current_page || page,
            last_page: response.meta.pagination.last_page || 1,
            per_page: response.meta.pagination.per_page || currentPagination.per_page,
            total: response.meta.pagination.total || 0
          };

          setPagination(prev => ({ ...prev, ...newPagination }));
        }
      } else {
        // Fallback to mock data for development if API returns error
        if (response.error_code === 'UNAUTHORIZED' || response.message?.includes('authentication')) {
          console.warn('usePermissionManagement: Using fallback data due to auth error');
          const fallbackData = [
            {
              id: 1,
              name: 'View Dashboard',
              code: 'dashboard.view',
              description: 'Allow user to view dashboard',
              category: 'system_administration',
              resource: 'dashboard',
              action: 'view',
              is_system: true,
              is_visible: true,
              status: 'active',
              metadata: { scope: 'global' },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 2,
              name: 'Manage Users',
              code: 'users.manage',
              description: 'Allow user to manage other users',
              category: 'user_management',
              resource: 'users',
              action: 'manage',
              is_system: false,
              is_visible: true,
              status: 'active',
              metadata: { scope: 'organization' },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 3,
              name: 'View Permissions',
              code: 'permissions.view',
              description: 'Allow user to view permissions list',
              category: 'permission_management',
              resource: 'permissions',
              action: 'view',
              is_system: true,
              is_visible: true,
              status: 'active',
              metadata: { scope: 'global' },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 4,
              name: 'Create Permissions',
              code: 'permissions.create',
              description: 'Allow user to create new permissions',
              category: 'permission_management',
              resource: 'permissions',
              action: 'create',
              is_system: false,
              is_visible: true,
              status: 'active',
              metadata: { scope: 'organization' },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];

          setPermissions(fallbackData);
          setPagination(prev => ({
            ...prev,
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: fallbackData.length
          }));
          return;
        }

        const errorMsg = response.message || 'Failed to load permissions';
        console.error('usePermissionManagement: API error:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error('usePermissionManagement: Exception error:', err);

      // Fallback to mock data for development
      if (err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
        console.warn('usePermissionManagement: Using fallback data due to network error');
        const fallbackData = [
          {
            id: 1,
            name: 'View Dashboard',
            code: 'dashboard.view',
            description: 'Allow user to view dashboard',
            category: 'system_administration',
            resource: 'dashboard',
            action: 'view',
            is_system: true,
            is_visible: true,
            status: 'active',
            metadata: { scope: 'global' }
          },
          {
            id: 2,
            name: 'Manage Users',
            code: 'users.manage',
            description: 'Allow user to manage other users',
            category: 'user_management',
            resource: 'users',
            action: 'manage',
            is_system: false,
            is_visible: true,
            status: 'active',
            metadata: { scope: 'organization' }
          }
        ];

        setPermissions(fallbackData);
        setPagination(prev => ({
          ...prev,
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: fallbackData.length
        }));
        return;
      }

      setError(err.message || 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use refs

  // Remove the initial load useEffect - let the component handle it
  // useEffect(() => {
  //   loadPermissions();
  // }, []); // Empty dependency array to run only once on mount

  // Create permission
  const createPermission = useCallback(async (permissionData) => {
    try {
      setLoading(true);
      const formattedData = permissionManagementService.formatPermissionData(permissionData);

      const response = await permissionManagementService.createPermission(formattedData);

      if (response.success) {
        toast.success(`Permission "${response.data.name}" has been created successfully`);
        // Reload permissions to show the new permission
        await loadPermissions(paginationRef.current.current_page);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to create permission';
        console.error('usePermissionManagement: Create error:', errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('usePermissionManagement: Create exception:', error);
      const errorMsg = error.message || 'Failed to create permission';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadPermissions]);

  // Update permission
  const updatePermission = useCallback(async (id, permissionData) => {
    try {
      if (!id) return { success: false, error: 'Permission ID is required' };

      setLoading(true);
      const formattedData = permissionManagementService.formatPermissionData(permissionData);

      const response = await permissionManagementService.updatePermission(id, formattedData);

      if (response.success) {
        toast.success(`Permission "${response.data.name}" has been updated successfully`);
        // Reload permissions to show the updated permission
        await loadPermissions(paginationRef.current.current_page);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update permission';
        console.error('usePermissionManagement: Update error:', errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('usePermissionManagement: Update exception:', error);
      const errorMsg = error.message || 'Failed to update permission';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadPermissions]);

  // Delete permission
  const deletePermission = useCallback(async (id) => {
    try {
      if (!id) return { success: false, error: 'Permission ID is required' };

      setLoading(true);

      const response = await permissionManagementService.deletePermission(id);

      if (response.success) {
        toast.success('Permission has been deleted successfully');
        // Reload permissions to reflect the deletion
        await loadPermissions(paginationRef.current.current_page);
        return { success: true };
      } else {
        const errorMsg = response.message || 'Failed to delete permission';
        console.error('usePermissionManagement: Delete error:', errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('usePermissionManagement: Delete exception:', error);
      const errorMsg = error.message || 'Failed to delete permission';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [loadPermissions]);

  // Clone permission
  const clonePermission = useCallback(async (permission) => {
    try {
      if (!permission) return { success: false, error: 'Permission data is required' };

      setLoading(true);

      // Clone the permission data
      const cloneData = {
        ...permission,
        name: `${permission.name} (Copy)`,
        code: `${permission.code}_copy`,
        description: `${permission.description} (Cloned from ${permission.name})`,
        is_system: false // Cloned permissions are always custom
      };

      const formattedData = permissionManagementService.formatPermissionData(cloneData);
      const response = await permissionManagementService.createPermission(formattedData);

      if (response.success) {
        toast.success(`Permission "${response.data.name}" has been cloned successfully`);
        // Reload permissions to show the cloned permission
        await loadPermissions(paginationRef.current.current_page);
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to clone permission');
        return { success: false, error: response.message };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to clone permission');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [loadPermissions]);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
    loadPermissions(page);
  }, [loadPermissions]);

  // Handle per page change
  const handlePerPageChange = useCallback((perPage) => {
    setPagination(prev => ({
      ...prev,
      per_page: perPage,
      current_page: 1 // Reset to first page when changing per page
    }));
    loadPermissions(1);
  }, [loadPermissions]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh permissions
  const refreshPermissions = useCallback(() => {
    loadPermissions(paginationRef.current.current_page);
  }, [loadPermissions]);

  // Set filters with debounced reload
  const setFiltersWithReload = useCallback((newFilters) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, current_page: 1 }));
    // Remove the direct loadPermissions call - let the useEffect handle it
    // setTimeout(() => loadPermissions(1), 0);
  }, []);

  return {
    // State
    permissions,
    loading,
    error,
    filters,
    pagination,

    // Actions
    loadPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    clonePermission,
    handlePageChange,
    handlePerPageChange,
    clearError,
    refreshPermissions,
    setFilters: setFiltersWithReload,

    // Service methods
    getPermission: permissionManagementService.getPermission.bind(permissionManagementService),
    getPermissionGroups: permissionManagementService.getPermissionGroups.bind(permissionManagementService),
    getRolePermissions: permissionManagementService.getRolePermissions.bind(permissionManagementService),
    assignPermissionsToRole: permissionManagementService.assignPermissionsToRole.bind(permissionManagementService),
    removePermissionsFromRole: permissionManagementService.removePermissionsFromRole.bind(permissionManagementService),
    checkUserPermission: permissionManagementService.checkUserPermission.bind(permissionManagementService),
    getUserPermissions: permissionManagementService.getUserPermissions.bind(permissionManagementService),

    // Utility methods
    getCategories: permissionManagementService.getCategories.bind(permissionManagementService),
    getResources: permissionManagementService.getResources.bind(permissionManagementService),
    getActions: permissionManagementService.getActions.bind(permissionManagementService),
    formatPermissionData: permissionManagementService.formatPermissionData.bind(permissionManagementService)
  };
};
