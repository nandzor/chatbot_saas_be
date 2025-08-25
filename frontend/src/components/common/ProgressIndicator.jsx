import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ProgressIndicator Component
 * Provides consistent progress displays
 */
export const ProgressIndicator = ({
  // Progress
  value = 0,
  max = 100,

  // Display
  showPercentage = true,
  showLabel = false,
  label,

  // Styling
  variant = 'default',
  size = 'default',

  // Behavior
  animated = true,
  striped = false,

  // Layout
  className = '',

  // Additional props
  ...props
}) => {

  // Calculate percentage
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'h-2',
      label: 'text-xs',
      percentage: 'text-xs'
    },
    default: {
      container: 'h-3',
      label: 'text-sm',
      percentage: 'text-sm'
    },
    lg: {
      container: 'h-4',
      label: 'text-base',
      percentage: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-gray-200',
      progress: 'bg-blue-600',
      label: 'text-gray-700',
      percentage: 'text-gray-600'
    },
    success: {
      container: 'bg-green-100',
      progress: 'bg-green-600',
      label: 'text-green-700',
      percentage: 'text-green-600'
    },
    warning: {
      container: 'bg-yellow-100',
      progress: 'bg-yellow-600',
      label: 'text-yellow-700',
      percentage: 'text-yellow-600'
    },
    error: {
      container: 'bg-red-100',
      progress: 'bg-red-600',
      label: 'text-red-700',
      percentage: 'text-red-600'
    }
  };

  const variantStyles = variantConfig[variant];

  // Animation classes
  const animationClasses = animated ? 'transition-all duration-300 ease-out' : '';
  const stripedClasses = striped ? 'bg-stripes bg-stripes-white bg-stripes-opacity-25' : '';

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {/* Label and percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between">
          {showLabel && (
            <span className={cn('font-medium', config.label, variantStyles.label)}>
              {label || `${value}/${max}`}
            </span>
          )}
          {showPercentage && (
            <span className={cn('font-medium', config.percentage, variantStyles.percentage)}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        config.container,
        variantStyles.container
      )}>
        <div
          className={cn(
            'h-full rounded-full',
            variantStyles.progress,
            stripedClasses,
            animationClasses
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
