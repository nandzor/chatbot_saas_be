import { useState, useEffect, useCallback, useRef } from 'react';
import organizationManagementService from '@/services/OrganizationManagementService';
import toast from 'react-hot-toast';

export const useOrganizationUsers = (organizationId) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });
  const [sorting, setSorting] = useState({
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Refs to prevent unnecessary re-renders
  const isInitialLoad = useRef(true);
  const lastLoadParams = useRef(null);

  // Load users
  const loadUsers = useCallback(async (forceRefresh = false) => {
    if (!organizationId) {
      return;
    }

    const currentParams = {
      page: pagination.current_page,
      per_page: pagination.per_page,
      search: filters.search,
      role: filters.role !== 'all' ? filters.role : undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      sort_by: sorting.sort_by,
      sort_order: sorting.sort_order
    };

    // Check if we need to load (avoid duplicate calls)
    if (!forceRefresh && !isInitialLoad.current &&
        JSON.stringify(currentParams) === JSON.stringify(lastLoadParams.current)) {
      return;
    }

    setLoading(true);
    setError(null);
    lastLoadParams.current = currentParams;

    try {

      const response = await organizationManagementService.getOrganizationUsers(organizationId, currentParams);

      if (response.success) {
        // Handle new response structure
        const usersData = response.data?.data || response.data || [];
        setUsers(Array.isArray(usersData) ? usersData : []);

        if (response.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.data.pagination
          }));
        } else if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            ...response.pagination
          }));
        }
      } else {
        setError(response.error);
        toast.error(response.error || 'Failed to load users');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load users';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [organizationId, pagination.current_page, pagination.per_page, filters, sorting]);

  // Load users on mount and when dependencies change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Add user to organization
  const addUser = useCallback(async (userData) => {
    if (!organizationId) {
      toast.error('No organization selected');
      return { success: false, error: 'No organization selected' };
    }

    setLoading(true);
    try {

      const response = await organizationManagementService.addUserToOrganization(organizationId, userData);

      if (response.success) {
        toast.success(response.message || 'User added successfully');

        // Reload users
        await loadUsers(true);

        return { success: true, data: response.data };
      } else {
        toast.error(response.error || 'Failed to add user');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [organizationId, loadUsers]);

  // Remove user from organization
  const removeUser = useCallback(async (userId) => {
    if (!organizationId) {
      toast.error('No organization selected');
      return { success: false, error: 'No organization selected' };
    }

    setLoading(true);
    try {

      const response = await organizationManagementService.removeUserFromOrganization(organizationId, userId);

      if (response.success) {
        toast.success(response.message || 'User removed successfully');

        // Reload users
        await loadUsers(true);

        return { success: true };
      } else {
        toast.error(response.error || 'Failed to remove user');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [organizationId, loadUsers]);

  // Update user
  const updateUser = useCallback(async (userId, userData) => {
    if (!organizationId) {
      toast.error('No organization selected');
      return { success: false, error: 'No organization selected' };
    }

    setLoading(true);
    try {

      // Update user via API
      const response = await organizationManagementService.updateUser(organizationId, userId, userData);

      if (response.success) {
        toast.success('User updated successfully');

        // Reload users
        await loadUsers(true);

        return { success: true, data: response.data };
      } else {
        toast.error(response.error || 'Failed to update user');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [organizationId, loadUsers]);

  // Toggle user status
  const toggleUserStatus = useCallback(async (userId, newStatus) => {
    if (!organizationId) {
      toast.error('No organization selected');
      return { success: false, error: 'No organization selected' };
    }

    setLoading(true);
    try {

      // Toggle user status via API
      const response = await organizationManagementService.toggleUserStatus(organizationId, userId, newStatus);

      if (response.success) {
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);

        // Reload users
        await loadUsers(true);

        return { success: true };
      } else {
        toast.error(response.error || 'Failed to toggle user status');
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle user status';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [organizationId, loadUsers]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, current_page: 1 })); // Reset to first page
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Update sorting
  const updateSorting = useCallback((newSorting) => {
    setSorting(prev => ({ ...prev, ...newSorting }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all'
    });
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  // Refresh users
  const refreshUsers = useCallback(() => {
    loadUsers(true);
  }, [loadUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    sorting,
    loadUsers,
    addUser,
    removeUser,
    updateUser,
    toggleUserStatus,
    updateFilters,
    updatePagination,
    updateSorting,
    resetFilters,
    refreshUsers
  };
};
