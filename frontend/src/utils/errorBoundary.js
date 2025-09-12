/**
 * Error Boundary Utilities
 * Utilities untuk menangani error boundary dan error handling
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

/**
 * Error Boundary Class Component
 * Menangani error yang terjadi di dalam komponen React
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.group(`🚨 Frontend Error [${errorId}]`);
    console.groupEnd();

    // Log to external service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    }

    this.setState({
      error: error,
      errorInfo: errorInfo,
      errorId: errorId
    });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, retryCount } = this.state;
      const { fallback: Fallback, onError, showDetails = false } = this.props;

      // Call custom error handler if provided
      if (onError) {
        onError(error, errorInfo, errorId);
      }

      // Use custom fallback if provided
      if (Fallback) {
        return <Fallback error={error} errorInfo={errorInfo} errorId={errorId} onRetry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>

              {errorId && (
                <p className="text-xs text-gray-400 mb-4">
                  Error ID: {errorId}
                </p>
              )}

              {retryCount > 0 && (
                <p className="text-xs text-yellow-600 mb-4">
                  Retry attempt: {retryCount}
                </p>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                  variant="outline"
                >
                  Refresh Page
                </Button>

                <div className="flex space-x-2">
                  <Button
                    onClick={this.handleGoBack}
                    className="flex-1"
                    variant="outline"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>

                  <Button
                    onClick={this.handleGoHome}
                    className="flex-1"
                    variant="outline"
                    size="sm"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </div>
              </div>

              {showDetails && import.meta.env.DEV && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Show Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div><strong>Error:</strong> {error?.toString()}</div>
                    <div><strong>Stack:</strong> {errorInfo?.componentStack}</div>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary HOC
 * Higher-order component untuk menambahkan error boundary ke komponen
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

/**
 * Error Handler Hook
 * Hook untuk menangani error di dalam komponen
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error, errorInfo = null) => {
    setError({ error, errorInfo, timestamp: Date.now() });
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};

/**
 * Error Display Component
 * Komponen untuk menampilkan error dengan styling yang konsisten
 */
export const ErrorDisplay = ({
  error,
  title = "An error occurred",
  description = "Something went wrong. Please try again.",
  onRetry,
  onDismiss,
  showDetails = false,
  className = ""
}) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {description}

        {showDetails && import.meta.env.DEV && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm">
              Show Error Details
            </summary>
            <div className="mt-2 p-2 bg-red-50 rounded text-xs font-mono text-red-800 overflow-auto max-h-32">
              <div><strong>Error:</strong> {error.error?.toString()}</div>
              {error.errorInfo && (
                <div><strong>Stack:</strong> {error.errorInfo.componentStack}</div>
              )}
              <div><strong>Time:</strong> {new Date(error.timestamp).toLocaleString()}</div>
            </div>
          </details>
        )}
      </AlertDescription>

      {(onRetry || onDismiss) && (
        <div className="mt-3 flex space-x-2">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              size="sm"
              variant="outline"
            >
              Dismiss
            </Button>
          )}
        </div>
      )}
    </Alert>
  );
};

export default ErrorBoundary;
