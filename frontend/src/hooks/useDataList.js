import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Generic Data List Hook
 * Provides comprehensive state management and operations for data lists
 * Handles loading, error states, pagination, filtering, selection, and CRUD operations
 */
export const useDataList = (service, options = {}) => {
  const {
    defaultFilters = {},
    defaultPerPage = 15,
    autoLoad = true,
    debounceMs = 500,
    enableSelection = true,
    enableBulkActions = true,
    cacheKey = null,
    onDataChange = null,
    onError = null
  } = options;

  // Core state management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: defaultPerPage,
    total: 0,
    from: 0,
    to: 0
  });
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedItems, setSelectedItems] = useState([]);
  const [sorting, setSorting] = useState({
    field: null,
    direction: 'asc'
  });

  // Control refs
  const initialLoadRef = useRef(false);
  const debounceTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Memoized values
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value =>
      value !== '' && value !== null && value !== undefined && value !== false
    );
  }, [filters]);

  const hasSelectedItems = useMemo(() => selectedItems.length > 0, [selectedItems]);
  const allItemsSelected = useMemo(() =>
    data.length > 0 && selectedItems.length === data.length,
    [data.length, selectedItems.length]
  );
  const someItemsSelected = useMemo(() =>
    selectedItems.length > 0 && selectedItems.length < data.length,
    [data.length, selectedItems.length]
  );

  /**
   * Load data with comprehensive error handling and abort controller
   */
  const loadData = useCallback(async (page = 1, customFilters = null, customPerPage = null, customSorting = null) => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      const currentPerPage = customPerPage || pagination.per_page;
      const currentSorting = customSorting || sorting;

      // Prepare API parameters
      const params = {
        page,
        per_page: currentPerPage,
        ...currentFilters
      };

      // Add sorting if available
      if (currentSorting.field) {
        params.sort_by = currentSorting.field;
        params.sort_order = currentSorting.direction;
      }

      // Clean empty parameters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) =>
          value !== '' && value !== null && value !== undefined
        )
      );

      const response = await service.get(cleanParams, {
        signal: abortControllerRef.current.signal
      });

      if (response.success) {
        setData(response.data || []);

        // Update pagination from API response
        if (response.meta?.pagination) {
          setPagination(prev => ({
            ...prev,
            current_page: response.meta.pagination.current_page || page,
            last_page: response.meta.pagination.last_page || 1,
            per_page: response.meta.pagination.per_page || currentPerPage,
            total: response.meta.pagination.total || 0,
            from: response.meta.pagination.from || 0,
            to: response.meta.pagination.to || 0
          }));
        }

        // Call data change callback
        if (onDataChange) {
          onDataChange(response.data || [], response.meta);
        }

        // Clear selection if data changed significantly
        if (page === 1 && selectedItems.length > 0) {
          setSelectedItems([]);
        }
      } else {
        const errorMessage = response.message || 'Failed to load data';
        setError(errorMessage);

        if (onError) {
          onError(new Error(errorMessage));
        }
      }
    } catch (err) {
      // Don't set error for aborted requests
      if (err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }

      console.error('useDataList error:', err);
      const errorMessage = err.message || 'Failed to load data';
      setError(errorMessage);

      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [service, filters, pagination.per_page, sorting, selectedItems.length, onDataChange, onError]);

  /**
   * Initial load effect
   */
  useEffect(() => {
    if (autoLoad && !initialLoadRef.current) {
      initialLoadRef.current = true;
      loadData();
    }
  }, [autoLoad, loadData]);

  /**
   * Debounced filter changes effect
   */
  useEffect(() => {
    if (initialLoadRef.current) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        loadData(1, filters);
      }, debounceMs);

      return () => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
      };
    }
  }, [filters, loadData, debounceMs]);

  /**
   * Sorting changes effect
   */
  useEffect(() => {
    if (initialLoadRef.current && sorting.field) {
      loadData(pagination.current_page, filters, pagination.per_page, sorting);
    }
  }, [sorting, loadData, pagination.current_page, filters, pagination.per_page]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Filter handlers
   */
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  const handleFiltersReset = useCallback(() => {
    setFilters(defaultFilters);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, [defaultFilters]);

  const handleFiltersUpdate = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  /**
   * Pagination handlers
   */
  const handlePageChange = useCallback((page) => {
    if (page === pagination.current_page) return;
    setPagination(prev => ({ ...prev, current_page: page }));
    loadData(page, filters);
  }, [loadData, filters, pagination.current_page]);

  const handlePerPageChange = useCallback((perPage) => {
    setPagination(prev => ({
      ...prev,
      per_page: perPage,
      current_page: 1
    }));
    loadData(1, filters, perPage);
  }, [loadData, filters]);

  /**
   * Sorting handlers
   */
  const handleSortChange = useCallback((field, direction = 'asc') => {
    setSorting({ field, direction });
  }, []);

  const handleSortReset = useCallback(() => {
    setSorting({ field: null, direction: 'asc' });
  }, []);

  /**
   * Selection handlers
   */
  const handleItemSelection = useCallback((itemId, checked) => {
    if (!enableSelection) return;

    setSelectedItems(prev => {
      const exists = prev.includes(itemId);
      if (checked && !exists) return [...prev, itemId];
      if (!checked && exists) return prev.filter(id => id !== itemId);
      return prev; // no unnecessary state change
    });
  }, [enableSelection]);

  const handleBulkSelection = useCallback((checked) => {
    if (!enableSelection) return;

    console.log('handleBulkSelection:', { checked, dataLength: data.length });

    if (checked) {
      const allIds = data.map((item, index) => item?.id ?? item?.uuid ?? item?._id ?? item?.code ?? index).filter((v) => v !== undefined && v !== null);
      console.log('Selecting all:', allIds);
      setSelectedItems(allIds);
    } else {
      console.log('Clearing selection');
      setSelectedItems([]);
    }
  }, [data, enableSelection]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  /**
   * CRUD operations
   */
  const createItem = useCallback(async (itemData) => {
    try {
      const response = await service.create(itemData);

      if (response.success) {
        toast.success('Item created successfully');
        loadData(pagination.current_page, filters);
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to create item');
        return { success: false, message: response.message };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to create item');
      return { success: false, message: error.message };
    }
  }, [service, loadData, pagination.current_page, filters]);

  const updateItem = useCallback(async (id, itemData) => {
    try {
      const response = await service.update(id, itemData);

      if (response.success) {
        toast.success('Item updated successfully');
        loadData(pagination.current_page, filters);
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to update item');
        return { success: false, message: response.message };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update item');
      return { success: false, message: error.message };
    }
  }, [service, loadData, pagination.current_page, filters]);

  const deleteItem = useCallback(async (id) => {
    try {
      const response = await service.delete(id);

      if (response.success) {
        toast.success('Item deleted successfully');
        loadData(pagination.current_page, filters);
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to delete item');
        return { success: false, message: response.message };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete item');
      return { success: false, message: error.message };
    }
  }, [service, loadData, pagination.current_page, filters]);

  const bulkDeleteItems = useCallback(async (ids) => {
    if (!enableBulkActions) {
      toast.error('Bulk actions are not enabled');
      return { success: false, message: 'Bulk actions are not enabled' };
    }

    try {
      const response = await service.bulkDelete(ids);

      if (response.success) {
        toast.success(`${ids.length} items deleted successfully`);
        loadData(pagination.current_page, filters);
        clearSelection();
        return { success: true };
      } else {
        toast.error(response.message || 'Failed to delete items');
        return { success: false, message: response.message };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete items');
      return { success: false, message: error.message };
    }
  }, [service, loadData, pagination.current_page, filters, clearSelection, enableBulkActions]);

  /**
   * Utility functions
   */
  const retryLoad = useCallback(() => {
    loadData(pagination.current_page, filters);
  }, [loadData, pagination.current_page, filters]);

  const refreshData = useCallback(() => {
    loadData(1, filters);
  }, [loadData, filters]);

  const exportData = useCallback(async (format = 'json', exportFilters = {}) => {
    try {
      const response = await service.exportData(format, { ...filters, ...exportFilters });

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Failed to export data');
        return { success: false, message: response.message };
      }
    } catch (error) {
      toast.error(error.message || 'Failed to export data');
      return { success: false, message: error.message };
    }
  }, [service, filters]);

  /**
   * Return comprehensive state and actions
   */
  return {
    // State
    data,
    loading,
    error,
    pagination,
    filters,
    selectedItems,
    sorting,

    // Computed values
    hasActiveFilters,
    hasSelectedItems,
    allItemsSelected,
    someItemsSelected,

    // Filter actions
    handleFilterChange,
    handleFiltersReset,
    handleFiltersUpdate,

    // Pagination actions
    handlePageChange,
    handlePerPageChange,

    // Sorting actions
    handleSortChange,
    handleSortReset,

    // Selection actions
    handleItemSelection,
    handleBulkSelection,
    clearSelection,

    // CRUD actions
    createItem,
    updateItem,
    deleteItem,
    bulkDeleteItems,

    // Utility actions
    loadData,
    retryLoad,
    refreshData,
    exportData,

    // Raw setters for advanced usage
    setData,
    setLoading,
    setError,
    setPagination,
    setFilters,
    setSelectedItems,
    setSorting
  };
};
