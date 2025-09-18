/**
 * Form
 * Form component dengan semua optimizations dan best practices
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  useDebounce,
  withPerformanceOptimization
} from '@/utils/performanceOptimization';
import {
  AccessibleFormField,
  useAnnouncement,
  useFocusManagement
} from '@/utils/accessibilityUtils';
import {
  LoadingButton
} from '@/utils/loadingStates';
import {
  handleValidationError
} from '@/utils/errorHandler';
import {
  validateInput,
  sanitizeInput,
  useSecureForm,
  useRateLimit
} from '@/utils/securityUtils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Button } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  AlertCircle,
  CheckCircle,
  Save,
  RefreshCw
} from 'lucide-react';

const Form = ({
  title,
  description,
  fields = [],
  onSubmit,
  onReset = null,
  initialValues = {},
  validationRules = {},
  submitText = 'Submit',
  resetText = 'Reset',
  showProgress = true,
  autoSave = false,
  autoSaveDelay = 2000,
  maxAttempts = 5,
  className = ''
}) => {
  const [values, setValues] = useState(initialValues);

  // Update values when initialValues change
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);

  const formRef = useRef(null);
  const { focusRef, setFocus } = useFocusManagement();
  const { announce } = useAnnouncement();
  const { submitSecurely } = useSecureForm();
  const { isAllowed: canSubmit, getRemainingTime, resetAttempts } = useRateLimit(maxAttempts, 60000);

  // Debounced values for auto-save
  const debouncedValues = useDebounce(values, autoSaveDelay);

  // Helper function to get nested value
  const getNestedValue = useCallback((obj, path) => {
    const value = path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);

    // Convert null/undefined to empty string for form inputs
    return value === null || value === undefined ? '' : value;
  }, []);

  // Helper function to set nested value
  const setNestedValue = useCallback((obj, path, value) => {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    // Convert empty string to null for storage, but keep empty string for form inputs
    current[keys[keys.length - 1]] = value === '' ? null : value;
    return result;
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (autoSave && Object.keys(debouncedValues).length > 0 && lastSaved !== null) {
      handleAutoSave();
    }
  }, [debouncedValues, autoSave]);

  // Validate single field
  const validateField = useCallback((fieldName, value) => {
    const field = fields.find(f => f.name === fieldName);
    const rules = validationRules[fieldName] || {};
    const fieldErrors = [];

    // Get the actual value (handle nested paths)
    const actualValue = typeof value === 'string' ? value : getNestedValue(values, fieldName);

    // Required validation
    if (rules.required && (!actualValue || actualValue.toString().trim() === '')) {
      fieldErrors.push(`${field?.label || fieldName} is required`);
    }

    if (actualValue && actualValue.toString().trim() !== '') {
      // Type-specific validation
      switch (field?.type) {
        case 'email':
          if (!validateInput.email(actualValue)) {
            fieldErrors.push('Please enter a valid email address');
          }
          break;
        case 'password':
          if (!validateInput.password(actualValue)) {
            fieldErrors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
          }
          break;
        case 'tel':
          if (!validateInput.phoneNumber(actualValue)) {
            fieldErrors.push('Please enter a valid phone number');
          }
          break;
        case 'url':
          if (!validateInput.url(actualValue)) {
            fieldErrors.push('Please enter a valid URL');
          }
          break;
      }

      // Length validation
      if (rules.minLength && actualValue.length < rules.minLength) {
        fieldErrors.push(`Minimum length is ${rules.minLength} characters`);
      }

      if (rules.maxLength && actualValue.length > rules.maxLength) {
        fieldErrors.push(`Maximum length is ${rules.maxLength} characters`);
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(actualValue)) {
        fieldErrors.push(rules.patternMessage || 'Invalid format');
      }

      // Custom validation
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(actualValue, values);
        if (customError) {
          fieldErrors.push(customError);
        }
      }

      // Security validation
      if (!validateInput.noScriptTags(actualValue)) {
        fieldErrors.push('Invalid characters detected');
      }
    }

    return fieldErrors;
  }, [fields, validationRules, values]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const fieldValue = getNestedValue(values, field.name);
      const fieldErrors = validateField(field.name, fieldValue);
      if (fieldErrors.length > 0) {
        newErrors[field.name] = fieldErrors[0]; // Show first error only
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, values, validateField, getNestedValue]);

  // Handle field change
  const handleFieldChange = useCallback((fieldName, value) => {
    // Convert null/undefined to empty string for form inputs
    const cleanValue = value === null || value === undefined ? '' : value;
    const sanitizedValue = typeof cleanValue === 'string' ? sanitizeInput(cleanValue) : cleanValue;

    setValues(prev => setNestedValue(prev, fieldName, sanitizedValue));

    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validate field if it's been touched
    if (touched[fieldName]) {
      const fieldErrors = validateField(fieldName, sanitizedValue);
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors.length > 0 ? fieldErrors[0] : undefined
      }));
    }
  }, [touched, validateField, setNestedValue]);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    const fieldErrors = validateField(fieldName, values[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors.length > 0 ? fieldErrors[0] : undefined
    }));
  }, [values, validateField]);

  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    try {
      if (onSubmit && typeof onSubmit === 'function') {
        await onSubmit(values, { autoSave: true });
        setLastSaved(new Date());
        announce('Form auto-saved successfully');
      }
    } catch (error) {
      handleValidationError(error, false);
    }
  }, [values, onSubmit, announce]);

  // Form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate form first before checking rate limiting
    if (!validateForm()) {
      announce('Please fix the errors in the form');
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.focus();
        }
      }
      return;
    }

    // Skip rate limiting for development
    // if (!canSubmit()) {
    //   const remainingTime = Math.ceil(getRemainingTime() / 1000);
    //   announce(`Too many attempts. Please wait ${remainingTime} seconds before trying again.`);
    //   return;
    // }

    setIsSubmitting(true);
    setSubmitAttempts(prev => prev + 1);

    try {
      await onSubmit(values, { autoSave: false });
      announce('Form submitted successfully');
      setLastSaved(new Date());
      // Reset rate limiting on successful submission
      resetAttempts();
    } catch (error) {
      handleValidationError(error, true);
      announce('Form submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, errors, canSubmit, getRemainingTime, values, onSubmit, announce, resetAttempts]);

  // Form reset
  const handleReset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitAttempts(0);
    setLastSaved(null);

    if (onReset) {
      onReset();
    }

    announce('Form reset');
    setFocus();
  }, [initialValues, onReset, announce, setFocus]);

  // Calculate form progress
  const formProgress = useMemo(() => {
    if (!showProgress) return 0;

    const requiredFields = fields.filter(field => validationRules[field.name]?.required);
    const completedFields = requiredFields.filter(field => {
      const value = getNestedValue(values, field.name);
      return value && value.toString().trim() !== '';
    });

    return requiredFields.length > 0 ? (completedFields.length / requiredFields.length) * 100 : 0;
  }, [fields, values, validationRules, showProgress, getNestedValue]);

  // Render field
  const renderField = useCallback((field) => {
    const fieldError = errors[field.name];
    const fieldValue = getNestedValue(values, field.name);

    const commonProps = {
      name: field.name,
      value: fieldValue,
      onChange: (e) => handleFieldChange(field.name, e.target.value),
      onBlur: () => handleFieldBlur(field.name),
      disabled: field.disabled || isSubmitting,
      placeholder: field.placeholder,
      'aria-describedby': field.description ? `${field.name}-description` : undefined
    };

    let fieldElement;

    switch (field.type) {
      case 'textarea':
        fieldElement = (
          <Textarea
            {...commonProps}
            rows={field.rows || 3}
            className="resize-none"
          />
        );
        break;
      case 'select':
        fieldElement = (
          <select
            {...commonProps}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        break;
      default:
        fieldElement = (
          <Input
            {...commonProps}
            type={field.type || 'text'}
            autoComplete={field.autoComplete}
          />
        );
    }

    return (
      <AccessibleFormField
        key={field.name}
        id={field.name}
        label={field.label}
        error={fieldError}
        description={field.description}
        required={validationRules[field.name]?.required}
      >
        {fieldElement}
      </AccessibleFormField>
    );
  }, [values, errors, validationRules, isSubmitting, handleFieldChange, handleFieldBlur]);

  const hasErrors = Object.keys(errors).length > 0;
  const remainingTime = Math.ceil(getRemainingTime() / 1000);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle ref={focusRef}>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>

          {showProgress && (
            <div className="text-right">
              <Badge variant="outline">
                {Math.round(formProgress)}% Complete
              </Badge>
            </div>
          )}
        </div>

        {showProgress && (
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${formProgress}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {/* Rate limit warning */}
          {!canSubmit() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Too many attempts. Please wait {remainingTime} seconds before trying again.
              </AlertDescription>
            </Alert>
          )}

          {/* Auto-save indicator */}
          {autoSave && lastSaved && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Auto-saved at {lastSaved.toLocaleTimeString()}
              </AlertDescription>
            </Alert>
          )}

          {/* Form fields */}
          <div className="space-y-4">
            {fields.map(renderField)}
          </div>

          {/* Form actions */}
          <div className="flex items-center justify-between pt-6">
            <div className="text-sm text-muted-foreground">
              {/* Error summary removed - errors are shown inline with fields */}
            </div>

            <div className="flex items-center space-x-2">
              {onReset && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  icon={RefreshCw}
                >
                  {resetText}
                </Button>
              )}

              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
                loadingText="Submitting..."
                icon={Save}
              >
                {submitText}
              </LoadingButton>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default withPerformanceOptimization(Form, {
  memoize: true,
  monitorPerformance: true
});
