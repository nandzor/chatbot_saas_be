import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageContainer Component
 * Provides consistent page container layouts
 */
export const PageContainer = ({
  // Layout
  children,
  className = '',

  // Styling
  variant = 'default',
  size = 'default',
  padding = true,

  // Background
  background = 'default',

  // Max width
  maxWidth = 'default',

  // Spacing
  spacing = 'default',

  // Additional props
  ...props
}) => {

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'px-4 py-4',
      maxWidth: 'max-w-4xl',
      spacing: 'space-y-4'
    },
    default: {
      padding: 'px-6 py-6',
      maxWidth: 'max-w-7xl',
      spacing: 'space-y-6'
    },
    lg: {
      padding: 'px-8 py-8',
      maxWidth: 'max-w-full',
      spacing: 'space-y-8'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-white',
      background: 'bg-gray-50'
    },
    elevated: {
      container: 'bg-white shadow-sm',
      background: 'bg-gray-100'
    },
    minimal: {
      container: 'bg-transparent',
      background: 'bg-transparent'
    },
    card: {
      container: 'bg-white rounded-lg shadow-sm border border-gray-200',
      background: 'bg-gray-50'
    }
  };

  const variantStyles = variantConfig[variant];

  // Background configurations
  const backgroundConfig = {
    default: 'bg-gray-50',
    white: 'bg-white',
    transparent: 'bg-transparent',
    gradient: 'bg-gradient-to-br from-gray-50 to-gray-100'
  };

  const backgroundStyle = backgroundConfig[background];

  // Max width configurations
  const maxWidthConfig = {
    sm: 'max-w-2xl',
    default: config.maxWidth,
    lg: 'max-w-7xl',
    xl: 'max-w-full',
    none: 'max-w-none'
  };

  const maxWidthStyle = maxWidthConfig[maxWidth];

  // Spacing configurations
  const spacingConfig = {
    none: 'space-y-0',
    sm: 'space-y-2',
    default: config.spacing,
    lg: 'space-y-8',
    xl: 'space-y-12'
  };

  const spacingStyle = spacingConfig[spacing];

  return (
    <div
      className={cn(
        'min-h-screen',
        backgroundStyle,
        className
      )}
      {...props}
    >
      <div className={cn(
        'mx-auto',
        maxWidthStyle,
        padding && config.padding
      )}>
        <div className={cn(
          variantStyles.container,
          spacingStyle
        )}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;
