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
        if (response.pagination) {
          const newPagination = {
            current_page: response.pagination.current_page || page,
            last_page: response.pagination.last_page || 1,
            per_page: response.pagination.per_page || currentPagination.per_page,
            total: response.pagination.total || 0,
            from: response.pagination.from || 1,
            to: response.pagination.to || 0,
            has_more_pages: response.pagination.has_more_pages || false
          };

          setPagination(prev => ({ ...prev, ...newPagination }));
        }
      } else {
        // Don't use fallback data for API errors - show the actual error
        const errorMsg = response.message || 'Failed to load permissions';
        setError(errorMsg);
      }
    } catch (err) {
      // For all errors, don't use fallback data - show the actual error
      const errorMsg = err.message || 'Failed to load permissions';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since we use refs

  // Note: Initial load is handled by the component, not the hook

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
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
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
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
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
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
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
        is_system_permission: false // Cloned permissions are always custom
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
