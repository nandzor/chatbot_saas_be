/* eslint-disable no-console */
import { useState, useEffect, useCallback } from 'react';
import UserManagementService from '@/services/UserManagementService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const userManagementService = new UserManagementService();

export const useOrgUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    role: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    admins: 0
  });

  // Load users
  const loadUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
        sort_by: filters.sortBy,
        sort_order: filters.sortOrder,
        ...params
      };

      const response = await userManagementService.getUsers(queryParams);

      if (response.success) {
        // Data is nested in response.data.data
        const usersData = Array.isArray(response.data?.data) ? response.data.data : [];

        setUsers(usersData);

        // Update pagination from response.data.pagination
        if (response.data?.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: response.data.pagination.current_page || 1,
            totalPages: response.data.pagination.last_page || 1,
            totalItems: response.data.pagination.total || 0,
            perPage: response.data.pagination.per_page || 10
          }));
        }

        // Update statistics
        const stats = {
          total: response.data?.pagination?.total || 0,
          active: usersData.filter(u => u.status === 'active').length || 0,
          suspended: usersData.filter(u => u.status === 'suspended').length || 0,
          admins: usersData.filter(u => u.role === 'org_admin').length || 0
        };
        setStatistics(stats);
      } else {
        throw new Error(response.message || 'Failed to load users');
      }
        } catch (err) {
          const errorMessage = handleError(err);
          setError(errorMessage.message);
          toast.error(`Gagal memuat daftar pengguna: ${errorMessage.message}`);
        } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, filters]);

  // Create user
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.createUser(userData);

      if (response.success) {
        toast.success('Pengguna berhasil dibuat');
        await loadUsers(); // Reload users list
        return response;
      } else {
        throw new Error(response.message || 'Failed to create user');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message);
      toast.error(`Gagal membuat pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error creating user:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Update user
  const updateUser = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.updateUser(userId, userData);

      if (response.success) {
        toast.success('Pengguna berhasil diperbarui');
        await loadUsers(); // Reload users list
        return response;
      } else {
        throw new Error(response.message || 'Failed to update user');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message);
      toast.error(`Gagal memperbarui pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error updating user:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Delete user
  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.deleteUser(userId);

      if (response.success) {
        toast.success('Pengguna berhasil dihapus');
        await loadUsers(); // Reload users list
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message);
      toast.error(`Gagal menghapus pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error deleting user:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Toggle user status
  const toggleUserStatus = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.toggleUserStatus(userId);

      if (response.success) {
        toast.success('Status pengguna berhasil diubah');
        await loadUsers(); // Reload users list
        return response;
      } else {
        throw new Error(response.message || 'Failed to toggle user status');
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message);
      toast.error(`Gagal mengubah status pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error toggling user status:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Get user by ID
  const getUserById = useCallback(async (userId) => {
    try {
      setError(null);
      const response = await userManagementService.getUserById(userId);
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage.message);
      toast.error(`Gagal memuat detail pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error getting user by ID:', err);
      }
      throw err;
    }
  }, []);


  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    updatePagination({ currentPage: page });
  }, [updatePagination]);

  // Handle per page change
  const handlePerPageChange = useCallback((perPage) => {
    updatePagination({ perPage, currentPage: 1 });
  }, [updatePagination]);

  // Load users on mount and when filters/pagination change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);


  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== '') {
        loadUsers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters.search, loadUsers]);

  return {
    // State
    users,
    loading,
    error,
    pagination,
    filters,
    statistics,

    // Actions
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserById,
    updateFilters,
    updatePagination,
    handlePageChange,
    handlePerPageChange,

    // Computed
    activeUsers: users.filter(user => user.status === 'active'),
    inactiveUsers: users.filter(user => user.status === 'inactive'),
    totalUsers: users.length
  };
};
