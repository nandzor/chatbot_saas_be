import React from 'react';
import { Button, Badge, Separator } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * BulkActions Component
 * Provides consistent bulk action layouts for selected items
 */
export const BulkActions = ({
  // Selection state
  selectedCount = 0,
  totalCount = 0,
  
  // Actions
  actions = [],
  primaryAction,
  secondaryAction,
  
  // Layout
  children,
  className = '',
  
  // Styling
  variant = 'default',
  size = 'default',
  
  // Behavior
  showCount = true,
  showSelectAll = false,
  onSelectAll,
  onClearSelection,
  
  // Additional props
  ...props
}) => {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-3',
      button: 'sm',
      spacing: 'space-x-2',
      badge: 'text-xs'
    },
    default: {
      container: 'p-4',
      button: 'default',
      spacing: 'space-x-3',
      badge: 'text-sm'
    },
    lg: {
      container: 'p-6',
      button: 'lg',
      spacing: 'space-x-4',
      badge: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'bg-blue-50 border border-blue-200 rounded-lg',
      separator: 'bg-blue-200'
    },
    minimal: {
      container: 'bg-gray-50 border border-gray-200 rounded-lg',
      separator: 'bg-gray-200'
    },
    elevated: {
      container: 'bg-white border border-blue-300 rounded-lg shadow-sm',
      separator: 'bg-blue-300'
    }
  };

  const variantStyles = variantConfig[variant];

  // Don't render if no selection
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        'flex items-center justify-between',
        config.container,
        variantStyles.container,
        className
      )}
      {...props}
    >
      {/* Left side - Selection info and actions */}
      <div className={cn('flex items-center', config.spacing)}>
        {/* Selection count */}
        {showCount && (
          <div className="flex items-center space-x-2">
            <Badge variant="default" className={config.badge}>
              {selectedCount} selected
            </Badge>
            {totalCount > 0 && (
              <span className="text-sm text-gray-600">
                of {totalCount} total
              </span>
            )}
          </div>
        )}

        {/* Select all option */}
        {showSelectAll && totalCount > selectedCount && (
          <Button
            variant="outline"
            size={config.button}
            onClick={onSelectAll}
            className="text-sm"
          >
            Select All ({totalCount})
          </Button>
        )}

        {/* Clear selection */}
        {onClearSelection && (
          <Button
            variant="ghost"
            size={config.button}
            onClick={onClearSelection}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Selection
          </Button>
        )}

        {children}
      </div>

      {/* Right side - Bulk actions */}
      <div className={cn('flex items-center', config.spacing)}>
        {/* Custom actions */}
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

        {/* Secondary action */}
        {secondaryAction && (
          <Button
            variant={secondaryAction.variant || 'outline'}
            size={secondaryAction.size || config.button}
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
            className={secondaryAction.className}
          >
            {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 mr-2" />}
            {secondaryAction.label}
          </Button>
        )}

        {/* Primary action */}
        {primaryAction && (
          <Button
            variant={primaryAction.variant || 'default'}
            size={primaryAction.size || config.button}
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className={primaryAction.className}
          >
            {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
            {primaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BulkActions;
