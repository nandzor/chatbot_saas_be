import { useState, useCallback } from 'react';
import permissionService from '@/services/PermissionManagementService';

/**
 * Custom hook for managing permissions
 * Provides state management and API integration for permissions CRUD operations
 */
export const usePermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });

  /**
   * Fetch permissions with optional filters
   */
  const fetchPermissions = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await permissionService.getPermissions(params);

      if (response.success) {
        setPermissions(response.data || []);
        // Handle pagination if backend provides it
        if (response.meta && response.meta.pagination) {
          setPagination(response.meta.pagination);
        }
      } else {
        setError(response.message || 'Failed to fetch permissions');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new permission
   */
  const createPermission = useCallback(async (permissionData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await permissionService.createPermission(permissionData);

      if (response.success) {
        // Refresh permissions list
        await fetchPermissions();
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create permission');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while creating permission';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchPermissions]);

  /**
   * Update an existing permission
   */
  const updatePermission = useCallback(async (permissionId, permissionData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await permissionService.updatePermission(permissionId, permissionData);

      if (response.success) {
        // Update local state
        setPermissions(prev =>
          prev.map(permission =>
            permission.id === permissionId
              ? { ...permission, ...response.data }
              : permission
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update permission');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while updating permission';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a permission
   */
  const deletePermission = useCallback(async (permissionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await permissionService.deletePermission(permissionId);

      if (response.success) {
        // Remove from local state
        setPermissions(prev => prev.filter(permission => permission.id !== permissionId));
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete permission');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while deleting permission';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get permission by ID
   */
  const getPermission = useCallback(async (permissionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await permissionService.getPermission(permissionId);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to fetch permission');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred while fetching permission';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get permission groups
   */
  const getPermissionGroups = useCallback(async () => {
    try {
      const response = await permissionService.getPermissionGroups();

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh permissions list
   */
  const refresh = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    // State
    permissions,
    loading,
    error,
    pagination,

    // Actions
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    getPermission,
    getPermissionGroups,
    clearError,
    refresh
  };
};
