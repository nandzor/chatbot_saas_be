import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  RefreshCw,
  Save
} from 'lucide-react';

/**
 * Base modal component
 */
export const BaseModal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className = ''
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-lg';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className={`w-full ${getSizeClass()} max-h-[90vh] overflow-y-auto ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Confirmation modal
 */
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  className = ''
}) => {
  const getVariantIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
  };

  const getVariantButton = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      className={className}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          {getVariantIcon()}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={getVariantButton()}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Form modal
 */
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  fields = [],
  initialData = {},
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit?.(formData);
  };

  const renderField = (field) => {
    const commonProps = {
      id: field.key,
      value: formData[field.key] || '',
      onChange: (e) => handleInputChange(field.key, e.target.value),
      className: errors[field.key] ? 'border-red-500' : ''
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={`w-full px-3 py-2 border rounded-md resize-none ${commonProps.className}`}
          />
        );
      case 'select':
        return (
          <select
            {...commonProps}
            className={`w-full px-3 py-2 border rounded-md ${commonProps.className}`}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.key}
              checked={formData[field.key] || false}
              onChange={(e) => handleInputChange(field.key, e.target.checked)}
              className="rounded"
            />
            <Label htmlFor={field.key} className="text-sm">
              {field.label}
            </Label>
          </div>
        );
      default:
        return (
          <Input
            {...commonProps}
            type={field.type || 'text'}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="md"
      className={className}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            {field.type !== 'checkbox' && (
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            )}
            {renderField(field)}
            {errors[field.key] && (
              <p className="text-sm text-red-500">{errors[field.key]}</p>
            )}
          </div>
        ))}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};

/**
 * Delete confirmation modal
 */
export const DeleteModal = ({
  isOpen,
  onClose,
  onDelete,
  title = 'Delete Item',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName,
  loading = false,
  className = ''
}) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onDelete}
      title={title}
      description={description}
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      loading={loading}
      className={className}
    />
  );
};

/**
 * Success modal
 */
export const SuccessModal = ({
  isOpen,
  onClose,
  title = 'Success',
  description = 'Operation completed successfully.',
  actionText = 'OK',
  onAction,
  className = ''
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      className={className}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onAction || onClose}>
            {actionText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Error modal
 */
export const ErrorModal = ({
  isOpen,
  onClose,
  title = 'Error',
  description = 'An error occurred. Please try again.',
  error,
  onRetry,
  className = ''
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      className={className}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
            {error && (
              <p className="text-xs text-red-500 mt-1 font-mono">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Loading modal
 */
export const LoadingModal = ({
  isOpen,
  title = 'Loading',
  description = 'Please wait...',
  className = ''
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {}}
      title={title}
      description={description}
      size="sm"
      className={className}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </BaseModal>
  );
};

/**
 * Info modal
 */
export const InfoModal = ({
  isOpen,
  onClose,
  title = 'Information',
  description,
  children,
  className = ''
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="md"
      className={className}
    >
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="flex-1">
            {children}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export default {
  BaseModal,
  ConfirmationModal,
  FormModal,
  DeleteModal,
  SuccessModal,
  ErrorModal,
  LoadingModal,
  InfoModal
};
