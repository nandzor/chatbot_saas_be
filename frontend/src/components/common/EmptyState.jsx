import React from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * EmptyState Component
 * Provides consistent empty state displays with actions
 */
export const EmptyState = ({
  // Content
  title,
  description,
  icon: Icon,
  
  // Actions
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  
  // Styling
  variant = 'default',
  size = 'default',
  
  // Layout
  className = '',
  
  // Custom content
  children,
  
  // Additional props
  ...props
}) => {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-6',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
      spacing: 'space-y-3'
    },
    default: {
      container: 'p-8',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-4'
    },
    lg: {
      container: 'p-12',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-6'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-gray-50 border border-gray-200 rounded-lg',
      icon: 'text-gray-400',
      title: 'text-gray-900',
      description: 'text-gray-600'
    },
    minimal: {
      container: 'bg-transparent border-0',
      icon: 'text-gray-400',
      title: 'text-gray-900',
      description: 'text-gray-600'
    },
    elevated: {
      container: 'bg-white border border-gray-300 rounded-lg shadow-sm',
      icon: 'text-gray-400',
      title: 'text-gray-900',
      description: 'text-gray-600'
    }
  };

  const variantStyles = variantConfig[variant];

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-center',
        config.container,
        variantStyles.container,
        config.spacing,
        className
      )}
      {...props}
    >
      {/* Icon */}
      {Icon && (
        <div className={cn(config.icon, variantStyles.icon)}>
          <Icon className="w-full h-full" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-md">
        {title && (
          <h3 className={cn(
            'font-semibold',
            config.title,
            variantStyles.title
          )}>
            {title}
          </h3>
        )}
        
        {description && (
          <p className={cn(
            'mt-2',
            config.description,
            variantStyles.description
          )}>
            {description}
          </p>
        )}
      </div>

      {/* Custom content */}
      {children}

      {/* Actions */}
      {(actionText || secondaryActionText) && (
        <div className="flex items-center space-x-3">
          {actionText && (
            <Button
              onClick={onAction}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {actionText}
            </Button>
          )}
          
          {secondaryActionText && (
            <Button
              variant="outline"
              onClick={onSecondaryAction}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
