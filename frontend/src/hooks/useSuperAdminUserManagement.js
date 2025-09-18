/* eslint-disable no-console */
import { useState, useEffect, useCallback } from 'react';
import SuperAdminUserManagementService from '@/services/SuperAdminUserManagementService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const superAdminUserManagementService = new SuperAdminUserManagementService();

export const useSuperAdminUserManagement = () => {
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
    organization: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Load users
  const loadUsers = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        ...filters,
        ...params
      };

      const response = await superAdminUserManagementService.getUsers(queryParams);

      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination.current_page || 1,
            totalPages: response.pagination.last_page || 1,
            totalItems: response.pagination.total || 0,
            perPage: response.pagination.per_page || 10
          }));
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat daftar pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error loading users:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, filters]);

  // Search users
  const searchUsers = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await superAdminUserManagementService.searchUsers(query, {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        ...filters
      });

      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.data) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal mencari pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error searching users:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, filters]);

  // Create user
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await superAdminUserManagementService.createUser(userData);

      toast.success('Pengguna berhasil dibuat');
      await loadUsers(); // Reload users list

      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
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

      const response = await superAdminUserManagementService.updateUser(userId, userData);

      toast.success('Pengguna berhasil diperbarui');
      await loadUsers(); // Reload users list

      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
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

      await superAdminUserManagementService.deleteUser(userId);

      toast.success('Pengguna berhasil dihapus');
      await loadUsers(); // Reload users list
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
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

      const response = await superAdminUserManagementService.toggleUserStatus(userId);

      toast.success('Status pengguna berhasil diubah');
      await loadUsers(); // Reload users list

      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal mengubah status pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error toggling user status:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

  // Get user details
  const getUserById = useCallback(async (userId) => {
    try {
      setError(null);

      const response = await superAdminUserManagementService.getUserById(userId);
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat detail pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error getting user by ID:', err);
      }
      throw err;
    }
  }, []);

  // Get user activity
  const getUserActivity = useCallback(async (userId) => {
    try {
      setError(null);

      const response = await superAdminUserManagementService.getUserActivity(userId);
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat aktivitas pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error getting user activity:', err);
      }
      throw err;
    }
  }, []);

  // Get user sessions
  const getUserSessions = useCallback(async (userId) => {
    try {
      setError(null);

      const response = await superAdminUserManagementService.getUserSessions(userId);
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat sesi pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error getting user sessions:', err);
      }
      throw err;
    }
  }, []);

  // Get user permissions
  const getUserPermissions = useCallback(async (userId) => {
    try {
      setError(null);

      const response = await superAdminUserManagementService.getUserPermissions(userId);
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat izin pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error getting user permissions:', err);
      }
      throw err;
    }
  }, []);

  // Get user statistics
  const getUserStatistics = useCallback(async () => {
    try {
      setError(null);

      const response = await superAdminUserManagementService.getUserStatistics();
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat statistik pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error getting user statistics:', err);
      }
      throw err;
    }
  }, []);

  // Check email availability
  const checkEmail = useCallback(async (email) => {
    try {
      setError(null);

      const response = await superAdminUserManagementService.checkEmail(email);
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Error checking email:', err);
      }
      throw err;
    }
  }, []);

  // Check username availability
  const checkUsername = useCallback(async (username) => {
    try {
      setError(null);

      const response = await superAdminUserManagementService.checkUsername(username);
      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      if (import.meta.env.DEV) {
        console.error('Error checking username:', err);
      }
      throw err;
    }
  }, []);

  // Bulk update users
  const bulkUpdateUsers = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await superAdminUserManagementService.bulkUpdateUsers(updates);

      toast.success('Pengguna berhasil diperbarui secara massal');
      await loadUsers(); // Reload users list

      return response;
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memperbarui pengguna secara massal: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error bulk updating users:', err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadUsers]);

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

  return {
    // State
    users,
    loading,
    error,
    pagination,
    filters,

    // Actions
    loadUsers,
    searchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserById,
    getUserActivity,
    getUserSessions,
    getUserPermissions,
    getUserStatistics,
    checkEmail,
    checkUsername,
    bulkUpdateUsers,
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
