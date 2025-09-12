import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import transactionService from '@/services/TransactionService';

/**
 * Custom hook for managing transaction history
 * Provides state management, pagination, filtering, and data fetching for payment transactions
 */
export const useTransactionHistory = () => {
  // Authentication
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 15,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    payment_method: 'all',
    payment_gateway: 'all',
    organization_id: 'all',
    plan_id: 'all',
    amount_min: '',
    amount_max: '',
    date_from: '',
    date_to: '',
    currency: 'all'
  });

  // Sorting state
  const [sorting, setSorting] = useState({
    sort_by: 'created_at',
    sort_direction: 'desc'
  });

  // Refs for preventing duplicate calls
  const loadingRef = useRef(false);
  const filterTimeoutRef = useRef(null);

  /**
   * Load transactions with current filters and pagination
   */
  const loadTransactions = useCallback(async (showLoading = true) => {
    if (loadingRef.current || !isAuthenticated) {
      return;
    }

    loadingRef.current = true;
    if (showLoading) setLoading(true);
    setError(null);

    try {

      const params = {
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
        sort_by: sorting.sort_by,
        sort_direction: sorting.sort_direction,
        ...filters
      };

      // Remove 'all' values from filters
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === '') {
          delete params[key];
        }
      });


      const response = await transactionService.getTransactions(params);

      if (response.success) {
        // Extract data and pagination based on the actual response structure
        let data, paginationData;
        data = response.data;
        paginationData = response.pagination;

        setTransactions(Array.isArray(data) ? data : []);

        // Update pagination state
        setPagination(prev => {
          const newPagination = {
            ...prev,
            currentPage: paginationData?.current_page || 1,
            totalItems: paginationData?.total || 0,
            totalPages: paginationData?.last_page || 1,
            hasNextPage: paginationData?.has_more_pages || (paginationData?.current_page < paginationData?.last_page),
            hasPrevPage: paginationData?.current_page > 1
          };


          return newPagination;
        });

      } else {
        setError(response.message || 'Failed to load transactions');
      }
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      loadingRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, [isAuthenticated, pagination.currentPage, pagination.itemsPerPage, sorting, filters]);

  /**
   * Load transaction statistics
   */
  const loadStatistics = useCallback(async () => {
    if (!isAuthenticated) return;

    setStatisticsLoading(true);
    try {

      const response = await transactionService.getTransactionStatistics();

      if (response.success) {
        setStatistics(response.data);
      } else {
      }
    } catch (err) {
    } finally {
      setStatisticsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Update pagination
   */
  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
  }, []);

  /**
   * Update filters with debouncing
   */
  const updateFilters = useCallback((newFilters) => {
    // Clear existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    setFilters(prev => ({ ...prev, ...newFilters }));

    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));

    // Debounce the API call
    filterTimeoutRef.current = setTimeout(() => {
      loadTransactions();
    }, 300);
  }, [loadTransactions]);

  /**
   * Update sorting
   */
  const updateSorting = useCallback((newSorting) => {
    setSorting(prev => ({ ...prev, ...newSorting }));
  }, []);

  /**
   * Handle page change
   */
  const handlePageChange = useCallback((page) => {
    updatePagination({ currentPage: page });
  }, [updatePagination]);

  /**
   * Handle items per page change
   */
  const handlePerPageChange = useCallback((itemsPerPage) => {
    updatePagination({
      itemsPerPage,
      currentPage: 1 // Reset to first page
    });
  }, [updatePagination]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((field, value) => {
    updateFilters({ [field]: value });
  }, [updateFilters]);

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((sortBy, sortDirection) => {
    updateSorting({ sort_by: sortBy, sort_direction: sortDirection });
  }, [updateSorting]);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      payment_method: 'all',
      payment_gateway: 'all',
      organization_id: 'all',
      plan_id: 'all',
      amount_min: '',
      amount_max: '',
      date_from: '',
      date_to: '',
      currency: 'all'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Export transactions
   */
  const exportTransactions = useCallback(async (exportParams = {}) => {
    try {

      const params = {
        ...filters,
        ...exportParams
      };

      // Remove 'all' values from filters
      Object.keys(params).forEach(key => {
        if (params[key] === 'all' || params[key] === '') {
          delete params[key];
        }
      });

      const blob = await transactionService.exportTransactions(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      setError(err.message || 'Failed to export transactions');
      return false;
    }
  }, [filters]);

  /**
   * Get transaction by ID
   */
  const getTransactionById = useCallback(async (id) => {
    try {

      const response = await transactionService.getTransactionById(id);

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch transaction');
      }
    } catch (err) {
      throw err;
    }
  }, []);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    loadTransactions();
    loadStatistics();
  }, [loadTransactions, loadStatistics]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
      loadStatistics();
    }
  }, [isAuthenticated, pagination.currentPage, pagination.itemsPerPage, sorting, filters, loadTransactions, loadStatistics]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    transactions,
    statistics,
    pagination,
    filters,
    sorting,

    // Loading states
    loading,
    statisticsLoading,
    error,

    // Actions
    loadTransactions,
    loadStatistics,
    refresh,
    exportTransactions,
    getTransactionById,

    // Pagination actions
    handlePageChange,
    handlePerPageChange,
    updatePagination,

    // Filter actions
    handleFilterChange,
    updateFilters,
    resetFilters,

    // Sort actions
    handleSortChange,
    updateSorting,

    // Utility
    isAuthenticated,
    authLoading
  };
};
