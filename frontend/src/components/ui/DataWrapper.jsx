import { cn } from '@/lib/utils';

export const DataWrapper = ({
  children,
  className = '',
  size = 'default'
}) => {
  const sizeClasses = {
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg',
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
};

export const DataWrapperWithHeader = ({
  title,
  description,
  children,
  actions,
  className = '',
  size = 'default'
}) => {
  const sizeClasses = {
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const titleSizes = {
    sm: 'text-lg',
    default: 'text-xl',
    lg: 'text-2xl'
  };

  const descriptionSizes = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg',
      sizeClasses[size],
      className
    )}>
      {(title || description || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h3 className={cn(
                'font-semibold text-gray-900 mb-1',
                titleSizes[size]
              )}>
                {title}
              </h3>
            )}
            {description && (
              <p className={cn(
                'text-gray-600',
                descriptionSizes[size]
              )}>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default DataWrapper;
