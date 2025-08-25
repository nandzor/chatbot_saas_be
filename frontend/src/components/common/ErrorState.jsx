import React from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * ErrorState Component
 * Provides consistent error state displays with retry actions
 */
export const ErrorState = ({
  // Content
  title,
  description,
  error,
  icon: Icon,
  
  // Actions
  retryText = 'Try Again',
  onRetry,
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
      container: 'bg-red-50 border border-red-200 rounded-lg',
      icon: 'text-red-500',
      title: 'text-red-900',
      description: 'text-red-700'
    },
    minimal: {
      container: 'bg-transparent border-0',
      icon: 'text-red-500',
      title: 'text-red-900',
      description: 'text-red-700'
    },
    elevated: {
      container: 'bg-white border border-red-300 rounded-lg shadow-sm',
      icon: 'text-red-500',
      title: 'text-red-900',
      description: 'text-red-700'
    }
  };

  const variantStyles = variantConfig[variant];

  // Default icon if none provided
  const DefaultIcon = () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  const ErrorIcon = Icon || DefaultIcon;

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
      {/* Error Icon */}
      <div className={cn(config.icon, variantStyles.icon)}>
        <ErrorIcon />
      </div>

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
        
        {(description || error) && (
          <p className={cn(
            'mt-2',
            config.description,
            variantStyles.description
          )}>
            {description || error}
          </p>
        )}
      </div>

      {/* Custom content */}
      {children}

      {/* Actions */}
      {(retryText || actionText || secondaryActionText) && (
        <div className="flex items-center space-x-3">
          {retryText && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {retryText}
            </Button>
          )}
          
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

export default ErrorState;
