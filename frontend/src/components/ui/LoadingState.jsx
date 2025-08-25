import React from 'react';
import { cn } from '@/lib/utils';

export const LoadingState = ({
  loading = false,
  children,
  fallback,
  className = '',
  size = 'default'
}) => {
  if (!loading) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div className={cn(
      'flex items-center justify-center',
      className
    )}>
      <div className="flex flex-col items-center">
        <div className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-current',
          size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
        )} />
        <p className="mt-3 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export const LoadingSkeleton = ({
  rows = 5,
  columns = 4,
  className = ''
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-gray-200 rounded animate-pulse flex-1"
              style={{
                animationDelay: `${(rowIndex + colIndex) * 0.1}s`
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const LoadingCard = ({
  title = 'Loading...',
  description = 'Please wait while we fetch the data',
  className = ''
}) => {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 p-6 text-center',
      className
    )}>
      <div className="animate-spin rounded-full border-2 border-gray-300 border-t-current w-8 h-8 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default LoadingState;
