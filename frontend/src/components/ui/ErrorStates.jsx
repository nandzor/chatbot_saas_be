import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  AlertCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Home,
  ArrowLeft,
  Server,
  WifiOff,
  Clock,
  Zap,
  Settings,
  Shield,
  Key,
  Lock,
  MessageCircle,
  X as XIcon
} from 'lucide-react';

/**
 * Basic error alert
 */
export const ErrorAlert = ({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  className = ''
}) => (
  <Alert variant="destructive" className={className}>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription className="mt-2">
      {message}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="ml-4"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="ml-2"
        >
          <XIcon className="w-4 h-4" />
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

/**
 * Network error state
 */
export const NetworkErrorState = ({
  onRetry,
  onGoHome,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <WifiOff className="w-16 h-16 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      Unable to connect to the server. Please check your internet connection and try again.
    </p>
    <div className="flex space-x-2">
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
      {onGoHome && (
        <Button variant="outline" onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      )}
    </div>
  </div>
);

/**
 * Server error state
 */
export const ServerErrorState = ({
  error,
  onRetry,
  onReport,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <Server className="w-16 h-16 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Server Error</h3>
    <p className="text-muted-foreground text-center max-w-md mb-4">
      Something went wrong on our end. We're working to fix it.
    </p>
    {error && (
      <div className="bg-muted p-4 rounded-lg mb-6 max-w-md">
        <code className="text-sm text-muted-foreground">
          {error.message || 'Unknown error'}
        </code>
      </div>
    )}
    <div className="flex space-x-2">
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
      {onReport && (
        <Button variant="outline" onClick={onReport}>
          <AlertCircle className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      )}
    </div>
  </div>
);

/**
 * Not found error state
 */
export const NotFoundErrorState = ({
  title = 'Page Not Found',
  description = 'The page you are looking for does not exist.',
  onGoBack,
  onGoHome,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      {description}
    </p>
    <div className="flex space-x-2">
      {onGoBack && (
        <Button variant="outline" onClick={onGoBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      )}
      {onGoHome && (
        <Button onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      )}
    </div>
  </div>
);

/**
 * Unauthorized error state
 */
export const UnauthorizedErrorState = ({
  onLogin,
  onGoHome,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <Shield className="w-16 h-16 text-yellow-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      You don't have permission to access this resource. Please log in with the correct account.
    </p>
    <div className="flex space-x-2">
      {onLogin && (
        <Button onClick={onLogin}>
          <Key className="w-4 h-4 mr-2" />
          Log In
        </Button>
      )}
      {onGoHome && (
        <Button variant="outline" onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      )}
    </div>
  </div>
);

/**
 * Forbidden error state
 */
export const ForbiddenErrorState = ({
  onGoHome,
  onContactSupport,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <Lock className="w-16 h-16 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Access Forbidden</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      You don't have the necessary permissions to access this resource.
    </p>
    <div className="flex space-x-2">
      {onGoHome && (
        <Button onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      )}
      {onContactSupport && (
        <Button variant="outline" onClick={onContactSupport}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      )}
    </div>
  </div>
);

/**
 * Validation error state
 */
export const ValidationErrorState = ({
  errors = [],
  onRetry,
  className = ''
}) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center space-x-2">
      <AlertTriangle className="w-5 h-5 text-yellow-500" />
      <h3 className="text-lg font-semibold">Validation Error</h3>
    </div>
    <div className="space-y-2">
      {errors.map((error, index) => (
        <div key={index} className="flex items-start space-x-2">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
          <span className="text-sm text-muted-foreground">{error}</span>
        </div>
      ))}
    </div>
    {onRetry && (
      <Button onClick={onRetry} className="mt-4">
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    )}
  </div>
);

/**
 * Timeout error state
 */
export const TimeoutErrorState = ({
  onRetry,
  onGoHome,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <Clock className="w-16 h-16 text-yellow-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Request Timeout</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      The request took too long to complete. Please try again.
    </p>
    <div className="flex space-x-2">
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
      {onGoHome && (
        <Button variant="outline" onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      )}
    </div>
  </div>
);

/**
 * Rate limit error state
 */
export const RateLimitErrorState = ({
  retryAfter,
  onRetry,
  onGoHome,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <Zap className="w-16 h-16 text-yellow-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Rate Limit Exceeded</h3>
    <p className="text-muted-foreground text-center max-w-md mb-4">
      You've made too many requests. Please wait before trying again.
    </p>
    {retryAfter && (
      <div className="bg-muted p-3 rounded-lg mb-6">
        <p className="text-sm text-muted-foreground">
          Try again in {retryAfter} seconds
        </p>
      </div>
    )}
    <div className="flex space-x-2">
      {onRetry && (
        <Button onClick={onRetry} disabled={retryAfter > 0}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
      {onGoHome && (
        <Button variant="outline" onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      )}
    </div>
  </div>
);

/**
 * Maintenance error state
 */
export const MaintenanceErrorState = ({
  estimatedTime,
  onRefresh,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <Settings className="w-16 h-16 text-blue-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Under Maintenance</h3>
    <p className="text-muted-foreground text-center max-w-md mb-4">
      We're currently performing scheduled maintenance. We'll be back soon!
    </p>
    {estimatedTime && (
      <div className="bg-muted p-3 rounded-lg mb-6">
        <p className="text-sm text-muted-foreground">
          Estimated completion: {estimatedTime}
        </p>
      </div>
    )}
    {onRefresh && (
      <Button onClick={onRefresh}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Check Again
      </Button>
    )}
  </div>
);

/**
 * Generic error state
 */
export const GenericErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  onGoHome,
  onReport,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-center max-w-md mb-4">
      {message}
    </p>
    {error && (
      <div className="bg-muted p-4 rounded-lg mb-6 max-w-md">
        <code className="text-sm text-muted-foreground">
          {error.message || 'Unknown error'}
        </code>
      </div>
    )}
    <div className="flex space-x-2">
      {onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
      {onGoHome && (
        <Button variant="outline" onClick={onGoHome}>
          <Home className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      )}
      {onReport && (
        <Button variant="outline" onClick={onReport}>
          <AlertCircle className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      )}
    </div>
  </div>
);

/**
 * Error boundary fallback
 */
export const ErrorBoundaryFallback = ({
  error,
  onReset,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <XCircle className="w-16 h-16 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
    <p className="text-muted-foreground text-center max-w-md mb-6">
      An unexpected error occurred. Please refresh the page or contact support if the problem persists.
    </p>
    {error && (
      <div className="bg-muted p-4 rounded-lg mb-6 max-w-md">
        <code className="text-sm text-muted-foreground">
          {error.message}
        </code>
      </div>
    )}
    <div className="flex space-x-2">
      {onReset && (
        <Button onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      )}
      <Button variant="outline" onClick={() => window.location.reload()}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh Page
      </Button>
    </div>
  </div>
);

/**
 * Error card
 */
export const ErrorCard = ({
  title,
  message,
  error,
  onRetry,
  onDismiss,
  className = ''
}) => (
  <Card className={`border-red-200 bg-red-50 ${className}`}>
    <CardHeader>
      <div className="flex items-center space-x-2">
        <XCircle className="w-5 h-5 text-red-500" />
        <CardTitle className="text-red-800">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-red-700 mb-4">
        {message}
      </CardDescription>
      {error && (
        <div className="bg-red-100 p-3 rounded-lg mb-4">
          <code className="text-sm text-red-800">
            {error.message || 'Unknown error'}
          </code>
        </div>
      )}
      <div className="flex space-x-2">
        {onRetry && (
          <Button size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button size="sm" variant="outline" onClick={onDismiss}>
            <XIcon className="w-4 h-4 mr-2" />
            Dismiss
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

/**
 * Error toast
 */
export const ErrorToast = ({
  message,
  onDismiss,
  className = ''
}) => (
  <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
    <div className="flex items-start space-x-3">
      <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-800">{message}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0"
        >
          <XIcon className="w-4 h-4" />
        </Button>
      )}
    </div>
  </div>
);

export default {
  ErrorAlert,
  NetworkErrorState,
  ServerErrorState,
  NotFoundErrorState,
  UnauthorizedErrorState,
  ForbiddenErrorState,
  ValidationErrorState,
  TimeoutErrorState,
  RateLimitErrorState,
  MaintenanceErrorState,
  GenericErrorState,
  ErrorBoundaryFallback,
  ErrorCard,
  ErrorToast
};
