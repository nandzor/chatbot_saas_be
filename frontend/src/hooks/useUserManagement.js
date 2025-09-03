import { useState, useEffect, useCallback, useRef } from 'react';
import userManagementService from '../services/UserManagementService';
import toast from 'react-hot-toast';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
    organization: 'all',
    department: 'all'
  });

  // Refs to prevent unnecessary re-renders
  const isInitialLoad = useRef(true);
  const lastLoadParams = useRef(null);

  // Load users with current filters and pagination
  const loadUsers = useCallback(async (forceReload = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
        ...filters
      };

      // Remove 'all' values from filters
      Object.keys(params).forEach(key => {
        if (params[key] === 'all') {
          delete params[key];
        }
      });

      // Check if params have changed to prevent unnecessary API calls
      const paramsString = JSON.stringify(params);
      if (!forceReload && lastLoadParams.current === paramsString) {
        console.log('🔍 useUserManagement: Skipping duplicate API call with same params');
        setLoading(false);
        return;
      }

      lastLoadParams.current = paramsString;
      console.log('🔍 useUserManagement: Loading users with params:', params);

      const response = await userManagementService.getUsers(params);

      if (response.success) {
        console.log('🔍 useUserManagement: Response data structure:', response.data);

        // Handle different response structures
        const usersData = response.data.data || response.data.users || response.data || [];
        const paginationData = response.data.pagination || response.data;

        console.log('🔍 useUserManagement: Users data:', usersData);
        console.log('🔍 useUserManagement: Pagination data:', paginationData);

        setUsers(Array.isArray(usersData) ? usersData : []);
        setPagination(prev => ({
          ...prev,
          currentPage: paginationData.current_page || paginationData.currentPage || 1,
          itemsPerPage: paginationData.per_page || paginationData.itemsPerPage || 10,
          totalItems: paginationData.total || paginationData.totalItems || 0,
          totalPages: paginationData.last_page || paginationData.totalPages || 1
        }));
      } else {
        console.error('❌ useUserManagement: API response failed:', response);
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      const errorMessage = 'Failed to load users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  // Load users when filters or pagination changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadUsers(true); // Force initial load
    } else {
      loadUsers(false); // Check for duplicates
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  // Create user
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      const transformedData = userManagementService.transformUserDataForBackend(userData);
      const response = await userManagementService.createUser(transformedData);

      if (response.success) {
        toast.success(response.message || 'User created successfully');
        await loadUsers(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to create user');
        return { success: false, errors: response.errors };
      }
    } catch (err) {
      const errorMessage = 'Failed to create user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Update user
  const updateUser = useCallback(async (id, userData) => {
    try {
      setLoading(true);
      const transformedData = userManagementService.transformUserDataForBackend(userData);
      const response = await userManagementService.updateUser(id, transformedData);

      if (response.success) {
        toast.success(response.message || 'User updated successfully');
        await loadUsers(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to update user');
        return { success: false, errors: response.errors };
      }
    } catch (err) {
      const errorMessage = 'Failed to update user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Delete user
  const deleteUser = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await userManagementService.deleteUser(id);

      if (response.success) {
        toast.success(response.message || 'User deleted successfully');
        await loadUsers(); // Refresh the list
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to delete user');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to delete user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Toggle user status
  const toggleUserStatus = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await userManagementService.toggleUserStatus(id);

      if (response.success) {
        toast.success(response.message || 'User status updated successfully');
        await loadUsers(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to update user status');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to update user status';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Clone user
  const cloneUser = useCallback(async (id, email, overrides = {}) => {
    try {
      setLoading(true);
      const response = await userManagementService.cloneUser(id, email, overrides);

      if (response.success) {
        toast.success(response.message || 'User cloned successfully');
        await loadUsers(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to clone user');
        return { success: false, errors: response.errors };
      }
    } catch (err) {
      const errorMessage = 'Failed to clone user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Search users
  const searchUsers = useCallback(async (query, searchFilters = {}) => {
    try {
      setLoading(true);
      const response = await userManagementService.searchUsers(query, searchFilters);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to search users');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = 'Failed to search users';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user statistics (memoized to prevent unnecessary re-renders)
  const getUserStatistics = useCallback(async () => {
    try {
      const response = await userManagementService.getUserStatistics();

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        console.error('❌ useUserManagement: Statistics API failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('❌ useUserManagement: Statistics error:', err);
      return { success: false, error: 'Failed to fetch user statistics' };
    }
  }, []); // Empty dependency array - this function should be stable

  // Get user activity
  const getUserActivity = useCallback(async (id) => {
    try {
      console.log('🔍 useUserManagement: Getting activity for user ID:', id);
      const response = await userManagementService.getUserActivity(id);
      console.log('🔍 useUserManagement: Activity service response:', response);

      if (response.success) {
        console.log('🔍 useUserManagement: Activity data:', response.data);
        return { success: true, data: response.data };
      } else {
        console.error('❌ useUserManagement: Activity service failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('❌ useUserManagement: Activity error:', err);
      return { success: false, error: 'Failed to fetch user activity' };
    }
  }, []);

  // Get user sessions
  const getUserSessions = useCallback(async (id) => {
    try {
      const response = await userManagementService.getUserSessions(id);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: 'Failed to fetch user sessions' };
    }
  }, []);

  // Get user permissions
  const getUserPermissions = useCallback(async (id, filters = {}) => {
    try {
      console.log('🔍 useUserManagement: Getting permissions for user ID:', id, 'with filters:', filters);
      const response = await userManagementService.getUserPermissions(id, filters);
      console.log('🔍 useUserManagement: Permissions service response:', response);

      if (response.success) {
        console.log('🔍 useUserManagement: Permissions data:', response.data);
        return { success: true, data: response.data };
      } else {
        console.error('❌ useUserManagement: Permissions service failed:', response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      console.error('❌ useUserManagement: Permissions error:', err);
      return { success: false, error: 'Failed to fetch user permissions' };
    }
  }, []);

  // Check email availability
  const checkEmailExists = useCallback(async (email, excludeUserId = null) => {
    try {
      const response = await userManagementService.checkEmailExists(email, excludeUserId);

      if (response.success) {
        return { success: true, exists: response.data.exists };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: 'Failed to check email availability' };
    }
  }, []);

  // Check username availability
  const checkUsernameExists = useCallback(async (username, excludeUserId = null) => {
    try {
      const response = await userManagementService.checkUsernameExists(username, excludeUserId);

      if (response.success) {
        return { success: true, exists: response.data.exists };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: 'Failed to check username availability' };
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      // Only update if filters actually changed
      if (JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }
      return updated;
    });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => {
      const updated = { ...prev, ...newPagination };
      // Only update if pagination actually changed
      if (JSON.stringify(prev) === JSON.stringify(updated)) {
        return prev;
      }
      return updated;
    });
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      role: 'all',
      organization: 'all',
      department: 'all'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  return {
    // State
    users,
    loading,
    error,
    pagination,
    filters,

    // Actions
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    cloneUser,
    searchUsers,
    getUserStatistics,
    getUserActivity,
    getUserSessions,
    getUserPermissions,
    checkEmailExists,
    checkUsernameExists,

    // Utilities
    updateFilters,
    updatePagination,
    resetFilters
  };
};
