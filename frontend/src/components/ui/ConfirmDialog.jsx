import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './index';
import { cn } from '@/lib/utils';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // 'warning' | 'danger' | 'info' | 'success'
  loading = false,
  className = '',
  size = 'default'
}) => {
  if (!isOpen) return null;

  const variantConfig = {
    warning: {
      icon: AlertTriangle,
      iconClass: 'text-yellow-600',
      bgClass: 'bg-yellow-100',
      buttonVariant: 'default'
    },
    danger: {
      icon: AlertCircle,
      iconClass: 'text-red-600',
      bgClass: 'bg-red-100',
      buttonVariant: 'destructive'
    },
    info: {
      icon: Info,
      iconClass: 'text-blue-600',
      bgClass: 'bg-blue-100',
      buttonVariant: 'default'
    },
    success: {
      icon: CheckCircle,
      iconClass: 'text-green-600',
      bgClass: 'bg-green-100',
      buttonVariant: 'default'
    }
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'max-w-sm',
    default: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={cn(
        'bg-white rounded-lg shadow-xl w-full',
        sizeClasses[size],
        className
      )}>
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className={cn('p-2 rounded-lg', config.bgClass)}>
            <Icon className={cn('w-6 h-6', config.iconClass)} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            size="sm"
          >
            {cancelText}
          </Button>

          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={loading}
            size="sm"
            className="min-w-[80px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'item',
  loading = false,
  className = ''
}) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemType}`}
      message={`Are you sure you want to delete the ${itemType} "${itemName}"? This action cannot be undone.`}
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
      loading={loading}
      className={className}
    />
  );
};

export default ConfirmDialog;
