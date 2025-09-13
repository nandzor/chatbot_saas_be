import { Card, CardContent, CardHeader } from '@/components/ui';
import { Skeleton } from '@/components/ui';
import { Button } from '@/components/ui';
import {
  Loader2
} from 'lucide-react';

/**
 * Basic loading spinner
 */
export const LoadingSpinner = ({
  size = 'default',
  className = '',
  text = 'Loading...'
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
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

/**
 * Page loading skeleton
 */
export const PageLoadingSkeleton = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>

    {/* Content skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

/**
 * Table loading skeleton
 */
export const TableLoadingSkeleton = ({
  rows = 5,
  columns = 4,
  className = ''
}) => (
  <div className={`space-y-4 ${className}`}>
    {/* Table header skeleton */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-6 flex-1" />
      ))}
    </div>

    {/* Table rows skeleton */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Card loading skeleton
 */
export const CardLoadingSkeleton = ({
  showHeader = true,
  showActions = false,
  className = ''
}) => (
  <Card className={className}>
    {showHeader && (
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
    )}
    <CardContent>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        {showActions && (
          <div className="flex space-x-2 pt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

/**
 * Dashboard loading skeleton
 */
export const DashboardLoadingSkeleton = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

/**
 * Form loading skeleton
 */
export const FormLoadingSkeleton = ({
  fields = 5,
  showSubmit = true,
  className = ''
}) => (
  <div className={`space-y-6 ${className}`}>
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    {showSubmit && (
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    )}
  </div>
);

/**
 * List loading skeleton
 */
export const ListLoadingSkeleton = ({
  items = 5,
  showAvatar = false,
  className = ''
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
        {showAvatar && <Skeleton className="h-10 w-10 rounded-full" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
    ))}
  </div>
);

/**
 * Chart loading skeleton
 */
export const ChartLoadingSkeleton = ({
  height = 300,
  showLegend = true,
  className = ''
}) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      {showLegend && (
        <div className="flex space-x-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      )}
    </div>
    <Skeleton className={`h-${height} w-full`} />
  </div>
);

/**
 * Modal loading skeleton
 */
export const ModalLoadingSkeleton = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    <div className="space-y-2">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

/**
 * Search loading skeleton
 */
export const SearchLoadingSkeleton = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <div className="flex space-x-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-20" />
    </div>
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2 border rounded">
          <Skeleton className="h-8 w-8" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Profile loading skeleton
 */
export const ProfileLoadingSkeleton = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    <div className="flex items-center space-x-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

/**
 * Notification loading skeleton
 */
export const NotificationLoadingSkeleton = ({ className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>
    ))}
  </div>
);

/**
 * Settings loading skeleton
 */
export const SettingsLoadingSkeleton = ({ className = '' }) => (
  <div className={`space-y-6 ${className}`}>
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Data table loading skeleton
 */
export const DataTableLoadingSkeleton = ({
  rows = 10,
  columns = 5,
  showPagination = true,
  className = ''
}) => (
  <div className={`space-y-4 ${className}`}>
    {/* Table header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-8 flex-1" />
      ))}
    </div>

    {/* Table rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-6 flex-1" />
        ))}
      </div>
    ))}

    {/* Pagination */}
    {showPagination && (
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    )}
  </div>
);

/**
 * Empty state with loading
 */
export const EmptyStateLoading = ({
  title = 'Loading...',
  description = 'Please wait while we load the data',
  icon: Icon = Loader2,
  className = ''
}) => (
  <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
    <Icon className="w-12 h-12 text-muted-foreground animate-spin mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-center max-w-md">{description}</p>
  </div>
);

/**
 * Loading overlay
 */
export const LoadingOverlay = ({
  loading = false,
  text = 'Loading...',
  className = ''
}) => {
  if (!loading) return null;

  return (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};

export default {
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
