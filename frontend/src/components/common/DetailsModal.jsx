import React from 'react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Badge, Separator } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * Generic DetailsModal Component
 * Provides consistent details viewing modals
 */
export const DetailsModal = ({
  // Modal state
  isOpen,
  onClose,

  // Content
  title,
  description,
  icon: Icon,

  // Data
  data = {},
  fields = [],
  sections = [],

  // Actions
  actions = [],
  primaryAction,
  secondaryAction,

  // Styling
  size = 'default',
  variant = 'default',

  // State
  loading = false,
  error = null,

  // Custom content
  children,

  // Additional props
  ...props
}) => {

  // Size configurations
  const sizeConfig = {
    sm: {
      maxWidth: 'max-w-sm',
      padding: 'p-4'
    },
    default: {
      maxWidth: 'max-w-md',
      padding: 'p-6'
    },
    lg: {
      maxWidth: 'max-w-lg',
      padding: 'p-6'
    },
    xl: {
      maxWidth: 'max-w-xl',
      padding: 'p-6'
    },
    '2xl': {
      maxWidth: 'max-w-2xl',
      padding: 'p-6'
    }
  };

  const config = sizeConfig[size];

  // Handle close
  const handleClose = () => {
    if (!loading && onClose) {
      onClose();
    }
  };

  // Handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !loading) {
      handleClose();
    }
  };

  // Render field value
  const renderFieldValue = (field) => {
    const value = data[field.key];

    if (field.render) {
      return field.render(value, data);
    }

    switch (field.type) {
      case 'badge':
        return (
          <Badge variant={field.variant || 'default'}>
            {value || field.defaultValue || 'N/A'}
          </Badge>
        );

      case 'status':
        const statusConfig = field.statusConfig?.[value] || {};
        return (
          <Badge variant={statusConfig.variant || 'default'}>
            {statusConfig.label || value || 'N/A'}
          </Badge>
        );

      case 'boolean':
        return (
          <Badge variant={value ? 'success' : 'secondary'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );

      case 'date':
        return value ? new Date(value).toLocaleDateString() : 'N/A';

      case 'datetime':
        return value ? new Date(value).toLocaleString() : 'N/A';

      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value || 'N/A';

      case 'currency':
        return typeof value === 'number' ? `$${value.toFixed(2)}` : value || 'N/A';

      case 'percentage':
        return typeof value === 'number' ? `${value}%` : value || 'N/A';

      case 'text':
      default:
        return value || field.defaultValue || 'N/A';
    }
  };

  // Render fields
  const renderFields = () => {
    if (sections.length > 0) {
      return sections.map((section, index) => (
        <div key={index} className="space-y-4">
          {section.title && (
            <div className="flex items-center space-x-2">
              {section.icon && <section.icon className="w-4 h-4 text-gray-500" />}
              <h3 className="text-sm font-medium text-gray-900">{section.title}</h3>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="space-y-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {field.label}
                </label>
                <div className="text-sm text-gray-900">
                  {renderFieldValue(field)}
                </div>
              </div>
            ))}
          </div>
          {index < sections.length - 1 && <Separator />}
        </div>
      ));
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <div key={index} className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {field.label}
            </label>
            <div className="text-sm text-gray-900">
              {renderFieldValue(field)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose} {...props}>
        <DialogContent className={cn(config.maxWidth, 'max-h-[90vh] overflow-y-auto')}>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              {Icon && <Icon className="w-6 h-6 text-gray-400 animate-pulse" />}
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                {description && (
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose} {...props}>
        <DialogContent className={cn(config.maxWidth, 'max-h-[90vh] overflow-y-auto')}>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              {Icon && <Icon className="w-6 h-6 text-red-500" />}
              <div>
                <DialogTitle className="text-lg font-semibold text-red-900">
                  {title || 'Error'}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-red-700 mt-1">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} {...props}>
      <DialogContent
        className={cn(config.maxWidth, 'max-h-[90vh] overflow-y-auto')}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-6 h-6 text-gray-500" />}
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-gray-600 mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {children || renderFields()}
        </div>

        {(actions.length > 0 || primaryAction || secondaryAction) && (
          <DialogFooter className="flex justify-end space-x-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                disabled={action.disabled || loading}
                className="min-w-[80px]"
              >
                {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                {action.label}
              </Button>
            ))}

            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outline'}
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled || loading}
                className="min-w-[80px]"
              >
                {secondaryAction.icon && <secondaryAction.icon className="w-4 h-4 mr-2" />}
                {secondaryAction.label}
              </Button>
            )}

            {primaryAction && (
              <Button
                variant={primaryAction.variant || 'default'}
                onClick={primaryAction.onClick}
                disabled={primaryAction.disabled || loading}
                className="min-w-[80px]"
              >
                {primaryAction.icon && <primaryAction.icon className="w-4 h-4 mr-2" />}
                {primaryAction.label}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailsModal;
