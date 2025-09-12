/**
 * Centralized Error Handler
 * Centralized error management untuk aplikasi
 */

import { HTTP_STATUS, ERROR_MESSAGES } from './constants';
import { getErrorMessage } from './helpers';

/**
 * Error types
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error class
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, code = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error handler class
 */
export class ErrorHandler {
  constructor() {
    this.errorListeners = [];
    this.errorHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Add error listener
   */
  addErrorListener(listener) {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  removeErrorListener(listener) {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Notify error listeners
   */
  notifyListeners(error) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (err) {
      }
    });
  }

  /**
   * Add error to history
   */
  addToHistory(error) {
    this.errorHistory.unshift(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop();
    }
  }

  /**
   * Get error history
   */
  getErrorHistory() {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHistory = [];
  }

  /**
   * Handle error
   */
  handle(error, context = {}) {
    const appError = this.normalizeError(error, context);

    // Add to history
    this.addToHistory(appError);

    // Notify listeners
    this.notifyListeners(appError);

    // Log error
    this.logError(appError);

    return appError;
  }

  /**
   * Normalize error
   */
  normalizeError(error, context = {}) {
    if (error instanceof AppError) {
      return error;
    }

    let type = ERROR_TYPES.UNKNOWN;
    let severity = ERROR_SEVERITY.MEDIUM;
    let message = error.message || 'An unknown error occurred';
    let code = null;
    let details = null;

    // Determine error type and severity based on error properties
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
          type = ERROR_TYPES.VALIDATION;
          severity = ERROR_SEVERITY.MEDIUM;
          message = data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
          details = data?.errors || null;
          break;
        case HTTP_STATUS.UNAUTHORIZED:
          type = ERROR_TYPES.AUTHENTICATION;
          severity = ERROR_SEVERITY.HIGH;
          message = data?.message || ERROR_MESSAGES.UNAUTHORIZED;
          break;
        case HTTP_STATUS.FORBIDDEN:
          type = ERROR_TYPES.AUTHORIZATION;
          severity = ERROR_SEVERITY.HIGH;
          message = data?.message || ERROR_MESSAGES.FORBIDDEN;
          break;
        case HTTP_STATUS.NOT_FOUND:
          type = ERROR_TYPES.NOT_FOUND;
          severity = ERROR_SEVERITY.MEDIUM;
          message = data?.message || ERROR_MESSAGES.NOT_FOUND;
          break;
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          type = ERROR_TYPES.SERVER;
          severity = ERROR_SEVERITY.HIGH;
          message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
          break;
        default:
          type = ERROR_TYPES.SERVER;
          severity = ERROR_SEVERITY.MEDIUM;
          message = data?.message || ERROR_MESSAGES.SERVER_ERROR;
      }

      code = data?.code || status;
    } else if (error.request) {
      type = ERROR_TYPES.NETWORK;
      severity = ERROR_SEVERITY.HIGH;
      message = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.name === 'ValidationError') {
      type = ERROR_TYPES.VALIDATION;
      severity = ERROR_SEVERITY.MEDIUM;
      message = error.message;
      details = error.details || null;
    } else if (error.name === 'TypeError') {
      type = ERROR_TYPES.CLIENT;
      severity = ERROR_SEVERITY.MEDIUM;
      message = error.message;
    }

    return new AppError(message, type, severity, code, details);
  }

  /**
   * Log error
   */
  logError(error) {
    const logData = {
      timestamp: error.timestamp,
      type: error.type,
      severity: error.severity,
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log to console based on severity
    switch (error.severity) {
      case ERROR_SEVERITY.CRITICAL:
        break;
      case ERROR_SEVERITY.HIGH:
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn('MEDIUM SEVERITY ERROR:', logData);
        break;
      case ERROR_SEVERITY.LOW:
        console.info('LOW SEVERITY ERROR:', logData);
        break;
      default:
    }

    // Send to external logging service if configured
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logData);
    }
  }

  /**
   * Send error to external logging service
   */
  sendToLoggingService(logData) {
    // Implement external logging service integration
    // e.g., Sentry, LogRocket, etc.
    try {
      // Example: Send to external service
      // fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logData)
      // });
    } catch (err) {
    }
  }

  /**
   * Create specific error types
   */
  createNetworkError(message = ERROR_MESSAGES.NETWORK_ERROR, details = null) {
    return new AppError(message, ERROR_TYPES.NETWORK, ERROR_SEVERITY.HIGH, 'NETWORK_ERROR', details);
  }

  createValidationError(message = ERROR_MESSAGES.VALIDATION_ERROR, details = null) {
    return new AppError(message, ERROR_TYPES.VALIDATION, ERROR_SEVERITY.MEDIUM, 'VALIDATION_ERROR', details);
  }

  createAuthenticationError(message = ERROR_MESSAGES.UNAUTHORIZED, details = null) {
    return new AppError(message, ERROR_TYPES.AUTHENTICATION, ERROR_SEVERITY.HIGH, 'AUTHENTICATION_ERROR', details);
  }

  createAuthorizationError(message = ERROR_MESSAGES.FORBIDDEN, details = null) {
    return new AppError(message, ERROR_TYPES.AUTHORIZATION, ERROR_SEVERITY.HIGH, 'AUTHORIZATION_ERROR', details);
  }

  createNotFoundError(message = ERROR_MESSAGES.NOT_FOUND, details = null) {
    return new AppError(message, ERROR_TYPES.NOT_FOUND, ERROR_SEVERITY.MEDIUM, 'NOT_FOUND_ERROR', details);
  }

  createServerError(message = ERROR_MESSAGES.SERVER_ERROR, details = null) {
    return new AppError(message, ERROR_TYPES.SERVER, ERROR_SEVERITY.HIGH, 'SERVER_ERROR', details);
  }

  createClientError(message, details = null) {
    return new AppError(message, ERROR_TYPES.CLIENT, ERROR_SEVERITY.MEDIUM, 'CLIENT_ERROR', details);
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = new ErrorHandler();

/**
 * Error boundary component
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const appError = errorHandler.normalizeError(error, { errorInfo });
    errorHandler.handle(appError, { component: this.constructor.name });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error context
 */
export const ErrorContext = React.createContext({
  error: null,
  setError: () => {},
  clearError: () => {}
});

/**
 * Error provider
 */
export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const handleError = (error) => {
    const appError = errorHandler.handle(error);
    setError(appError);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ error, setError: handleError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * Use error hook
 */
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

/**
 * Error interceptor for axios
 */
export const errorInterceptor = (error) => {
  const appError = errorHandler.handle(error);
  return Promise.reject(appError);
};

/**
 * Global error handlers
 */
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handle(event.reason, { type: 'unhandledrejection' });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorHandler.handle(event.error, { type: 'uncaught' });
  });

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      errorHandler.handle(
        new Error(`Failed to load resource: ${event.target.src || event.target.href}`),
        { type: 'resource', element: event.target }
      );
    }
  }, true);
};

export default {
  ERROR_TYPES,
  ERROR_SEVERITY,
  AppError,
  ErrorHandler,
  errorHandler,
  ErrorBoundary,
  ErrorContext,
  ErrorProvider,
  useError,
  errorInterceptor,
  setupGlobalErrorHandlers
};
