import { useState, useCallback, useMemo } from 'react';

export const usePagination = (initialPerPage = 15) => {
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: initialPerPage,
    total: 0
  });

  const [paginationLoading, setPaginationLoading] = useState(false);

  // Calculate pagination info
  const paginationInfo = useMemo(() => {
    const startItem = ((pagination.current_page - 1) * pagination.per_page) + 1;
    const endItem = Math.min(pagination.current_page * pagination.per_page, pagination.total);

    return {
      startItem,
      endItem,
      hasNextPage: pagination.current_page < pagination.last_page,
      hasPrevPage: pagination.current_page > 1,
      totalPages: pagination.last_page,
      isFirstPage: pagination.current_page === 1,
      isLastPage: pagination.current_page === pagination.last_page
    };
  }, [pagination]);

  // Update pagination from API response
  const updatePagination = useCallback((apiResponse) => {
    if (apiResponse?.meta?.pagination) {
      const { current_page, last_page, per_page, total } = apiResponse.meta.pagination;
      setPagination(prev => ({
        ...prev,
        current_page: current_page || prev.current_page,
        last_page: last_page || prev.last_page,
        per_page: per_page || prev.per_page,
        total: total || prev.total
      }));
    }
  }, []);

  // Change page
  const changePage = useCallback((page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setPagination(prev => ({ ...prev, current_page: page }));
    }
  }, [pagination.last_page]);

  // Change per page
  const changePerPage = useCallback((newPerPage) => {
    setPagination(prev => ({
      ...prev,
      per_page: newPerPage,
      current_page: 1 // Reset to first page when changing per page
    }));
  }, []);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, []);

  // Get visible page numbers for pagination display
  const getVisiblePages = useCallback((maxVisible = 5) => {
    const { current_page, last_page } = pagination;

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

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [pagination.current_page, pagination.last_page]);

  return {
    // State
    pagination,
    paginationLoading,

    // Computed values
    paginationInfo,

    // Actions
    updatePagination,
    changePage,
    changePerPage,
    resetPagination,
    setPaginationLoading,

    // Utilities
    getVisiblePages
  };
};
