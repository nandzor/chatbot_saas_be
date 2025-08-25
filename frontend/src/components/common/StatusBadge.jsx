import React from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * StatusBadge Component
 * Provides consistent status badge displays
 */
export const StatusBadge = ({
  // Status
  status,
  value,
  
  // Configuration
  statusConfig = {},
  
  // Styling
  variant = 'default',
  size = 'default',
  
  // Behavior
  showIcon = true,
  
  // Layout
  className = '',
  
  // Additional props
  ...props
}) => {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      badge: 'text-xs px-2 py-1',
      icon: 'w-3 h-3'
    },
    default: {
      badge: 'text-sm px-2.5 py-1',
      icon: 'w-4 h-4'
    },
    lg: {
      badge: 'text-base px-3 py-1.5',
      icon: 'w-5 h-5'
    }
  };

  const config = sizeConfig[size];

  // Default status configurations
  const defaultStatusConfig = {
    // Success states
    success: {
      label: 'Success',
      variant: 'success',
      icon: '✓'
    },
    active: {
      label: 'Active',
      variant: 'success',
      icon: '✓'
    },
    completed: {
      label: 'Completed',
      variant: 'success',
      icon: '✓'
    },
    approved: {
      label: 'Approved',
      variant: 'success',
      icon: '✓'
    },
    
    // Warning states
    warning: {
      label: 'Warning',
      variant: 'warning',
      icon: '⚠'
    },
    pending: {
      label: 'Pending',
      variant: 'warning',
      icon: '⏳'
    },
    processing: {
      label: 'Processing',
      variant: 'warning',
      icon: '⏳'
    },
    draft: {
      label: 'Draft',
      variant: 'warning',
      icon: '📝'
    },
    
    // Error states
    error: {
      label: 'Error',
      variant: 'destructive',
      icon: '✗'
    },
    failed: {
      label: 'Failed',
      variant: 'destructive',
      icon: '✗'
    },
    inactive: {
      label: 'Inactive',
      variant: 'destructive',
      icon: '✗'
    },
    rejected: {
      label: 'Rejected',
      variant: 'destructive',
      icon: '✗'
    },
    
    // Info states
    info: {
      label: 'Info',
      variant: 'default',
      icon: 'ℹ'
    },
    new: {
      label: 'New',
      variant: 'default',
      icon: '🆕'
    },
    updated: {
      label: 'Updated',
      variant: 'default',
      icon: '🔄'
    },
    
    // Neutral states
    default: {
      label: 'Default',
      variant: 'secondary',
      icon: '•'
    },
    unknown: {
      label: 'Unknown',
      variant: 'secondary',
      icon: '?'
    }
  };

  // Merge default config with custom config
  const mergedConfig = { ...defaultStatusConfig, ...statusConfig };
  
  // Get status configuration
  const statusValue = status || value;
  const statusInfo = mergedConfig[statusValue] || mergedConfig.default;

  return (
    <Badge
      variant={statusInfo.variant}
      className={cn(
        'inline-flex items-center space-x-1',
        config.badge,
        className
      )}
      {...props}
    >
      {showIcon && statusInfo.icon && (
        <span className={cn('inline-block', config.icon)}>
          {statusInfo.icon}
        </span>
      )}
      <span>{statusInfo.label}</span>
    </Badge>
  );
};

export default StatusBadge;
