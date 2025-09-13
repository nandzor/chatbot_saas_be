/**
 * Loading States
 * Advanced loading state management untuk aplikasi frontend
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Button } from '@/components/ui';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Loading state types
 */
export const LOADING_TYPES = {
  INITIAL: 'initial',
  REFRESH: 'refresh',
  SUBMIT: 'submit',
  DELETE: 'delete',
  UPDATE: 'update',
  LOAD_MORE: 'load_more',
  SEARCH: 'search',
  EXPORT: 'export',
  IMPORT: 'import'
};

/**
 * Enhanced loading states hook
 */
export const useLoadingStates = (initialStates = {}) => {
  const [loadingStates, setLoadingStates] = useState({
    [LOADING_TYPES.INITIAL]: false,
    [LOADING_TYPES.REFRESH]: false,
    [LOADING_TYPES.SUBMIT]: false,
    [LOADING_TYPES.DELETE]: false,
    [LOADING_TYPES.UPDATE]: false,
    [LOADING_TYPES.LOAD_MORE]: false,
    [LOADING_TYPES.SEARCH]: false,
    [LOADING_TYPES.EXPORT]: false,
    [LOADING_TYPES.IMPORT]: false,
    ...initialStates
  });

  const timeoutsRef = useRef({});

  const setLoading = useCallback((type, isLoading, options = {}) => {
    const { timeout = null, onTimeout = null } = options;

    setLoadingStates(prev => ({
      ...prev,
      [type]: isLoading
    }));

    // Clear existing timeout for this type
    if (timeoutsRef.current[type]) {
      clearTimeout(timeoutsRef.current[type]);
      delete timeoutsRef.current[type];
    }

    // Set timeout if specified
    if (isLoading && timeout) {
      timeoutsRef.current[type] = setTimeout(() => {
        setLoadingStates(prev => ({
          ...prev,
          [type]: false
        }));

        if (onTimeout) onTimeout();
        delete timeoutsRef.current[type];
      }, timeout);
    }
  }, []);

  const setMultipleLoading = useCallback((states) => {
    setLoadingStates(prev => ({
      ...prev,
      ...states
    }));
  }, []);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const getLoadingState = useCallback((type) => {
    return loadingStates[type] || false;
  }, [loadingStates]);

  const clearAllLoading = useCallback(() => {
    // Clear all timeouts
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};

    setLoadingStates(prev => {
      const cleared = {};
      Object.keys(prev).forEach(key => {
        cleared[key] = false;
      });
      return cleared;
    });
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  return {
    loadingStates,
    setLoading,
    setMultipleLoading,
    isAnyLoading,
    getLoadingState,
    clearAllLoading,
    isLoading: (type) => getLoadingState(type)
  };
};

/**
 * Async operation wrapper with loading state
 */
export const useAsyncOperation = (operation, loadingType = LOADING_TYPES.INITIAL) => {
  const { setLoading, getLoadingState } = useLoadingStates();
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(loadingType, true);
      setError(null);

      const result = await operation(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(loadingType, false);
    }
  }, [operation, loadingType, setLoading]);

  return {
    execute,
    isLoading: getLoadingState(loadingType),
    error,
    data,
    reset: () => {
      setError(null);
      setData(null);
    }
  };
};

/**
 * Loading spinner components
 */
export const LoadingSpinner = ({
  size = 'default',
  className = '',
  text = 'Loading...',
  showText = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {showText && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
};

/**
 * Loading overlay component
 */
export const LoadingOverlay = ({
  isVisible,
  text = 'Loading...',
  className = '',
  backdrop = true
}) => {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      ${backdrop ? 'bg-black/20 backdrop-blur-sm' : ''}
      ${className}
    `}>
      <Card className="p-6">
        <CardContent className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" showText={false} />
          <p className="text-sm text-muted-foreground">{text}</p>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Button with loading state
 */
export const LoadingButton = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  disabled,
  className = '',
  variant = 'default',
  size = 'default',
  icon: Icon = null,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || isLoading}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
        </>
      )}
    </Button>
  );
};

/**
 * Skeleton loading components
 */
export const SkeletonCard = ({ className = '' }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </CardContent>
  </Card>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {/* Table header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>

    {/* Table rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-3 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonList = ({ items = 5, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Loading state wrapper component
 */
export const LoadingWrapper = ({
  isLoading,
  error,
  children,
  loadingComponent = null,
  errorComponent = null,
  onRetry = null,
  className = ''
}) => {
  if (isLoading) {
    return loadingComponent || (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return errorComponent || (
      <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-sm text-muted-foreground text-center">
          {error.message || 'Terjadi kesalahan'}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  return children;
};

export default {
  LOADING_TYPES,
  useLoadingStates,
  useAsyncOperation,
  LoadingSpinner,
  LoadingOverlay,
  LoadingButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  LoadingWrapper
};
