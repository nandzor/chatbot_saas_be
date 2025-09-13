/**
 * Generic Modal Component
 * Reusable modal component dengan berbagai konfigurasi
 */

import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Generic Modal Component
 */
export const GenericModal = ({
  // Modal state
  open = false,
  onClose,

  // Modal content
  title = '',
  description = '',
  children,

  // Modal type
  type = 'default', // default, confirm, alert, info, warning, error

  // Modal size
  size = 'default', // sm, default, lg, xl, full

  // Modal behavior
  closable = true,
  maskClosable = true,
  keyboard = true,

  // Actions
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmLoading = false,
  cancelLoading = false,

  // Styling
  className = '',
  contentClassName = '',

  // Callbacks
  onOpen,
  onAfterOpen,
  onAfterClose,

  ...props
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (keyboard && e.key === 'Escape' && open) {
        onClose?.();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      onOpen?.();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, keyboard, onClose, onOpen]);

  // Handle after open
  useEffect(() => {
    if (open) {
      onAfterOpen?.();
    }
  }, [open, onAfterOpen]);

  // Handle after close
  useEffect(() => {
    if (!open) {
      onAfterClose?.();
    }
  }, [open, onAfterClose]);

  // Get modal size classes
  const getSizeClasses = () => {
    const sizeClasses = {
      sm: 'max-w-sm',
      default: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4'
    };
    return sizeClasses[size] || sizeClasses.default;
  };

  // Get modal type icon
  const getTypeIcon = () => {
    const iconClasses = 'w-6 h-6';

    switch (type) {
      case 'confirm':
        return <AlertCircle className={`${iconClasses} text-blue-500`} />;
      case 'alert':
        return <AlertTriangle className={`${iconClasses} text-yellow-500`} />;
      case 'info':
        return <Info className={`${iconClasses} text-blue-500`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-yellow-500`} />;
      case 'error':
        return <AlertCircle className={`${iconClasses} text-red-500`} />;
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-500`} />;
      default:
        return null;
    }
  };

  // Get modal type colors
  const getTypeColors = () => {
    switch (type) {
      case 'confirm':
        return 'border-blue-200 bg-blue-50';
      case 'alert':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return '';
    }
  };

  // Handle mask click
  const handleMaskClick = (e) => {
    if (maskClosable && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    onConfirm?.();
  };

  // Handle cancel
  const handleCancel = () => {
    onCancel?.() || onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`${getSizeClasses()} ${className}`}
        onPointerDownOutside={maskClosable ? undefined : (e) => e.preventDefault()}
        {...props}
      >
        <DialogHeader>
          <div className="flex items-center space-x-3">
            {getTypeIcon()}
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">
                  {description}
                </DialogDescription>
              )}
            </div>
            {closable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className={`${contentClassName} ${getTypeColors()}`}>
          {children}
        </div>

        {(type === 'confirm' || type === 'alert' || type === 'warning' || type === 'error') && (
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Loading...' : cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={confirmLoading}
              variant={type === 'error' ? 'destructive' : 'default'}
            >
              {confirmLoading ? 'Loading...' : confirmText}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Confirm Modal
 */
export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmLoading = false,
  ...props
}) => {
  return (
    <GenericModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      type="confirm"
      {...props}
    />
  );
};

/**
 * Alert Modal
 */
export const AlertModal = ({
  open,
  onClose,
  title = 'Alert',
  description = 'Please check the information and try again.',
  confirmText = 'OK',
  ...props
}) => {
  return (
    <GenericModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      confirmText={confirmText}
      type="alert"
      {...props}
    />
  );
};

/**
 * Info Modal
 */
export const InfoModal = ({
  open,
  onClose,
  title = 'Information',
  description = '',
  children,
  ...props
}) => {
  return (
    <GenericModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      type="info"
      {...props}
    >
      {children}
    </GenericModal>
  );
};

/**
 * Warning Modal
 */
export const WarningModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Warning',
  description = 'This action cannot be undone.',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  confirmLoading = false,
  ...props
}) => {
  return (
    <GenericModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      type="warning"
      {...props}
    />
  );
};

/**
 * Error Modal
 */
export const ErrorModal = ({
  open,
  onClose,
  onRetry,
  title = 'Error',
  description = 'An error occurred. Please try again.',
  retryText = 'Retry',
  closeText = 'Close',
  retryLoading = false,
  ...props
}) => {
  return (
    <GenericModal
      open={open}
      onClose={onClose}
      onConfirm={onRetry}
      title={title}
      description={description}
      confirmText={retryText}
      cancelText={closeText}
      confirmLoading={retryLoading}
      type="error"
      {...props}
    />
  );
};

/**
 * Success Modal
 */
export const SuccessModal = ({
  open,
  onClose,
  title = 'Success',
  description = 'Operation completed successfully.',
  confirmText = 'OK',
  ...props
}) => {
  return (
    <GenericModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      confirmText={confirmText}
      type="success"
      {...props}
    />
  );
};

/**
 * Loading Modal
 */
export const LoadingModal = ({
  open,
  title = 'Loading',
  description = 'Please wait...',
  ...props
}) => {
  return (
    <GenericModal
      open={open}
      title={title}
      description={description}
      closable={false}
      maskClosable={false}
      keyboard={false}
      type="info"
      {...props}
    >
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </GenericModal>
  );
};

export default {
  GenericModal,
  ConfirmModal,
  AlertModal,
  InfoModal,
  WarningModal,
  ErrorModal,
  SuccessModal,
  LoadingModal
};
