/**
 * Error Handler
 * Advanced error handling patterns untuk aplikasi frontend
 */

import React from 'react';
import { toast } from 'react-hot-toast';

/**
 * Error types classification
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
};

/**
 * Classify error based on error object or response
 */
export const classifyError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;

  // Network errors
  if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
    return ERROR_TYPES.NETWORK;
  }

  // HTTP status based classification
  if (error.response?.status) {
    const status = error.response.status;

    if (status === 401) return ERROR_TYPES.AUTHENTICATION;
    if (status === 403) return ERROR_TYPES.AUTHORIZATION;
    if (status === 404) return ERROR_TYPES.NOT_FOUND;
    if (status >= 400 && status < 500) return ERROR_TYPES.CLIENT;
    if (status >= 500) return ERROR_TYPES.SERVER;
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.type === 'validation') {
    return ERROR_TYPES.VALIDATION;
  }

  return ERROR_TYPES.UNKNOWN;
};

/**
 * Get user-friendly error message based on error type
 */
export const getErrorMessage = (error, errorType = null) => {
  const type = errorType || classifyError(error);

  const messages = {
    [ERROR_TYPES.NETWORK]: 'Koneksi internet bermasalah. Silakan coba lagi.',
    [ERROR_TYPES.VALIDATION]: 'Data yang dimasukkan tidak valid. Silakan periksa kembali.',
    [ERROR_TYPES.AUTHENTICATION]: 'Sesi Anda telah berakhir. Silakan login kembali.',
    [ERROR_TYPES.AUTHORIZATION]: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
    [ERROR_TYPES.NOT_FOUND]: 'Data yang diminta tidak ditemukan.',
    [ERROR_TYPES.SERVER]: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    [ERROR_TYPES.CLIENT]: 'Terjadi kesalahan. Silakan periksa data Anda.',
    [ERROR_TYPES.UNKNOWN]: 'Terjadi kesalahan yang tidak diketahui.'
  };

  // Try to get specific message from error object
  const specificMessage = error?.response?.data?.message ||
                          error?.message ||
                          error?.data?.message;

  return specificMessage || messages[type] || messages[ERROR_TYPES.UNKNOWN];
};

/**
 * Enhanced error handler with different strategies
 */
export const handleError = (error, options = {}) => {
  const {
    showToast = true,
    logError = true,
    onError = null,
    context = 'Unknown',
    silent = false
  } = options;

  const errorType = classifyError(error);
  const message = getErrorMessage(error, errorType);

  // Log error for debugging
  if (logError && import.meta.env.DEV) {
    console.group(`🚨 Error in ${context}`);
    console.log('Type:', errorType);
    console.log('Message:', message);
    console.log('Original Error:', error);
    console.groupEnd();
  }

  // Show toast notification
  if (showToast && !silent) {
    const toastOptions = {
      duration: 5000,
      id: `error-${Date.now()}` // Prevent duplicate toasts
    };

    switch (errorType) {
      case ERROR_TYPES.NETWORK:
        toast.error(message, { ...toastOptions, icon: '🌐' });
        break;
      case ERROR_TYPES.AUTHENTICATION:
        toast.error(message, { ...toastOptions, icon: '🔐' });
        break;
      case ERROR_TYPES.AUTHORIZATION:
        toast.error(message, { ...toastOptions, icon: '🚫' });
        break;
      case ERROR_TYPES.VALIDATION:
        toast.error(message, { ...toastOptions, icon: '⚠️' });
        break;
      default:
        toast.error(message, toastOptions);
    }
  }

  // Custom error handler
  if (onError && typeof onError === 'function') {
    onError(error, errorType, message);
  }

  return {
    type: errorType,
    message,
    originalError: error
  };
};

/**
 * React component error handler wrapper
 */
export const withErrorHandling = (Component, options = {}) => {
  const WrappedComponent = (props) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      handleError(error, {
        context: Component.displayName || Component.name || 'Anonymous Component',
        ...options
      });

      // Return error fallback UI
      return (
        <div className="flex items-center justify-center p-8 text-red-600">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Something went wrong</p>
            <p className="text-sm">Please try refreshing the page</p>
          </div>
        </div>
      );
    }
  };

  WrappedComponent.displayName = `withErrorHandling(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};

/**
 * Async function error handler wrapper
 */
export const withAsyncErrorHandling = (asyncFn, options = {}) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, {
        context: asyncFn.name || 'Anonymous Function',
        ...options
      });
      throw error; // Re-throw to allow caller to handle if needed
    }
  };
};

/**
 * React error boundary hook
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = () => setError(null);

  const captureError = (error, context = 'Component') => {
    setError(error);
    handleError(error, { context });
  };

  return {
    error,
    resetError,
    captureError,
    hasError: error !== null
  };
};

/**
 * Service error handler specifically for API calls
 */
export const handleServiceError = (error, serviceName = 'API') => {
  return handleError(error, {
    context: `${serviceName} Service`,
    logError: true,
    showToast: true
  });
};

/**
 * Form validation error handler
 */
export const handleValidationError = (error, showToast = false) => {
  return handleError(error, {
    context: 'Form Validation',
    showToast,
    logError: false // Don't log validation errors
  });
};

/**
 * Global error handler for uncaught errors
 */
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, {
      context: 'Unhandled Promise Rejection',
      showToast: true
    });
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    handleError(event.error, {
      context: 'JavaScript Error',
      showToast: true
    });
  });
};

// Legacy functions for backward compatibility
export const handleApiError = handleError;
export const handleNetworkError = (error) => handleError(error, { context: 'Network' });
export const handleAuthError = (error) => handleError(error, { context: 'Authentication' });

export default {
  ERROR_TYPES,
  classifyError,
  getErrorMessage,
  handleError,
  withErrorHandling,
  useErrorHandler,
  handleServiceError,
  handleValidationError,
  setupGlobalErrorHandler,
  // Legacy exports
  handleApiError,
  handleNetworkError,
  handleAuthError
};
