import { cn } from '@/lib/utils';

export const LoadingSpinner = ({
  size = 'default',
  variant = 'default',
  text = '',
  className = '',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    default: 'text-blue-600',
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600'
  };

  const spinner = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      fullScreen && 'min-h-screen',
      className
    )}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-current',
        sizeClasses[size],
        variantClasses[variant]
      )} />
      {text && (
        <p className="mt-3 text-sm text-gray-600 text-center max-w-xs">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
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
      <LoadingSpinner size="lg" className="mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600">
        {description}
      </p>
    </div>
  );
};

export default LoadingSpinner;
