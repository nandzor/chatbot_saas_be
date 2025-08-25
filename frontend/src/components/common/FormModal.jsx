import React from 'react';
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';
import { FormField, FormSection } from './';
import { cn } from '@/lib/utils';

/**
 * Generic FormModal Component
 * Provides consistent form modals with validation and error handling
 */
export const FormModal = ({
  // Modal state
  isOpen,
  onClose,
  onSubmit,

  // Content
  title,
  description,
  icon: Icon,

  // Form configuration
  fields = [],
  initialData = {},
  validationRules = {},

  // Form state (from useForm hook)
  formData,
  errors,
  touched,
  isSubmitting,
  isValid,
  handleChange,
  handleBlur,
  handleSubmit,
  resetForm,

  // Actions
  submitText = 'Save',
  cancelText = 'Cancel',
  submitVariant = 'default',
  cancelVariant = 'outline',

  // Styling
  size = 'default',
  variant = 'default',

  // Layout
  sections = [],

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

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit(formData);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting && onClose) {
      resetForm();
      onClose();
    }
  };

  // Handle escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      handleClose();
    }
  };

  // Render fields
  const renderFields = () => {
    if (sections.length > 0) {
      return sections.map((section, index) => (
        <FormSection
          key={index}
          title={section.title}
          description={section.description}
          icon={section.icon}
          variant={section.variant || variant}
        >
          {section.fields.map((field, fieldIndex) => (
            <FormField
              key={fieldIndex}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors[field.name]}
              touched={touched[field.name]}
              disabled={isSubmitting}
            />
          ))}
        </FormSection>
      ));
    }

    return fields.map((field, index) => (
      <FormField
        key={index}
        {...field}
        value={formData[field.name]}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors[field.name]}
        touched={touched[field.name]}
        disabled={isSubmitting}
      />
    ));
  };

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

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {children || renderFields()}

          <DialogFooter className="flex justify-end space-x-3">
            <Button
              type="button"
              variant={cancelVariant}
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-w-[80px]"
            >
              {cancelText}
            </Button>
            <Button
              type="submit"
              variant={submitVariant}
              disabled={isSubmitting || !isValid}
              className="min-w-[80px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                submitText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;
