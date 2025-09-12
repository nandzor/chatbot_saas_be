/**
 * Loading States Utilities
 * Utilities untuk menangani loading states dan skeleton loading
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

/**
 * Loading States Hook
 * Hook untuk menangani loading states
 */
export const useLoadingStates = (initialState = {}) => {
  const [loadingStates, setLoadingStates] = React.useState({
    isLoading: false,
    isRefreshing: false,
    isSubmitting: false,
    isDeleting: false,
    isUpdating: false,
    ...initialState
  });

  const setLoading = React.useCallback((key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const setMultipleLoading = React.useCallback((states) => {
    setLoadingStates(prev => ({
      ...prev,
      ...states
    }));
  }, []);

  const clearLoading = React.useCallback(() => {
    setLoadingStates(prev => {
      const cleared = {};
      Object.keys(prev).forEach(key => {
        cleared[key] = false;
      });
      return cleared;
    });
  }, []);

  return {
    loadingStates,
    setLoading,
    setMultipleLoading,
    clearLoading
  };
};

/**
 * Loading Spinner Component
 * Komponen spinner loading yang dapat digunakan di mana saja
 */
export const LoadingSpinner = ({
  size = 'default',
  className = '',
  text = 'Loading...',
  showText = true
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {showText && text && (
        <span className="ml-2 text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
};

/**
 * Page Loading Skeleton
 * Skeleton loading untuk halaman penuh
 */
export const PageLoadingSkeleton = ({
  title = 'Loading...',
  description = 'Please wait while we load the content',
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-center pt-4">
            <LoadingSpinner size="lg" text={title} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Table Loading Skeleton
 * Skeleton loading untuk tabel
 */
export const TableLoadingSkeleton = ({
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header skeleton */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Card Loading Skeleton
 * Skeleton loading untuk kartu
 */
export const CardLoadingSkeleton = ({
  title = true,
  description = true,
  content = true,
  actions = true,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        {title && <Skeleton className="h-6 w-3/4" />}
        {description && <Skeleton className="h-4 w-1/2 mt-2" />}
      </CardHeader>
      {content && (
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      )}
      {actions && (
        <div className="p-6 pt-0 flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      )}
    </Card>
  );
};

/**
 * Dashboard Loading Skeleton
 * Skeleton loading untuk dashboard
 */
export const DashboardLoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardLoadingSkeleton key={index} />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardLoadingSkeleton />
        <CardLoadingSkeleton />
      </div>

      {/* Table skeleton */}
      <CardLoadingSkeleton />
    </div>
  );
};

/**
 * Form Loading Skeleton
 * Skeleton loading untuk form
 */
export const FormLoadingSkeleton = ({
  fields = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};

/**
 * List Loading Skeleton
 * Skeleton loading untuk daftar
 */
export const ListLoadingSkeleton = ({
  items = 5,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Chart Loading Skeleton
 * Skeleton loading untuk chart
 */
export const ChartLoadingSkeleton = ({
  height = 300,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex items-end space-x-2" style={{ height: `${height}px` }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            className="flex-1"
            style={{
              height: `${Math.random() * 80 + 20}%`
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Modal Loading Skeleton
 * Skeleton loading untuk modal
 */
export const ModalLoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-end space-x-2 pt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

/**
 * Search Loading Skeleton
 * Skeleton loading untuk pencarian
 */
export const SearchLoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
};

/**
 * Profile Loading Skeleton
 * Skeleton loading untuk profil
 */
export const ProfileLoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Notification Loading Skeleton
 * Skeleton loading untuk notifikasi
 */
export const NotificationLoadingSkeleton = ({
  items = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Settings Loading Skeleton
 * Skeleton loading untuk pengaturan
 */
export const SettingsLoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, itemIndex) => (
              <div key={itemIndex} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Data Table Loading Skeleton
 * Skeleton loading untuk data table
 */
export const DataTableLoadingSkeleton = ({
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and filters skeleton */}
      <div className="flex space-x-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table header skeleton */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>

      {/* Table rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}

      {/* Pagination skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

/**
 * Empty State Loading
 * Loading state untuk empty state
 */
export const EmptyStateLoading = ({
  title = 'Loading...',
  description = 'Please wait while we load the content',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <LoadingSpinner size="xl" text={title} />
      {description && (
        <p className="mt-4 text-sm text-muted-foreground text-center max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
};

/**
 * Loading Overlay
 * Overlay loading yang dapat digunakan di atas konten
 */
export const LoadingOverlay = ({
  isLoading = false,
  text = 'Loading...',
  className = ''
}) => {
  if (!isLoading) return null;

  return (
    <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

export default {
  useLoadingStates,
  LoadingSpinner,
  PageLoadingSkeleton,
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  DashboardLoadingSkeleton,
  FormLoadingSkeleton,
  ListLoadingSkeleton,
  ChartLoadingSkeleton,
  ModalLoadingSkeleton,
  SearchLoadingSkeleton,
  ProfileLoadingSkeleton,
  NotificationLoadingSkeleton,
  SettingsLoadingSkeleton,
  DataTableLoadingSkeleton,
  EmptyStateLoading,
  LoadingOverlay
};
