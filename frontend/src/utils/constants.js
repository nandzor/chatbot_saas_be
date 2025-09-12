/**
 * Application Constants
 * Centralized constants untuk menghindari magic numbers dan strings
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  VERSION: 'v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORG_ADMIN: 'org_admin',
  ORG_USER: 'org_user',
  GUEST: 'guest'
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
};

// Organization Status
export const ORG_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  TRIAL: 'trial',
  EXPIRED: 'expired'
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  TRIAL: 'trial'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Chatbot Status
export const CHATBOT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TRAINING: 'training',
  ERROR: 'error'
};

// Conversation Status
export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  ENDED: 'ended',
  TRANSFERRED: 'transferred',
  ARCHIVED: 'archived'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_VISIBLE_PAGES: 5
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  ORGANIZATION: 'organization_data',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference'
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/me'
  },

  // Users
  USERS: {
    BASE: '/users',
    SEARCH: '/users/search',
    STATISTICS: '/users/statistics',
    CHECK_EMAIL: '/users/check-email',
    CHECK_USERNAME: '/users/check-username'
  },

  // Organizations
  ORGANIZATIONS: {
    BASE: '/organizations',
    ACTIVE: '/organizations/active',
    TRIAL: '/organizations/trial',
    STATISTICS: '/organizations/statistics',
    ANALYTICS: '/organizations/analytics',
    EXPORT: '/organizations/export'
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    BASE: '/subscriptions',
    STATISTICS: '/subscriptions/statistics',
    ANALYTICS: '/subscriptions/analytics',
    EXPORT: '/subscriptions/export'
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REALTIME: '/analytics/realtime',
    USAGE: '/analytics/usage',
    PERFORMANCE: '/analytics/performance',
    CONVERSATIONS: '/analytics/conversations',
    USERS: '/analytics/users',
    REVENUE: '/analytics/revenue'
  },

  // Chatbots
  CHATBOTS: {
    BASE: '/chatbots',
    STATISTICS: '/chatbots/statistics'
  },

  // Conversations
  CONVERSATIONS: {
    BASE: '/conversations',
    STATISTICS: '/conversations/statistics',
    HISTORY: '/conversations/history'
  }
};

// UI Constants
export const UI_CONSTANTS = {
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 300,
  SIDEBAR_WIDTH: 256,
  HEADER_HEIGHT: 64
};

// Chart Types
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  AREA: 'area',
  SCATTER: 'scatter',
  DONUT: 'donut',
  GAUGE: 'gauge',
  PROGRESS: 'progress'
};

// Table Actions
export const TABLE_ACTIONS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  CLONE: 'clone',
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
  SUSPEND: 'suspend',
  RESTORE: 'restore'
};

// File Types
export const FILE_TYPES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
  AUDIO: ['mp3', 'wav', 'ogg', 'm4a'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz']
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  INVALID_USERNAME: 'Username must be 3-20 characters and contain only letters, numbers and underscores',
  INVALID_URL: 'Please enter a valid URL',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created',
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  SAVED: 'Successfully saved',
  SENT: 'Successfully sent',
  UPLOADED: 'Successfully uploaded',
  EXPORTED: 'Successfully exported',
  IMPORTED: 'Successfully imported'
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Theme
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Languages
export const LANGUAGES = {
  EN: 'en',
  ID: 'id'
};

export default {
  API_CONFIG,
  HTTP_STATUS,
  USER_ROLES,
  USER_STATUS,
  ORG_STATUS,
  SUBSCRIPTION_STATUS,
  PAYMENT_STATUS,
  CHATBOT_STATUS,
  CONVERSATION_STATUS,
  NOTIFICATION_TYPES,
  PAGINATION,
  DATE_FORMATS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  UI_CONSTANTS,
  CHART_TYPES,
  TABLE_ACTIONS,
  FILE_TYPES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_STATES,
  THEME,
  LANGUAGES
};
