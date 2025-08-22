import { VALIDATION } from '@/config/constants';

// Email validation
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  if (!VALIDATION.EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  return null;
};

// Password validation
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`;
  }
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character';
  return null;
};

// Username validation
export const validateUsername = (username) => {
  if (!username) return 'Username is required';
  if (username.length < VALIDATION.USERNAME_MIN_LENGTH) {
    return `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters long`;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Phone number validation (Indonesian format)
export const validatePhoneNumber = (phone) => {
  if (!phone) return 'Phone number is required';
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid Indonesian phone number';
  }
  return null;
};

// URL validation
export const validateUrl = (url) => {
  if (!url) return null; // URL is optional
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// File validation
export const validateFile = (file, options = {}) => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;
  
  if (!file) return 'File is required';
  
  if (file.size > maxSize) {
    return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `File type must be one of: ${allowedTypes.join(', ')}`;
  }
  
  return null;
};

// Number validation
export const validateNumber = (value, options = {}) => {
  const { min, max, required = false } = options;
  
  if (required && (value === null || value === undefined || value === '')) {
    return 'This field is required';
  }
  
  if (value !== null && value !== undefined && value !== '') {
    const num = Number(value);
    if (isNaN(num)) return 'Please enter a valid number';
    
    if (min !== undefined && num < min) {
      return `Value must be at least ${min}`;
    }
    
    if (max !== undefined && num > max) {
      return `Value must be at most ${max}`;
    }
  }
  
  return null;
};

// Date validation
export const validateDate = (date, options = {}) => {
  const { minDate, maxDate, required = false } = options;
  
  if (required && !date) {
    return 'Date is required';
  }
  
  if (date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Please enter a valid date';
    }
    
    if (minDate && dateObj < new Date(minDate)) {
      return `Date must be after ${new Date(minDate).toLocaleDateString()}`;
    }
    
    if (maxDate && dateObj > new Date(maxDate)) {
      return `Date must be before ${new Date(maxDate).toLocaleDateString()}`;
    }
  }
  
  return null;
};

// Form validation helper
export const validateForm = (values, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const value = values[field];
    const rules = validationRules[field];
    
    for (const rule of rules) {
      let error = null;
      
      switch (rule.type) {
        case 'required':
          error = validateRequired(value, rule.fieldName || field);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'password':
          error = validatePassword(value);
          break;
        case 'username':
          error = validateUsername(value);
          break;
        case 'phone':
          error = validatePhoneNumber(value);
          break;
        case 'url':
          error = validateUrl(value);
          break;
        case 'number':
          error = validateNumber(value, rule.options);
          break;
        case 'date':
          error = validateDate(value, rule.options);
          break;
        case 'file':
          error = validateFile(value, rule.options);
          break;
        case 'custom':
          error = rule.validator(value, values);
          break;
      }
      
      if (error) {
        errors[field] = error;
        break; // Stop checking other rules for this field
      }
    }
  });
  
  return errors;
};

// Check if form is valid
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};
