import React from 'react';
import { cn } from '@/lib/utils';

export const DataSection = ({
  title,
  description,
  children,
  className = '',
  size = 'default'
}) => {
  const sizeClasses = {
    sm: 'mb-4',
    default: 'mb-6',
    lg: 'mb-8'
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
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200">
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
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export const DataSectionWithActions = ({
  title,
  description,
  children,
  actions,
  className = '',
  size = 'default'
}) => {
  return (
    <DataSection
      title={title}
      description={description}
      className={className}
      size={size}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          {title && (
            <h3 className="font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-gray-600">
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
      {children}
    </DataSection>
  );
};

export default DataSection;
