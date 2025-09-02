// Development Configuration
export const devConfig = {
  // Debug settings
  enableDebugLogs: true,
  enablePerformanceMonitoring: true,
  enableErrorTracking: true,

  // Development features
  enableHotReload: true,
  enableReactDevTools: true,
  enableWhyDidYouRender: false,

  // API settings
  apiBaseUrl: 'http://localhost:9000',
  apiTimeout: 10000,

  // Feature flags
  enableAnalytics: false,
  enableDebugPanel: true,

  // Logging
  logLevel: 'debug',
  enableConsoleGrouping: true,

  // Performance
  enableLazyLoading: false,
  enableCodeSplitting: true,

  // Error handling
  enableErrorBoundaries: true,
  enableErrorReporting: true,
  maxErrorRetries: 3
};

// Development utilities
export const devUtils = {
  // Debug logging
  log: (message, data = null, level = 'info') => {
    if (devConfig.enableDebugLogs) {
      const timestamp = new Date().toISOString();
      const prefix = `[DEV ${timestamp}]`;

      switch (level) {
        case 'error':
          console.error(prefix, message, data);
          break;
        case 'warn':
          console.warn(prefix, message, data);
          break;
        case 'debug':
          console.debug(prefix, message, data);
          break;
        default:
          console.log(prefix, message, data);
      }
    }
  },

  // Performance measurement
  measurePerformance: (name, fn) => {
    if (devConfig.enablePerformanceMonitoring) {
      const start = performance.now();
      const result = fn();
      const end = performance.now();
      console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`);
      return result;
    }
    return fn();
  },

  // Error tracking
  trackError: (error, context = {}) => {
    if (devConfig.enableErrorTracking) {
      console.group('🚨 Error Tracked');
      console.error('Error:', error);
      console.error('Context:', context);
      console.error('Stack:', error.stack);
      console.groupEnd();
    }
  }
};

export default devConfig;
