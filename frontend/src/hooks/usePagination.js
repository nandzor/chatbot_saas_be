import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

/**
 * Enhanced Pagination Hook with Advanced Features
 *
 * Features:
 * - Smart pagination with configurable options
 * - URL synchronization
 * - Local storage persistence
 * - Debounced page changes
 * - Loading states management
 * - Accessibility support
 * - Performance optimizations
 */

export const usePagination = (options = {}) => {
  const {
    initialPerPage = 15,
    perPageOptions = [10, 15, 25, 50, 100],
    maxVisiblePages = 5,
    enableUrlSync = false,
    enableLocalStorage = false,
    storageKey = 'pagination',
    debounceMs = 300,
    onPageChange = null,
    onPerPageChange = null
  } = options;

  // Core pagination state
  const [pagination, setPagination] = useState(() => {
    const defaultState = {
      current_page: 1,
      last_page: 1,
      per_page: initialPerPage,
      total: 0,
      from: 0,
      to: 0
    };

    // Load from localStorage if enabled
    if (enableLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...defaultState, ...parsed };
        }
      } catch (error) {
        console.warn('Failed to load pagination from localStorage:', error);
      }
    }

    return defaultState;
  });

  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const previousStateRef = useRef(pagination);

  // URL synchronization
  useEffect(() => {
    if (enableUrlSync && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const page = parseInt(urlParams.get('page')) || 1;
      const perPage = parseInt(urlParams.get('per_page')) || initialPerPage;

      if (page !== pagination.current_page || perPage !== pagination.per_page) {
        setPagination(prev => ({
          ...prev,
          current_page: page,
          per_page: perPage
        }));
      }
    }
  }, [enableUrlSync, initialPerPage]);

  // Local storage persistence
  useEffect(() => {
    if (enableLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(pagination));
      } catch (error) {
        console.warn('Failed to save pagination to localStorage:', error);
      }
    }
  }, [pagination, enableLocalStorage, storageKey]);

  // URL synchronization on state change
  useEffect(() => {
    if (enableUrlSync && typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.set('page', pagination.current_page.toString());
      url.searchParams.set('per_page', pagination.per_page.toString());

      // Only update URL if it actually changed
      if (url.toString() !== window.location.toString()) {
        window.history.replaceState({}, '', url);
      }
    }
  }, [pagination.current_page, pagination.per_page, enableUrlSync]);

  // Calculate comprehensive pagination info
  const paginationInfo = useMemo(() => {
    const { current_page, last_page, per_page, total } = pagination;
    const startItem = total > 0 ? ((current_page - 1) * per_page) + 1 : 0;
    const endItem = Math.min(current_page * per_page, total);

    return {
      // Basic info
      startItem,
      endItem,
      totalItems: total,
      currentPage: current_page,
      totalPages: last_page,
      itemsPerPage: per_page,

      // Navigation flags
      hasNextPage: current_page < last_page,
      hasPrevPage: current_page > 1,
      isFirstPage: current_page === 1,
      isLastPage: current_page === last_page,
      hasData: total > 0,

      // Items info
      itemsShown: endItem - startItem + 1,

      // Page ranges
      startPage: 1,
      endPage: last_page,

      // Accessibility
      ariaLabel: `Page ${current_page} of ${last_page}, showing ${startItem} to ${endItem} of ${total} results`
    };
  }, [pagination]);

  // Update pagination from API response with validation
  const updatePagination = useCallback((apiResponse) => {
    try {
      setError(null);

      if (!apiResponse) {
        console.warn('updatePagination: No API response provided');
        return;
      }

      // Support multiple response formats
      let paginationData = null;

      if (apiResponse?.meta?.pagination) {
        paginationData = apiResponse.meta.pagination;
      } else if (apiResponse?.pagination) {
        paginationData = apiResponse.pagination;
      } else if (apiResponse?.meta) {
        paginationData = apiResponse.meta;
      }

      if (paginationData) {
        const newPagination = {
          current_page: Math.max(1, paginationData.current_page || paginationData.currentPage || 1),
          last_page: Math.max(1, paginationData.last_page || paginationData.lastPage || paginationData.totalPages || 1),
          per_page: Math.max(1, paginationData.per_page || paginationData.perPage || paginationData.itemsPerPage || initialPerPage),
          total: Math.max(0, paginationData.total || paginationData.totalItems || 0),
          from: paginationData.from || 0,
          to: paginationData.to || 0
        };

        // Validate pagination data
        if (newPagination.current_page > newPagination.last_page && newPagination.last_page > 0) {
          newPagination.current_page = newPagination.last_page;
        }

        setPagination(prev => {
          const updated = { ...prev, ...newPagination };

          // Call callback if provided and state actually changed
          if (onPageChange && JSON.stringify(prev) !== JSON.stringify(updated)) {
            onPageChange(updated);
          }

          return updated;
        });
      } else {
        console.warn('updatePagination: No pagination data found in API response');
      }
    } catch (error) {
      setError('Failed to update pagination data');
    }
  }, [initialPerPage, onPageChange]);

  // Debounced page change
  const changePage = useCallback((page, immediate = false) => {
    const targetPage = Math.max(1, Math.min(page, pagination.last_page));

    if (targetPage === pagination.current_page) return;

    const performChange = () => {
      setPagination(prev => {
        const updated = { ...prev, current_page: targetPage };

        if (onPageChange) {
          onPageChange(updated);
        }

        return updated;
      });
    };

    if (immediate || debounceMs === 0) {
      performChange();
    } else {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(performChange, debounceMs);
    }
  }, [pagination.current_page, pagination.last_page, debounceMs, onPageChange]);

  // Change per page with validation
  const changePerPage = useCallback((newPerPage) => {
    const validPerPage = perPageOptions.includes(newPerPage)
      ? newPerPage
      : perPageOptions[0];

    if (validPerPage === pagination.per_page) return;

    setPagination(prev => {
      const updated = {
        ...prev,
        per_page: validPerPage,
        current_page: 1 // Reset to first page when changing per page
      };

      if (onPerPageChange) {
        onPerPageChange(updated);
      }

      return updated;
    });
  }, [pagination.per_page, perPageOptions, onPerPageChange]);

  // Navigation helpers
  const goToFirstPage = useCallback(() => changePage(1), [changePage]);
  const goToLastPage = useCallback(() => changePage(pagination.last_page), [changePage, pagination.last_page]);
  const goToNextPage = useCallback(() => changePage(pagination.current_page + 1), [changePage, pagination.current_page]);
  const goToPrevPage = useCallback(() => changePage(pagination.current_page - 1), [changePage, pagination.current_page]);

  // Reset pagination to initial state
  const resetPagination = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      current_page: 1,
      per_page: initialPerPage
    }));
  }, [initialPerPage]);

  // Get visible page numbers with smart truncation
  const getVisiblePages = useCallback((customMaxVisible = maxVisiblePages) => {
    const { current_page, last_page } = pagination;
    const maxVisible = Math.min(customMaxVisible, last_page);

    if (last_page <= maxVisible) {
      return Array.from({ length: last_page }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, current_page - halfVisible);
    let endPage = Math.min(last_page, startPage + maxVisible - 1);

    // Adjust if we're near the end
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    // Add ellipsis indicators
    const result = [];

    if (startPage > 1) {
      result.push(1);
      if (startPage > 2) {
        result.push('...');
      }
    }

    result.push(...pages);

    if (endPage < last_page) {
      if (endPage < last_page - 1) {
        result.push('...');
      }
      result.push(last_page);
    }

    return result;
  }, [pagination.current_page, pagination.last_page, maxVisiblePages]);

  // Get page range for display
  const getPageRange = useCallback(() => {
    const { current_page, last_page, per_page, total } = pagination;
    const startItem = total > 0 ? ((current_page - 1) * per_page) + 1 : 0;
    const endItem = Math.min(current_page * per_page, total);

    return {
      start: startItem,
      end: endItem,
      total: total,
      formatted: total > 0 ? `${startItem}-${endItem} of ${total}` : '0 results'
    };
  }, [pagination]);

  // Validation helpers
  const isValidPage = useCallback((page) => {
    return Number.isInteger(page) && page >= 1 && page <= pagination.last_page;
  }, [pagination.last_page]);

  const isValidPerPage = useCallback((perPage) => {
    return perPageOptions.includes(perPage);
  }, [perPageOptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    // Core state
    pagination,
    paginationLoading,
    error,

    // Computed values
    paginationInfo,
    perPageOptions,

    // Actions
    updatePagination,
    changePage,
    changePerPage,
    resetPagination,
    setPaginationLoading,

    // Navigation helpers
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPrevPage,

    // Utilities
    getVisiblePages,
    getPageRange,
    isValidPage,
    isValidPerPage,

    // State management
    setError
  };
};
