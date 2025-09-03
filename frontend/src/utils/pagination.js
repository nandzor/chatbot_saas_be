/**
 * Pagination Utilities and Helpers
 *
 * This module provides utility functions for pagination calculations,
 * validations, and transformations across the application.
 */

/**
 * Calculate pagination info from raw data
 * @param {Object} params - Pagination parameters
 * @param {number} params.currentPage - Current page number
 * @param {number} params.totalItems - Total number of items
 * @param {number} params.itemsPerPage - Items per page
 * @returns {Object} Calculated pagination info
 */
export const calculatePaginationInfo = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 15
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const startItem = totalItems > 0 ? ((validCurrentPage - 1) * itemsPerPage) + 1 : 0;
  const endItem = Math.min(validCurrentPage * itemsPerPage, totalItems);

  return {
    currentPage: validCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem,
    hasNextPage: validCurrentPage < totalPages,
    hasPrevPage: validCurrentPage > 1,
    isFirstPage: validCurrentPage === 1,
    isLastPage: validCurrentPage === totalPages,
    itemsShown: endItem - startItem + 1
  };
};

/**
 * Generate visible page numbers with ellipsis
 * @param {Object} params - Page calculation parameters
 * @param {number} params.currentPage - Current page number
 * @param {number} params.totalPages - Total number of pages
 * @param {number} params.maxVisible - Maximum visible page numbers
 * @returns {Array} Array of page numbers and ellipsis
 */
export const generateVisiblePages = ({
  currentPage = 1,
  totalPages = 1,
  maxVisible = 5
}) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const halfVisible = Math.floor(maxVisible / 2);
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  const result = [];

  if (startPage > 1) {
    result.push(1);
    if (startPage > 2) {
      result.push('...');
    }
  }

  result.push(...pages);

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      result.push('...');
    }
    result.push(totalPages);
  }

  return result;
};

/**
 * Validate pagination parameters
 * @param {Object} params - Parameters to validate
 * @param {number} params.page - Page number
 * @param {number} params.perPage - Items per page
 * @param {number} params.total - Total items
 * @param {Array} params.allowedPerPage - Allowed per page values
 * @returns {Object} Validation result
 */
export const validatePaginationParams = ({
  page,
  perPage,
  total = 0,
  allowedPerPage = [10, 15, 25, 50, 100]
}) => {
  const errors = [];
  const warnings = [];

  // Validate page
  if (!Number.isInteger(page) || page < 1) {
    errors.push('Page must be a positive integer');
  }

  // Validate perPage
  if (!Number.isInteger(perPage) || perPage < 1) {
    errors.push('Per page must be a positive integer');
  } else if (!allowedPerPage.includes(perPage)) {
    warnings.push(`Per page value ${perPage} is not in allowed values: ${allowedPerPage.join(', ')}`);
  }

  // Validate total
  if (!Number.isInteger(total) || total < 0) {
    errors.push('Total must be a non-negative integer');
  }

  // Check if page exceeds total pages
  if (total > 0 && page > Math.ceil(total / perPage)) {
    warnings.push(`Page ${page} exceeds total pages (${Math.ceil(total / perPage)})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasWarnings: warnings.length > 0
  };
};

/**
 * Transform API response to standardized pagination format
 * @param {Object} apiResponse - API response object
 * @param {string} format - Response format ('laravel', 'custom', 'meta')
 * @returns {Object} Standardized pagination object
 */
export const transformApiResponse = (apiResponse, format = 'auto') => {
  if (!apiResponse) {
    return {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
      from: 0,
      to: 0
    };
  }

  let paginationData = null;

  // Auto-detect format
  if (format === 'auto') {
    if (apiResponse?.meta?.pagination) {
      format = 'laravel';
    } else if (apiResponse?.pagination) {
      format = 'custom';
    } else if (apiResponse?.meta) {
      format = 'meta';
    }
  }

  // Extract pagination data based on format
  switch (format) {
    case 'laravel':
      paginationData = apiResponse.meta?.pagination || apiResponse.meta;
      break;
    case 'custom':
      paginationData = apiResponse.pagination;
      break;
    case 'meta':
      paginationData = apiResponse.meta;
      break;
    default:
      paginationData = apiResponse;
  }

  if (!paginationData) {
    console.warn('No pagination data found in API response');
    return {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
      from: 0,
      to: 0
    };
  }

  return {
    current_page: Math.max(1, paginationData.current_page || paginationData.currentPage || 1),
    last_page: Math.max(1, paginationData.last_page || paginationData.lastPage || paginationData.totalPages || 1),
    per_page: Math.max(1, paginationData.per_page || paginationData.perPage || paginationData.itemsPerPage || 15),
    total: Math.max(0, paginationData.total || paginationData.totalItems || 0),
    from: paginationData.from || 0,
    to: paginationData.to || 0
  };
};

/**
 * Create pagination query parameters for API requests
 * @param {Object} pagination - Pagination state
 * @param {Object} options - Additional options
 * @returns {Object} Query parameters object
 */
export const createPaginationParams = (pagination, options = {}) => {
  const {
    includeTotal = true,
    includeFromTo = true,
    customParams = {}
  } = options;

  const params = {
    page: pagination.current_page || pagination.currentPage || 1,
    per_page: pagination.per_page || pagination.perPage || pagination.itemsPerPage || 15
  };

  if (includeTotal && pagination.total !== undefined) {
    params.total = pagination.total;
  }

  if (includeFromTo) {
    if (pagination.from !== undefined) params.from = pagination.from;
    if (pagination.to !== undefined) params.to = pagination.to;
  }

  return { ...params, ...customParams };
};

/**
 * Calculate pagination statistics
 * @param {Object} pagination - Pagination state
 * @returns {Object} Statistics object
 */
export const calculatePaginationStats = (pagination) => {
  const {
    current_page = 1,
    last_page = 1,
    per_page = 15,
    total = 0
  } = pagination;

  const startItem = total > 0 ? ((current_page - 1) * per_page) + 1 : 0;
  const endItem = Math.min(current_page * per_page, total);
  const progress = last_page > 0 ? Math.round((current_page / last_page) * 100) : 0;

  return {
    startItem,
    endItem,
    totalItems: total,
    currentPage: current_page,
    totalPages: last_page,
    itemsPerPage: per_page,
    itemsShown: endItem - startItem + 1,
    progress,
    hasData: total > 0,
    isEmpty: total === 0,
    isFirstPage: current_page === 1,
    isLastPage: current_page === last_page,
    hasNextPage: current_page < last_page,
    hasPrevPage: current_page > 1
  };
};

/**
 * Format pagination info for display
 * @param {Object} pagination - Pagination state
 * @param {Object} options - Formatting options
 * @returns {Object} Formatted display strings
 */
export const formatPaginationDisplay = (pagination, options = {}) => {
  const {
    showItemsShown = true,
    showPercentage = false,
    locale = 'en-US'
  } = options;

  const stats = calculatePaginationStats(pagination);
  const { startItem, endItem, totalItems, currentPage, totalPages, itemsShown } = stats;

  const formats = {
    // Basic info
    pageInfo: totalItems > 0
      ? `Showing ${startItem.toLocaleString(locale)} to ${endItem.toLocaleString(locale)} of ${totalItems.toLocaleString(locale)} results`
      : 'No results found',

    pageRange: totalItems > 0
      ? `${startItem.toLocaleString(locale)}-${endItem.toLocaleString(locale)} of ${totalItems.toLocaleString(locale)}`
      : '0 results',

    currentPage: `Page ${currentPage.toLocaleString(locale)} of ${totalPages.toLocaleString(locale)}`,

    // Progress info
    percentage: showPercentage ? `${Math.round((currentPage / totalPages) * 100)}%` : null,

    // Items info
    itemsShown: showItemsShown ? `${itemsShown} items` : null,

    // Navigation
    navigation: {
      first: 'Go to first page',
      last: 'Go to last page',
      prev: 'Go to previous page',
      next: 'Go to next page',
      page: (page) => `Go to page ${page}`
    }
  };

  return formats;
};

/**
 * Create pagination URL parameters
 * @param {Object} pagination - Pagination state
 * @param {Object} options - URL options
 * @returns {URLSearchParams} URL search parameters
 */
export const createPaginationUrl = (pagination, options = {}) => {
  const {
    baseUrl = window?.location?.pathname || '/',
    includeHash = false,
    customParams = {}
  } = options;

  const params = new URLSearchParams();

  params.set('page', (pagination.current_page || 1).toString());
  params.set('per_page', (pagination.per_page || 15).toString());

  // Add custom parameters
  Object.entries(customParams).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.set(key, value.toString());
    }
  });

  const url = new URL(baseUrl, window?.location?.origin || 'http://localhost');
  url.search = params.toString();

  if (includeHash && window?.location?.hash) {
    url.hash = window.location.hash;
  }

  return url;
};

/**
 * Parse pagination from URL parameters
 * @param {string|URLSearchParams} urlParams - URL parameters
 * @param {Object} defaults - Default values
 * @returns {Object} Parsed pagination object
 */
export const parsePaginationFromUrl = (urlParams, defaults = {}) => {
  const params = urlParams instanceof URLSearchParams
    ? urlParams
    : new URLSearchParams(urlParams);

  return {
    current_page: parseInt(params.get('page')) || defaults.current_page || 1,
    per_page: parseInt(params.get('per_page')) || defaults.per_page || 15,
    total: parseInt(params.get('total')) || defaults.total || 0
  };
};

/**
 * Debounce pagination changes
 * @param {Function} callback - Callback function
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debouncePagination = (callback, delay = 300) => {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};

/**
 * Throttle pagination changes
 * @param {Function} callback - Callback function
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttlePagination = (callback, limit = 100) => {
  let inThrottle;

  return (...args) => {
    if (!inThrottle) {
      callback(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Create pagination cache key
 * @param {string} baseKey - Base cache key
 * @param {Object} pagination - Pagination state
 * @param {Object} filters - Additional filters
 * @returns {string} Cache key
 */
export const createPaginationCacheKey = (baseKey, pagination, filters = {}) => {
  const paginationKey = `page_${pagination.current_page || 1}_per_${pagination.per_page || 15}`;
  const filtersKey = Object.keys(filters).length > 0
    ? `_filters_${JSON.stringify(filters)}`
    : '';

  return `${baseKey}_${paginationKey}${filtersKey}`;
};

/**
 * Check if pagination state has changed
 * @param {Object} prevPagination - Previous pagination state
 * @param {Object} currentPagination - Current pagination state
 * @returns {boolean} True if state has changed
 */
export const hasPaginationChanged = (prevPagination, currentPagination) => {
  if (!prevPagination || !currentPagination) return true;

  return (
    prevPagination.current_page !== currentPagination.current_page ||
    prevPagination.per_page !== currentPagination.per_page ||
    prevPagination.total !== currentPagination.total
  );
};

/**
 * Merge pagination states
 * @param {Object} basePagination - Base pagination state
 * @param {Object} overridePagination - Override pagination state
 * @returns {Object} Merged pagination state
 */
export const mergePaginationStates = (basePagination, overridePagination) => {
  return {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
    ...basePagination,
    ...overridePagination
  };
};

/**
 * Create pagination configuration for different use cases
 * @param {string} useCase - Use case identifier
 * @returns {Object} Pagination configuration
 */
export const getPaginationConfig = (useCase = 'default') => {
  const configs = {
    default: {
      initialPerPage: 15,
      perPageOptions: [10, 15, 25, 50, 100],
      maxVisiblePages: 5,
      enableUrlSync: false,
      enableLocalStorage: false,
      debounceMs: 300
    },

    table: {
      initialPerPage: 25,
      perPageOptions: [10, 25, 50, 100, 200],
      maxVisiblePages: 7,
      enableUrlSync: true,
      enableLocalStorage: true,
      debounceMs: 200
    },

    mobile: {
      initialPerPage: 10,
      perPageOptions: [5, 10, 20, 50],
      maxVisiblePages: 3,
      enableUrlSync: false,
      enableLocalStorage: true,
      debounceMs: 500
    },

    dashboard: {
      initialPerPage: 20,
      perPageOptions: [10, 20, 50, 100],
      maxVisiblePages: 5,
      enableUrlSync: false,
      enableLocalStorage: true,
      debounceMs: 100
    },

    search: {
      initialPerPage: 15,
      perPageOptions: [10, 15, 25, 50],
      maxVisiblePages: 5,
      enableUrlSync: true,
      enableLocalStorage: false,
      debounceMs: 1000
    }
  };

  return configs[useCase] || configs.default;
};

// Export all utilities as default object
export default {
  calculatePaginationInfo,
  generateVisiblePages,
  validatePaginationParams,
  transformApiResponse,
  createPaginationParams,
  calculatePaginationStats,
  formatPaginationDisplay,
  createPaginationUrl,
  parsePaginationFromUrl,
  debouncePagination,
  throttlePagination,
  createPaginationCacheKey,
  hasPaginationChanged,
  mergePaginationStates,
  getPaginationConfig
};
