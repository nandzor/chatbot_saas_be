import { LoadingState, ErrorMessage, EmptyState } from './index';

export const DataDisplay = ({
  data = [],
  loading = false,
  error = null,
  children,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display at the moment.',
  emptyActionText,
  onEmptyAction,
  emptyActionVariant = 'default',
  errorVariant = 'error',
  loadingSize = 'default',
  className = '',
  showEmptyState = true
}) => {
  // Loading state
  if (loading && data.length === 0) {
    return (
      <LoadingState
        loading={true}
        size={loadingSize}
        className={className}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        variant={errorVariant}
        className={className}
      />
    );
  }

  // Empty state
  if (showEmptyState && data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={emptyActionText}
        onAction={onEmptyAction}
        actionVariant={emptyActionVariant}
        className={className}
      />
    );
  }

  // Data display
  return children;
};

export const DataDisplayWithFallback = ({
  data = [],
  loading = false,
  error = null,
  children,
  fallback,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display at the moment.',
  emptyActionText,
  onEmptyAction,
  emptyActionVariant = 'default',
  errorVariant = 'error',
  loadingSize = 'default',
  className = ''
}) => {
  // Loading state
  if (loading && data.length === 0) {
    return fallback || (
      <LoadingState
        loading={true}
        size={loadingSize}
        className={className}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        error={error}
        variant={errorVariant}
        className={className}
      />
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={emptyActionText}
        onAction={onEmptyAction}
        actionVariant={emptyActionVariant}
        className={className}
      />
    );
  }

  // Data display
  return children;
};

export default DataDisplay;
