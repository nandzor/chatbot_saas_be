import { useState, useEffect, useCallback, useRef } from 'react';
import userManagementService from '@/services/UserManagementService';
import toast from 'react-hot-toast';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 1,
    to: 0,
    has_more_pages: false
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
        page: pagination.current_page,
        per_page: pagination.per_page,
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
        setLoading(false);
        return;
      }

      lastLoadParams.current = paramsString;

      const response = await userManagementService.getUsers(params);

      if (response.success) {

        // Handle different response structures
        const usersData = response.data.data || response.data.users || response.data || [];
        const paginationData = response.data.pagination || response.data;


        setUsers(Array.isArray(usersData) ? usersData : []);

        // Update pagination from API response
        if (paginationData) {
          const newPagination = {
            current_page: paginationData.current_page || 1,
            last_page: paginationData.last_page || 1,
            per_page: paginationData.per_page || 15,
            total: paginationData.total || 0,
            from: paginationData.from || 1,
            to: paginationData.to || 0,
            has_more_pages: paginationData.has_more_pages || false
          };
          setPagination(prev => ({ ...prev, ...newPagination }));
        }
      } else {
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
  }, [pagination.current_page, pagination.per_page, filters]);

  // Load users when filters or pagination changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadUsers(true); // Force initial load
    } else {
      loadUsers(false); // Check for duplicates
    }
  }, [pagination.current_page, pagination.per_page, filters]);

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
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: 'Failed to fetch user statistics' };
    }
  }, []); // Empty dependency array - this function should be stable

  // Get user activity
  const getUserActivity = useCallback(async (id) => {
    try {
      const response = await userManagementService.getUserActivity(id);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
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
      const response = await userManagementService.getUserPermissions(id, filters);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
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
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page) => {
    console.log('🔄 User page change requested:', page);
    setPagination(prev => ({ ...prev, current_page: page }));
    loadUsers();
  }, [loadUsers]);

  // Handle per page change
  const handlePerPageChange = useCallback((perPage) => {
    console.log('📄 User per page change requested:', perPage);
    const newPagination = {
      per_page: perPage,
      current_page: 1 // Reset to first page when changing per page
    };
    setPagination(prev => ({ ...prev, ...newPagination }));
    loadUsers();
  }, [loadUsers]);

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
    handlePageChange,
    handlePerPageChange,
    checkEmailExists,
    checkUsernameExists,

    // Utilities
    updateFilters,
    updatePagination,
    resetFilters
  };
};
