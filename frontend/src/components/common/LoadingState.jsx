import React from 'react';
import { cn } from '@/lib/utils';

/**
 * LoadingState Component
 * Provides consistent loading state displays
 */
export const LoadingState = ({
  // Content
  title,
  description,
  icon: Icon,
  
  // Styling
  variant = 'default',
  size = 'default',
  
  // Layout
  className = '',
  
  // Custom content
  children,
  
  // Skeleton configuration
  skeletonRows = 3,
  skeletonColumns = 1,
  
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
      spacing: 'space-y-3',
      skeleton: 'h-4'
    },
    default: {
      container: 'p-8',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
      spacing: 'space-y-4',
      skeleton: 'h-5'
    },
    lg: {
      container: 'p-12',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg',
      spacing: 'space-y-6',
      skeleton: 'h-6'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-gray-50 border border-gray-200 rounded-lg',
      icon: 'text-gray-400',
      title: 'text-gray-900',
      description: 'text-gray-600',
      skeleton: 'bg-gray-200'
    },
    minimal: {
      container: 'bg-transparent border-0',
      icon: 'text-gray-400',
      title: 'text-gray-900',
      description: 'text-gray-600',
      skeleton: 'bg-gray-200'
    },
    elevated: {
      container: 'bg-white border border-gray-300 rounded-lg shadow-sm',
      icon: 'text-gray-400',
      title: 'text-gray-900',
      description: 'text-gray-600',
      skeleton: 'bg-gray-200'
    }
  };

  const variantStyles = variantConfig[variant];

  // Render skeleton rows
  const renderSkeletonRows = () => {
    return Array.from({ length: skeletonRows }, (_, rowIndex) => (
      <div key={rowIndex} className="space-y-2">
        {Array.from({ length: skeletonColumns }, (_, colIndex) => (
          <div
            key={colIndex}
            className={cn(
              'rounded animate-pulse',
              config.skeleton,
              variantStyles.skeleton,
              colIndex === 0 ? 'w-1/4' : 'w-3/4'
            )}
          />
        ))}
      </div>
    ));
  };

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
      {/* Loading Icon */}
      {Icon && (
        <div className={cn(config.icon, variantStyles.icon)}>
          <Icon className="w-full h-full animate-spin" />
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

      {/* Skeleton loading */}
      {!children && (
        <div className="w-full max-w-md space-y-4">
          {renderSkeletonRows()}
        </div>
      )}
    </div>
  );
};

export default LoadingState;
