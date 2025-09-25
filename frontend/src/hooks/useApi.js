/**
 * Custom API Hooks
 * Reusable hooks untuk API operations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from '@/utils/helpers';
import api from '@/services/api';

/**
 * Generic API hook
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,
    dependencies = [],
    onSuccess,
    onError,
    retry = 0,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const execute = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction(params);

      if (result.success) {
        setData(result.data);
        onSuccess?.(result.data);
      } else {
        setError(result.error);
        onError?.(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const refresh = useCallback(async (params = {}) => {
    setRefreshing(true);
    await execute(params);
    setRefreshing(false);
  }, [execute]);

  const retryRequest = useCallback(async (params = {}) => {
    if (retry > 0) {
      for (let i = 0; i < retry; i++) {
        try {
          await execute(params);
          break;
        } catch (err) {
          if (i === retry - 1) throw err;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    } else {
      await execute(params);
    }
  }, [execute, retry, retryDelay]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, dependencies]);

  return {
    data,
    loading,
    error,
    refreshing,
    execute,
    refresh,
    retry: retryRequest,
    setData,
    setError
  };
};

/**
 * Paginated API hook
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const {
    initialPage = 1,
    initialPerPage = 10,
    initialSearch = '',
    initialSort = '',
    initialSortDirection = 'asc',
    initialFilters = {},
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialPerPage
  });
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState({
    field: initialSort,
    direction: initialSortDirection
  });
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction({
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
        search,
        sort_by: sort.field,
        sort_direction: sort.direction,
        ...filters,
        ...params
      });

      if (result.success) {
        setData(result.data.data || result.data);
        setPagination(prev => ({
          ...prev,
          currentPage: result.data.current_page || result.data.page || pagination.currentPage,
          totalPages: result.data.last_page || result.data.total_pages || 1,
          totalItems: result.data.total || result.data.total_items || 0,
          itemsPerPage: result.data.per_page || result.data.items_per_page || pagination.itemsPerPage
        }));
        onSuccess?.(result.data);
      } else {
        setError(result.error);
        onError?.(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, pagination.currentPage, pagination.itemsPerPage, search, sort, filters, onSuccess, onError]);

  const handlePageChange = useCallback((page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handleItemsPerPageChange = useCallback((perPage) => {
    setPagination(prev => ({ ...prev, itemsPerPage: perPage, currentPage: 1 }));
  }, []);

  const handleSearch = useCallback((searchValue) => {
    setSearch(searchValue);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleSort = useCallback((field, direction) => {
    setSort({ field, direction });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    pagination,
    search,
    sort,
    filters,
    loading,
    error,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearch,
    handleSort,
    handleFilter,
    refresh,
    setData,
    setError
  };
};

/**
 * Search API hook with debouncing
 */
export const useSearchApi = (apiFunction, options = {}) => {
  const {
    debounceDelay = 300,
    minLength = 1,
    onSuccess,
    onError
  } = options;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFunction = useCallback(async (searchQuery) => {
    if (searchQuery.length < minLength) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction({ q: searchQuery });

      if (result.success) {
        setResults(result.data);
        onSuccess?.(result.data);
      } else {
        setError(result.error);
        onError?.(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Search failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, minLength, onSuccess, onError]);

  const debouncedSearch = useMemo(
    () => debounce(searchFunction, debounceDelay),
    [searchFunction, debounceDelay]
  );

  const handleSearch = useCallback((searchQuery) => {
    setQuery(searchQuery);
    debouncedSearch(searchQuery);
  }, [debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    results,
    loading,
    error,
    handleSearch,
    clearSearch,
    setQuery,
    setResults,
    setError
  };
};

/**
 * CRUD API hook
 */
export const useCrudApi = (apiService, options = {}) => {
  const {
    onSuccess,
    onError,
    onDeleteSuccess,
    onUpdateSuccess,
    onCreateSuccess
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [operation, setOperation] = useState(null);

  const create = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setOperation('create');

    try {
      const result = await apiService.create(data);

      if (result.success) {
        onCreateSuccess?.(result.data);
        onSuccess?.('create', result.data);
      } else {
        setError(result.error);
        onError?.(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Create failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      setOperation(null);
    }
  }, [apiService, onCreateSuccess, onSuccess, onError]);

  const update = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    setOperation('update');

    try {
      const result = await apiService.update(id, data);

      if (result.success) {
        onUpdateSuccess?.(result.data);
        onSuccess?.('update', result.data);
      } else {
        setError(result.error);
        onError?.(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Update failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      setOperation(null);
    }
  }, [apiService, onUpdateSuccess, onSuccess, onError]);

  const remove = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setOperation('delete');

    try {
      const result = await apiService.deleteById(id);

      if (result.success) {
        onDeleteSuccess?.(id);
        onSuccess?.('delete', id);
      } else {
        setError(result.error);
        onError?.(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Delete failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      setOperation(null);
    }
  }, [apiService, onDeleteSuccess, onSuccess, onError]);

  const toggleStatus = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    setOperation('toggle');

    try {
      const result = await apiService.toggleStatus(id);

      if (result.success) {
        onSuccess?.('toggle', result.data);
      } else {
        setError(result.error);
        onError?.(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Toggle status failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
      setOperation(null);
    }
  }, [apiService, onSuccess, onError]);

  return {
    loading,
    error,
    operation,
    create,
    update,
    remove,
    toggleStatus,
    setError
  };
};

/**
 * Real-time data hook
 */
export const useRealtimeData = (apiFunction, options = {}) => {
  const {
    interval = 30000, // 30 seconds
    immediate = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFunction();

      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date());
        onSuccess?.(result.data);
      } else {
        setError(result.error);
        onError?.(result.error);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch data';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval, immediate]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh
  };
};

/**
 * Form API hook
 */
export const useFormApi = (apiFunction, options = {}) => {
  const {
    initialData = {},
    onSuccess,
    onError,
    validate
  } = options;

  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((name, value) => {
    setData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (submitData = data) => {
    setLoading(true);
    setErrors({});
    setSubmitted(true);

    try {
      // Validate if validation function provided
      if (validate) {
        const validationResult = validate(submitData);
        if (!validationResult.isValid) {
          const newErrors = {};
          validationResult.errors.forEach(error => {
            newErrors[error.field] = error.message;
          });
          setErrors(newErrors);
          setLoading(false);
          return { success: false, errors: newErrors };
        }
      }

      const result = await apiFunction(submitData);

      if (result.success) {
        onSuccess?.(result.data);
        setSubmitted(false);
      } else {
        setFormError(result.error);
        onError?.(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Submit failed';
      setFormError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, data, validate, onSuccess, onError, setFormError]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setSubmitted(false);
  }, [initialData]);

  const setFormError = useCallback((error) => {
    setErrors(prev => ({ ...prev, general: error }));
  }, []);

  return {
    data,
    errors,
    loading,
    submitted,
    handleChange,
    handleSubmit,
    reset,
    setData,
    setErrors,
    setError: setFormError
  };
};

/**
 * Simple API hook for endpoint-based requests
 * Supports both GET and POST methods
 */
export const useApiEndpoint = (endpoint, options = {}) => {
  const { method = 'GET' } = options;

  const get = useCallback(async (params = {}) => {
    try {
      const response = await api.get(endpoint, { params });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        data: null
      };
    }
  }, [endpoint]);

  const post = useCallback(async (data = {}) => {
    try {
      const response = await api.post(endpoint, data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        data: null
      };
    }
  }, [endpoint]);

  const put = useCallback(async (data = {}) => {
    try {
      const response = await api.put(endpoint, data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        data: null
      };
    }
  }, [endpoint]);

  const del = useCallback(async () => {
    try {
      const response = await api.delete(endpoint);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Request failed',
        data: null
      };
    }
  }, [endpoint]);

  // Return the appropriate method based on the method option
  if (method === 'POST') {
    return { post };
  } else if (method === 'PUT') {
    return { put };
  } else if (method === 'DELETE') {
    return { del };
  } else {
    return { get };
  }
};

export default {
  useApi,
  useApiEndpoint,
  usePaginatedApi,
  useSearchApi,
  useCrudApi,
  useRealtimeData,
  useFormApi
};
