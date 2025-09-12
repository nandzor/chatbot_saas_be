/**
 * Helper Functions
 * Reusable utility functions untuk mengurangi duplikasi kode
 */

import {
  HTTP_STATUS,
  DATE_FORMATS,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  PAGINATION
} from './constants';

/**
 * Format date to display format
 */
export const formatDate = (date, format = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const options = {
    [DATE_FORMATS.DISPLAY]: { day: '2-digit', month: '2-digit', year: 'numeric' },
    [DATE_FORMATS.DISPLAY_WITH_TIME]: {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    [DATE_FORMATS.API]: { year: 'numeric', month: '2-digit', day: '2-digit' },
    [DATE_FORMATS.API_WITH_TIME]: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
  };

  return d.toLocaleDateString('id-ID', options[format] || options[DATE_FORMATS.DISPLAY]);
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (number, locale = 'id-ID') => {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'IDR', locale = 'id-ID') => {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate UUID v4
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * Merge objects deeply
 */
export const deepMerge = (target, source) => {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Sleep function
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry function with exponential backoff
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  return VALIDATION_RULES.EMAIL.test(email);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
  return VALIDATION_RULES.PHONE.test(phone);
};

/**
 * Validate password
 */
export const isValidPassword = (password) => {
  return VALIDATION_RULES.PASSWORD.test(password);
};

/**
 * Validate username
 */
export const isValidUsername = (username) => {
  return VALIDATION_RULES.USERNAME.test(username);
};

/**
 * Validate URL
 */
export const isValidURL = (url) => {
  return VALIDATION_RULES.URL.test(url);
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const statusColors = {
    active: 'green',
    inactive: 'gray',
    pending: 'yellow',
    suspended: 'red',
    cancelled: 'red',
    expired: 'red',
    completed: 'green',
    failed: 'red',
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'blue'
  };

  return statusColors[status?.toLowerCase()] || 'gray';
};

/**
 * Get status icon
 */
export const getStatusIcon = (status) => {
  const statusIcons = {
    active: 'CheckCircle',
    inactive: 'XCircle',
    pending: 'Clock',
    suspended: 'Pause',
    cancelled: 'X',
    expired: 'AlertCircle',
    completed: 'CheckCircle',
    failed: 'XCircle',
    success: 'CheckCircle',
    error: 'XCircle',
    warning: 'AlertTriangle',
    info: 'Info'
  };

  return statusIcons[status?.toLowerCase()] || 'Circle';
};

/**
 * Calculate pagination info
 */
export const calculatePagination = (currentPage, totalItems, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return {
    totalPages,
    startItem,
    endItem,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

/**
 * Generate pagination array
 */
export const generatePaginationArray = (currentPage, totalPages, maxVisible = PAGINATION.MAX_VISIBLE_PAGES) => {
  const pages = [];
  const halfVisible = Math.floor(maxVisible / 2);

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, currentPage + halfVisible);

  if (endPage - startPage + 1 < maxVisible) {
    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + maxVisible - 1);
    } else {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return {
    pages,
    showFirstEllipsis: startPage > 1,
    showLastEllipsis: endPage < totalPages
  };
};

/**
 * Sort array by key
 */
export const sortArray = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter array by search term
 */
export const filterArray = (array, searchTerm, searchKeys = []) => {
  if (!searchTerm) return array;

  return array.filter(item => {
    if (searchKeys.length === 0) {
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return searchKeys.some(key => {
      const value = item[key];
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Remove duplicates from array
 */
export const removeDuplicates = (array, key) => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Get nested object value
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};

/**
 * Set nested object value
 */
export const setNestedValue = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    return current[key];
  }, obj);

  target[lastKey] = value;
  return obj;
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim() === '';
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Get error message from response
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.response?.status) {
    const statusMessages = {
      [HTTP_STATUS.BAD_REQUEST]: ERROR_MESSAGES.VALIDATION_ERROR,
      [HTTP_STATUS.UNAUTHORIZED]: ERROR_MESSAGES.UNAUTHORIZED,
      [HTTP_STATUS.FORBIDDEN]: ERROR_MESSAGES.FORBIDDEN,
      [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND,
      [HTTP_STATUS.INTERNAL_SERVER_ERROR]: ERROR_MESSAGES.SERVER_ERROR
    };

    return statusMessages[error.response.status] || ERROR_MESSAGES.SERVER_ERROR;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
};

/**
 * Get success message
 */
export const getSuccessMessage = (action) => {
  const actionMessages = {
    create: SUCCESS_MESSAGES.CREATED,
    update: SUCCESS_MESSAGES.UPDATED,
    delete: SUCCESS_MESSAGES.DELETED,
    save: SUCCESS_MESSAGES.SAVED,
    send: SUCCESS_MESSAGES.SENT,
    upload: SUCCESS_MESSAGES.UPLOADED,
    export: SUCCESS_MESSAGES.EXPORTED,
    import: SUCCESS_MESSAGES.IMPORTED
  };

  return actionMessages[action] || SUCCESS_MESSAGES.SAVED;
};

/**
 * Local storage helpers
 */
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  }
};

/**
 * Session storage helpers
 */
export const sessionStorage = {
  get: (key) => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      return null;
    }
  },

  set: (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  },

  remove: (key) => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  },

  clear: () => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      return false;
    }
  }
};

export default {
  formatDate,
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateText,
  capitalize,
  toTitleCase,
  generateRandomString,
  generateUUID,
  deepClone,
  deepMerge,
  debounce,
  throttle,
  sleep,
  retry,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidUsername,
  isValidURL,
  getFileExtension,
  formatFileSize,
  getStatusColor,
  getStatusIcon,
  calculatePagination,
  generatePaginationArray,
  sortArray,
  filterArray,
  groupBy,
  removeDuplicates,
  getNestedValue,
  setNestedValue,
  isEmpty,
  getErrorMessage,
  getSuccessMessage,
  storage,
  sessionStorage
};
