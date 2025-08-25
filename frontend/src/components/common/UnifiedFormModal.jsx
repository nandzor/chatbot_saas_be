import React from 'react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';
import { FormField } from './FormField';
import { cn } from '@/lib/utils';

/**
 * UnifiedFormModal Component
 * Handles both create and edit operations in a single modal
 */
export const UnifiedFormModal = ({
  // Modal state
  isOpen,
  onClose,

  // Operation type
  mode = 'create', // 'create' | 'edit'

  // Form handlers
  onSubmit,
  formData,
  errors,
  touched,
  isSubmitting,
  isValid,
  handleChange,
  handleBlur,
  resetForm,

  // Configuration
  title,
  description,
  icon: Icon,
  fields = [],
  validationRules = {},

  // UI
  submitText,
  cancelText = 'Cancel',
  submitVariant = 'default',
  cancelVariant = 'outline',
  size = 'default',
  variant = 'default',

  // Additional props
  children,
  ...props
}) => {

  // Size configurations
  const sizeConfig = {
    sm: {
      dialog: 'max-w-md',
      content: 'p-4',
      header: 'pb-3',
      footer: 'pt-3'
    },
    default: {
      dialog: 'max-w-lg',
      content: 'p-6',
      header: 'pb-4',
      footer: 'pt-4'
    },
    lg: {
      dialog: 'max-w-2xl',
      content: 'p-8',
      header: 'pb-6',
      footer: 'pt-6'
    },
    xl: {
      dialog: 'max-w-4xl',
      content: 'p-10',
      header: 'pb-8',
      footer: 'pt-8'
    }
  };

  const config = sizeConfig[size];

  // Dynamic configuration based on mode
  const modalConfig = {
    create: {
      title: title || 'Create New Item',
      description: description || 'Create a new item with the form below',
      submitText: submitText || 'Create',
      submitVariant: 'default'
    },
    edit: {
      title: title || 'Edit Item',
      description: description || 'Update item information and settings',
      submitText: submitText || 'Update',
      submitVariant: 'default'
    }
  };

  const currentConfig = modalConfig[mode];

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isValid && !isSubmitting) {
      await onSubmit(formData);
    }
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Render form fields
  const renderFields = () => {
    return fields.map((field, index) => (
      <FormField
        key={field.name || index}
        {...field}
        value={formData[field.name] || ''}
        onChange={(value) => handleChange(field.name, value)}
        onBlur={() => handleBlur(field.name)}
        error={errors[field.name]}
        touched={touched[field.name]}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'sm:max-w-md',
          config.dialog,
          config.content
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <DialogHeader className={config.header}>
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
            )}
            <div>
              <DialogTitle className="text-lg font-semibold">
                {currentConfig.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {currentConfig.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {renderFields()}
          {children}
        </form>

        <DialogFooter className={cn('flex space-x-2', config.footer)}>
          <Button
            type="button"
            variant={cancelVariant}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant={submitVariant}
            onClick={handleFormSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : currentConfig.submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedFormModal;
