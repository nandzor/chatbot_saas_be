/**
 * Application Configuration
 * Centralized configuration untuk aplikasi
 */

export const APP_CONFIG = {
  // App Info
  name: 'Chatbot SaaS',
  version: '1.0.0',
  description: 'AI-powered chatbot platform for businesses',

  // Environment
  environment: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    version: 'v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  // UI Configuration
  ui: {
    theme: {
      default: 'light',
      options: ['light', 'dark', 'system']
    },
    language: {
      default: 'en',
      options: ['en', 'id']
    },
    sidebar: {
      width: 256,
      collapsedWidth: 64
    },
    header: {
      height: 64
    },
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
      maxVisiblePages: 5
    }
  },

  // Feature Flags
  features: {
    realtimeUpdates: true,
    advancedFiltering: true,
    dataExport: true,
    dataImport: true,
    notifications: true,
    darkMode: true,
    multiLanguage: true,
    analytics: true,
    auditLogs: true
  },

  // Security
  security: {
    tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    passwordRequireSpecialChar: true
  },

  // Performance
  performance: {
    debounceDelay: 300,
    throttleDelay: 1000,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    maxCacheSize: 100,
    lazyLoadThreshold: 0.1
  },

  // Monitoring
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceTracking: true,
    enableUserTracking: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'debug'
  }
};

export default APP_CONFIG;
