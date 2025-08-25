import React from 'react';
import { Button } from './index';
import { cn } from '@/lib/utils';

export const PageHeader = ({
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
    sm: 'text-2xl',
    default: 'text-3xl',
    lg: 'text-4xl'
  };

  const descriptionSizes = {
    sm: 'text-base',
    default: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className={cn(
      'bg-white border border-gray-200 rounded-lg',
      sizeClasses[size],
      className
    )}>
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className={cn(
              'font-bold text-gray-900 mb-2',
              titleSizes[size]
            )}>
              {title}
            </h1>
            {description && (
              <p className={cn(
                'text-gray-600',
                descriptionSizes[size]
              )}>
                {description}
              </p>
            )}
          </div>
          {children && (
            <div className="flex items-center gap-3">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PageHeaderWithActions = ({
  title,
  description,
  primaryAction,
  secondaryActions = [],
  className = '',
  size = 'default'
}) => {
  return (
    <PageHeader
      title={title}
      description={description}
      className={className}
      size={size}
    >
      <div className="flex items-center gap-3">
        {secondaryActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size={action.size || 'sm'}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.className}
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.text}
          </Button>
        ))}

        {primaryAction && (
          <Button
            variant={primaryAction.variant || 'default'}
            size={primaryAction.size || 'sm'}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className={cn(
              'bg-blue-600 hover:bg-blue-700',
              primaryAction.className
            )}
          >
            {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
            {primaryAction.text}
          </Button>
        )}
      </div>
    </PageHeader>
  );
};

export default PageHeader;
