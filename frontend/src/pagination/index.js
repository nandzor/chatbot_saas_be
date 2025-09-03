/**
 * Pagination Architecture - Main Export File
 *
 * This file provides a centralized export point for all pagination-related
 * components, hooks, utilities, and services.
 */

// Hooks
export { usePagination } from '@/hooks/usePagination';

// Components
export { default as Pagination } from '@/components/ui/Pagination';

// Context
export {
  PaginationProvider,
  usePaginationContext,
  usePaginationInstance,
  withPaginationContext,
  PAGINATION_ACTIONS
} from '@/contexts/PaginationContext';

// Services - Removed PaginationService (using lightweight library approach)

// Utilities
export {
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
  getPaginationConfig,
  default as paginationUtils
} from '@/utils/pagination';



// Configuration presets
export const PAGINATION_PRESETS = {
  TABLE: {
    initialPerPage: 10,
    perPageOptions: [10, 25, 50, 100, 200],
    maxVisiblePages: 7,
    enableUrlSync: false,
    enableLocalStorage: true,
    debounceMs: 200
  },

  MOBILE: {
    initialPerPage: 10,
    perPageOptions: [5, 10, 20, 50],
    maxVisiblePages: 3,
    enableUrlSync: false,
    enableLocalStorage: true,
    debounceMs: 500
  },

  DASHBOARD: {
    initialPerPage: 20,
    perPageOptions: [10, 20, 50, 100],
    maxVisiblePages: 5,
    enableUrlSync: false,
    enableLocalStorage: true,
    debounceMs: 100
  },

  SEARCH: {
    initialPerPage: 15,
    perPageOptions: [10, 15, 25, 50],
    maxVisiblePages: 5,
    enableUrlSync: false,
    enableLocalStorage: false,
    debounceMs: 1000
  },

  COMPACT: {
    initialPerPage: 15,
    perPageOptions: [10, 15, 25, 50],
    maxVisiblePages: 3,
    enableUrlSync: false,
    enableLocalStorage: true,
    debounceMs: 300
  }
};

// Component variants
export const PAGINATION_VARIANTS = {
  FULL: 'full',
  COMPACT: 'compact',
  MINIMAL: 'minimal',
  TABLE: 'table'
};

// Component sizes
export const PAGINATION_SIZES = {
  SMALL: 'sm',
  DEFAULT: 'default',
  LARGE: 'lg'
};

// Default configuration
export const DEFAULT_PAGINATION_CONFIG = {
  initialPerPage: 15,
  perPageOptions: [10, 15, 25, 50, 100],
  maxVisiblePages: 5,
  enableUrlSync: false,
  enableLocalStorage: false,
  storageKey: 'pagination',
  debounceMs: 300
};

// API response formats
export const API_RESPONSE_FORMATS = {
  LARAVEL: 'laravel',
  CUSTOM: 'custom',
  META: 'meta',
  AUTO: 'auto'
};

// Error types
export const PAGINATION_ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};


