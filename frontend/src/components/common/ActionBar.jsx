import React from 'react';
import { Button, Separator } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * ActionBar Component
 * Provides consistent action button layouts
 */
export const ActionBar = ({
  // Actions
  primaryActions = [],
  secondaryActions = [],
  actions = [],
  
  // Layout
  children,
  className = '',
  
  // Styling
  variant = 'default',
  size = 'default',
  
  // Behavior
  sticky = false,
  collapsible = false,
  
  // Additional props
  ...props
}) => {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-3',
      button: 'sm',
      spacing: 'space-x-2'
    },
    default: {
      container: 'p-4',
      button: 'default',
      spacing: 'space-x-3'
    },
    lg: {
      container: 'p-6',
      button: 'lg',
      spacing: 'space-x-4'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
      separator: 'bg-gray-200'
    },
    minimal: {
      container: 'bg-transparent border-0 shadow-none',
      separator: 'bg-gray-200'
    },
    elevated: {
      container: 'bg-white border border-gray-300 rounded-lg shadow-md',
      separator: 'bg-gray-300'
    }
  };

  const variantStyles = variantConfig[variant];

  // Sticky positioning
  const stickyClasses = sticky ? 'sticky top-0 z-10' : '';

  return (
    <div 
      className={cn(
        'flex items-center justify-between',
        config.container,
        variantStyles.container,
        stickyClasses,
        className
      )}
      {...props}
    >
      {/* Left side - Primary actions */}
      <div className={cn('flex items-center', config.spacing)}>
        {primaryActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            size={action.size || config.button}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.className}
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        ))}
        
        {children}
      </div>

      {/* Right side - Secondary actions */}
      <div className={cn('flex items-center', config.spacing)}>
        {secondaryActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size={action.size || config.button}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.className}
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        ))}
        
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'outline'}
            size={action.size || config.button}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.className}
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ActionBar;
