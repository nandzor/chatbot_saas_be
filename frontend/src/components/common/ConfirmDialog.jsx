import React from 'react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';
import { AlertTriangle, Trash2, X, CheckCircle, Info, AlertCircle } from 'lucide-react';

/**
 * ConfirmDialog Component
 * Provides consistent confirmation dialogs with different variants
 */
export const ConfirmDialog = ({
  // Dialog state
  isOpen,
  onClose,
  onConfirm,

  // Content
  title = 'Confirm Action',
  description,
  message,

  // Variants
  variant = 'default', // default, destructive, warning, info, success

  // Actions
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'default',
  cancelVariant = 'outline',

  // State
  loading = false,
  disabled = false,

  // Styling
  size = 'default',

  // Custom content
  children,

  // Additional props
  ...props
}) => {

  // Variant configurations
  const variantConfig = {
    default: {
      icon: Info,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    destructive: {
      icon: Trash2,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      maxWidth: 'max-w-sm',
      iconSize: 'w-8 h-8'
    },
    default: {
      maxWidth: 'max-w-md',
      iconSize: 'w-10 h-10'
    },
    lg: {
      maxWidth: 'max-w-lg',
      iconSize: 'w-12 h-12'
    },
    xl: {
      maxWidth: 'max-w-xl',
      iconSize: 'w-14 h-14'
    }
  };

  const sizeStyles = sizeConfig[size];

  // Handle confirm
  const handleConfirm = () => {
    if (!loading && !disabled && onConfirm) {
      onConfirm();
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} {...props}>
      <DialogContent
        className={`${sizeStyles.maxWidth} ${config.bgColor} ${config.borderColor} border-2`}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`${config.iconColor} ${sizeStyles.iconSize} p-2 rounded-full ${config.bgColor}`}>
              <Icon className="w-full h-full" />
            </div>
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {title}
          </DialogTitle>
          {(description || message) && (
            <DialogDescription className="text-gray-600 mt-2">
              {description || message}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <DialogFooter className="flex justify-end space-x-3">
          <Button
            variant={cancelVariant}
            onClick={handleClose}
            disabled={loading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading || disabled}
            className="min-w-[80px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
