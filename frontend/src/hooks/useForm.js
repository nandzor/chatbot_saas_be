import { useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Generic Form Hook
 * Provides comprehensive form state management with validation, error handling, and submission
 * Supports complex validation rules, field dependencies, and async validation
 */
export const useForm = (initialData = {}, validationRules = {}, options = {}) => {
  const {
    autoValidate = true,
    showToast = true,
    validateOnChange = true,
    validateOnBlur = true,
    debounceValidation = 300,
    enableDirtyTracking = true,
    enableTouchedTracking = true
  } = options;

  // Form state
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Refs
  const initialDataRef = useRef(initialData);
  const validationTimeoutRef = useRef(null);
  const validationRulesRef = useRef(validationRules);

  // Update validation rules ref when rules change
  validationRulesRef.current = validationRules;

  /**
   * Validation function with comprehensive rule support
   */
  const validate = useCallback(async (data = formData, fields = null) => {
    setIsValidating(true);
    
    try {
      const newErrors = {};
      const rules = validationRulesRef.current;
      const fieldsToValidate = fields || Object.keys(rules);
      
      for (const field of fieldsToValidate) {
        const value = data[field];
        const fieldRules = rules[field];
        
        if (!fieldRules) continue;
        
        // Convert fieldRules to array format if it's an object
        const rulesArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
        
        for (const rule of rulesArray) {
          let error = null;
          
          switch (rule.type) {
            case 'required':
              if (!value || (typeof value === 'string' && value.trim() === '') || 
                  (Array.isArray(value) && value.length === 0)) {
                error = rule.message || `${field} is required`;
              }
              break;
              
            case 'email':
              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                error = rule.message || 'Invalid email format';
              }
              break;
              
            case 'minLength':
              if (value && value.length < rule.value) {
                error = rule.message || `${field} must be at least ${rule.value} characters`;
              }
              break;
              
            case 'maxLength':
              if (value && value.length > rule.value) {
                error = rule.message || `${field} must be less than ${rule.value} characters`;
              }
              break;
              
            case 'min':
              if (value !== undefined && value !== null && Number(value) < rule.value) {
                error = rule.message || `${field} must be at least ${rule.value}`;
              }
              break;
              
            case 'max':
              if (value !== undefined && value !== null && Number(value) > rule.value) {
                error = rule.message || `${field} must be at most ${rule.value}`;
              }
              break;
              
            case 'pattern':
              if (value && !rule.value.test(value)) {
                error = rule.message || `Invalid ${field} format`;
              }
              break;
              
            case 'custom':
              if (rule.validator) {
                const result = rule.validator(value, data, field);
                if (result && typeof result === 'string') {
                  error = result;
                } else if (result && result.then) {
                  // Async validation
                  try {
                    const asyncResult = await result;
                    if (asyncResult && typeof asyncResult === 'string') {
                      error = asyncResult;
                    }
                  } catch (asyncError) {
                    error = asyncError.message || 'Validation failed';
                  }
                }
              }
              break;
              
            case 'dependent':
              if (rule.dependencies && rule.validator) {
                const dependencies = rule.dependencies.map(dep => data[dep]);
                const result = rule.validator(value, dependencies, data, field);
                if (result && typeof result === 'string') {
                  error = result;
                }
              }
              break;
              
            case 'unique':
              if (value && rule.checker) {
                try {
                  const isUnique = await rule.checker(value, data, field);
                  if (!isUnique) {
                    error = rule.message || `${field} must be unique`;
                  }
                } catch (checkError) {
                  error = checkError.message || 'Uniqueness check failed';
                }
              }
              break;
              
            case 'conditional':
              if (rule.condition && rule.validator) {
                const shouldValidate = rule.condition(data);
                if (shouldValidate) {
                  const result = rule.validator(value, data, field);
                  if (result && typeof result === 'string') {
                    error = result;
                  }
                }
              }
              break;
          }
          
          if (error) {
            newErrors[field] = error;
            break; // Stop checking other rules for this field
          }
        }
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
      
    } finally {
      setIsValidating(false);
    }
  }, [formData]);

  /**
   * Debounced validation
   */
  const debouncedValidate = useCallback((data, fields) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      validate(data, fields);
    }, debounceValidation);
  }, [validate, debounceValidation]);

  /**
   * Handle field changes
   */
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (enableDirtyTracking) {
      setIsDirty(true);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Auto-validate if enabled
    if (validateOnChange && autoValidate) {
      debouncedValidate({ ...formData, [field]: value }, [field]);
    }
  }, [errors, validateOnChange, autoValidate, debouncedValidate, formData, enableDirtyTracking]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((field) => {
    if (enableTouchedTracking) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
    
    // Validate on blur if enabled
    if (validateOnBlur && autoValidate) {
      validate(formData, [field]);
    }
  }, [validateOnBlur, autoValidate, validate, formData, enableTouchedTracking]);

  /**
   * Handle multiple field changes
   */
  const handleMultipleChanges = useCallback((changes) => {
    setFormData(prev => ({ ...prev, ...changes }));
    
    if (enableDirtyTracking) {
      setIsDirty(true);
    }
    
    // Clear errors for changed fields
    const fieldNames = Object.keys(changes);
    const newErrors = { ...errors };
    fieldNames.forEach(field => {
      if (newErrors[field]) {
        delete newErrors[field];
      }
    });
    setErrors(newErrors);
    
    // Auto-validate if enabled
    if (validateOnChange && autoValidate) {
      debouncedValidate({ ...formData, ...changes }, fieldNames);
    }
  }, [errors, validateOnChange, autoValidate, debouncedValidate, formData, enableDirtyTracking]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialDataRef.current);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
    setIsValidating(false);
    
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
  }, []);

  /**
   * Set form data
   */
  const setFormDataDirectly = useCallback((newData) => {
    setFormData(newData);
    if (enableDirtyTracking) {
      setIsDirty(true);
    }
  }, [enableDirtyTracking]);

  /**
   * Set field value directly
   */
  const setFieldValue = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (enableDirtyTracking) {
      setIsDirty(true);
    }
  }, [enableDirtyTracking]);

  /**
   * Set field error directly
   */
  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Submit form with comprehensive handling
   */
  const handleSubmit = useCallback(async (submitFn, options = {}) => {
    const { 
      validateBeforeSubmit = true, 
      showSuccessToast = true,
      showErrorToast = true,
      resetOnSuccess = false,
      onSuccess = null,
      onError = null
    } = options;
    
    try {
      setIsSubmitting(true);
      
      // Validate before submission if enabled
      if (validateBeforeSubmit) {
        const isValid = await validate();
        if (!isValid) {
          if (showErrorToast && showToast) {
            toast.error('Please fix the errors before submitting');
          }
          return { success: false, errors, isValid: false };
        }
      }
      
      // Submit the form
      const result = await submitFn(formData);
      
      if (result?.success !== false) {
        if (showSuccessToast && showToast) {
          toast.success(result?.message || 'Form submitted successfully');
        }
        
        if (resetOnSuccess) {
          resetForm();
        } else if (enableDirtyTracking) {
          setIsDirty(false);
        }
        
        if (onSuccess) {
          onSuccess(result, formData);
        }
        
        return { success: true, data: result, isValid: true };
      } else {
        if (showErrorToast && showToast) {
          toast.error(result?.message || 'Form submission failed');
        }
        
        if (onError) {
          onError(result, formData);
        }
        
        return { success: false, message: result?.message, isValid: true };
      }
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to submit form';
      
      if (showErrorToast && showToast) {
        toast.error(errorMessage);
      }
      
      if (onError) {
        onError(error, formData);
      }
      
      return { success: false, message: errorMessage, error };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate, errors, showToast, enableDirtyTracking, resetForm]);

  /**
   * Validate specific fields
   */
  const validateFields = useCallback(async (fields) => {
    return validate(formData, fields);
  }, [validate, formData]);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const hasChanges = useMemo(() => isDirty, [isDirty]);
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);
  const isTouched = useMemo(() => Object.keys(touched).length > 0, [touched]);

  /**
   * Get field-specific state
   */
  const getFieldState = useCallback((field) => {
    return {
      value: formData[field],
      error: errors[field],
      touched: touched[field],
      hasError: !!errors[field],
      isTouched: !!touched[field]
    };
  }, [formData, errors, touched]);

  /**
   * Check if specific field is valid
   */
  const isFieldValid = useCallback((field) => {
    return !errors[field];
  }, [errors]);

  /**
   * Get all field errors as array
   */
  const getFieldErrors = useCallback(() => {
    return Object.entries(errors).map(([field, error]) => ({ field, error }));
  }, [errors]);

  /**
   * Cleanup on unmount
   */
  const cleanup = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
  }, []);

  return {
    // State
    formData,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValidating,
    
    // Computed values
    isValid,
    hasChanges,
    hasErrors,
    isTouched,
    
    // Actions
    handleChange,
    handleBlur,
    handleMultipleChanges,
    handleSubmit,
    resetForm,
    validate,
    validateFields,
    
    // Setters
    setFormData: setFormDataDirectly,
    setFieldValue,
    setFieldError,
    clearFieldError,
    
    // Utilities
    getFieldState,
    isFieldValid,
    getFieldErrors,
    cleanup
  };
};
