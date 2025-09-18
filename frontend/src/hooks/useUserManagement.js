/* eslint-disable no-console */
import { useState, useEffect, useCallback } from 'react';
import UserManagementService from '@/services/UserManagementService';
import { handleError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

const userManagementService = new UserManagementService();

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
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

  // Load users
  const loadUsers = useCallback(async (params = {}) => {
    try {
      // Check if this is a pagination change (not initial load)
      const isPaginationChange = params.page || params.per_page;

      if (isPaginationChange) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const queryParams = {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        ...filters,
        ...params
      };

      if (import.meta.env.DEV) {
        console.log('Loading users with params:', queryParams);
      }

      const response = await userManagementService.getUsers(queryParams);

      if (Array.isArray(response)) {
        setUsers(response);
        // Reset pagination if response is array (no pagination info)
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: response.length,
          perPage: response.length
        }));
      } else if (response && response.data) {
        setUsers(response.data);
        if (response.pagination) {
          setPagination(prev => ({
            ...prev,
            currentPage: response.pagination.current_page || 1,
            totalPages: response.pagination.last_page || 1,
            totalItems: response.pagination.total || 0,
            perPage: response.pagination.per_page || 10
          }));

          if (import.meta.env.DEV) {
            console.log('Updated pagination:', response.pagination);
          }
        }
      } else {
        setUsers([]);
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          perPage: 10
        }));
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal memuat daftar pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error loading users:', err);
      }

      // Reset pagination on error
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 10
      }));
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, []);

  // Search users
  const searchUsers = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.searchUsers(query, {
        page: pagination.currentPage,
        per_page: pagination.perPage,
        ...filters
      });

      if (Array.isArray(response)) {
        setUsers(response);
        // Reset pagination for search results
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: response.length,
          perPage: response.length
        }));
      } else if (response && response.data) {
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
        setPagination(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          perPage: 10
        }));
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      toast.error(`Gagal mencari pengguna: ${errorMessage.message}`);
      if (import.meta.env.DEV) {
        console.error('Error searching users:', err);
      }

      // Reset pagination on error
      setPagination(prev => ({
        ...prev,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        perPage: 10
      }));
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  }, []);

  // Create user
  const createUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.createUser(userData);

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
      setPaginationLoading(false);
    }
  }, [loadUsers]);

  // Update user
  const updateUser = useCallback(async (userId, userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.updateUser(userId, userData);

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
      setPaginationLoading(false);
    }
  }, [loadUsers]);

  // Delete user
  const deleteUser = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      await userManagementService.deleteUser(userId);

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
      setPaginationLoading(false);
    }
  }, [loadUsers]);

  // Toggle user status
  const toggleUserStatus = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await userManagementService.toggleUserStatus(userId);

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
      setPaginationLoading(false);
    }
  }, [loadUsers]);

  // Get user details
  const getUserById = useCallback(async (userId) => {
    try {
      setError(null);

      const response = await userManagementService.getUserById(userId);
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

      const response = await userManagementService.getUserActivity(userId);
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

      const response = await userManagementService.getUserSessions(userId);
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

      const response = await userManagementService.getUserPermissions(userId);
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

      const response = await userManagementService.getUserStatistics();
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

      const response = await userManagementService.checkEmail(email);
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

      const response = await userManagementService.checkUsername(username);
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

      const response = await userManagementService.bulkUpdateUsers(updates);

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
      setPaginationLoading(false);
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
  const handlePageChange = useCallback(async (page) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      try {
        updatePagination({ currentPage: page });
        // Load users for the new page
        await loadUsers({ page });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error changing page:', error);
        }
        toast.error('Gagal mengubah halaman');
      }
    }
  }, [pagination.totalPages, pagination.currentPage, updatePagination, loadUsers]);

  // Handle per page change
  const handlePerPageChange = useCallback(async (perPage) => {
    try {
      if (perPage > 0 && perPage <= 100) {
        updatePagination({ perPage, currentPage: 1 });
        // Load users with new per page setting
        await loadUsers({ per_page: perPage, page: 1 });
      } else {
        toast.error('Jumlah item per halaman harus antara 1-100');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error changing per page:', error);
      }
      toast.error('Gagal mengubah jumlah item per halaman');
    }
  }, [updatePagination, loadUsers]);

  // Go to first page
  const goToFirstPage = useCallback(async () => {
    updatePagination({ currentPage: 1 });
    await loadUsers({ page: 1 });
  }, [updatePagination, loadUsers]);

  // Go to last page
  const goToLastPage = useCallback(async () => {
    updatePagination({ currentPage: pagination.totalPages });
    await loadUsers({ page: pagination.totalPages });
  }, [pagination.totalPages, updatePagination, loadUsers]);

  // Go to previous page
  const goToPreviousPage = useCallback(async () => {
    if (pagination.currentPage > 1) {
      const newPage = pagination.currentPage - 1;
      updatePagination({ currentPage: newPage });
      await loadUsers({ page: newPage });
    }
  }, [pagination.currentPage, updatePagination, loadUsers]);

  // Go to next page
  const goToNextPage = useCallback(async () => {
    if (pagination.currentPage < pagination.totalPages) {
      const newPage = pagination.currentPage + 1;
      updatePagination({ currentPage: newPage });
      await loadUsers({ page: newPage });
    }
  }, [pagination.currentPage, pagination.totalPages, updatePagination, loadUsers]);

  // Load users on mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [filters]);

  return {
    // State
    users,
    loading,
    paginationLoading,
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

    // Pagination actions
    handlePageChange,
    handlePerPageChange,
    goToFirstPage,
    goToLastPage,
    goToPreviousPage,
    goToNextPage,

    // Computed
    activeUsers: users.filter(user => user.status === 'active'),
    inactiveUsers: users.filter(user => user.status === 'inactive'),
    totalUsers: users.length
  };
};
