/**
 * Validation Utilities
 * Reusable validation functions dan schemas
 */

import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

/**
 * Validation result class
 */
export class ValidationResult {
  constructor(isValid = true, errors = []) {
    this.isValid = isValid;
    this.errors = errors;
  }

  addError(field, message) {
    this.errors.push({ field, message });
    this.isValid = false;
  }

  getErrors() {
    return this.errors;
  }

  getError(field) {
    return this.errors.find(error => error.field === field)?.message;
  }

  hasError(field) {
    return this.errors.some(error => error.field === field);
  }
}

/**
 * Base validation functions
 */
export const validators = {
  required: (value, field = 'Field') => {
    if (value === null || value === undefined || value === '') {
      return `${field} is required`;
    }
    return null;
  },

  email: (value, field = 'Email') => {
    if (value && !VALIDATION_RULES.EMAIL.test(value)) {
      return `${field} must be a valid email address`;
    }
    return null;
  },

  phone: (value, field = 'Phone') => {
    if (value && !VALIDATION_RULES.PHONE.test(value)) {
      return `${field} must be a valid phone number`;
    }
    return null;
  },

  password: (value, field = 'Password') => {
    if (value && !VALIDATION_RULES.PASSWORD.test(value)) {
      return `${field} must be at least 8 characters with uppercase, lowercase, number and special character`;
    }
    return null;
  },

  username: (value, field = 'Username') => {
    if (value && !VALIDATION_RULES.USERNAME.test(value)) {
      return `${field} must be 3-20 characters and contain only letters, numbers and underscores`;
    }
    return null;
  },

  url: (value, field = 'URL') => {
    if (value && !VALIDATION_RULES.URL.test(value)) {
      return `${field} must be a valid URL`;
    }
    return null;
  },

  minLength: (value, min, field = 'Field') => {
    if (value && value.length < min) {
      return `${field} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value, max, field = 'Field') => {
    if (value && value.length > max) {
      return `${field} must be no more than ${max} characters`;
    }
    return null;
  },

  min: (value, min, field = 'Field') => {
    if (value !== null && value !== undefined && Number(value) < min) {
      return `${field} must be at least ${min}`;
    }
    return null;
  },

  max: (value, max, field = 'Field') => {
    if (value !== null && value !== undefined && Number(value) > max) {
      return `${field} must be no more than ${max}`;
    }
    return null;
  },

  numeric: (value, field = 'Field') => {
    if (value && isNaN(Number(value))) {
      return `${field} must be a number`;
    }
    return null;
  },

  integer: (value, field = 'Field') => {
    if (value && !Number.isInteger(Number(value))) {
      return `${field} must be an integer`;
    }
    return null;
  },

  positive: (value, field = 'Field') => {
    if (value !== null && value !== undefined && Number(value) <= 0) {
      return `${field} must be positive`;
    }
    return null;
  },

  date: (value, field = 'Date') => {
    if (value && isNaN(Date.parse(value))) {
      return `${field} must be a valid date`;
    }
    return null;
  },

  futureDate: (value, field = 'Date') => {
    if (value && new Date(value) <= new Date()) {
      return `${field} must be in the future`;
    }
    return null;
  },

  pastDate: (value, field = 'Date') => {
    if (value && new Date(value) >= new Date()) {
      return `${field} must be in the past`;
    }
    return null;
  },

  oneOf: (value, options, field = 'Field') => {
    if (value && !options.includes(value)) {
      return `${field} must be one of: ${options.join(', ')}`;
    }
    return null;
  },

  pattern: (value, pattern, field = 'Field', message = 'Invalid format') => {
    if (value && !pattern.test(value)) {
      return `${field} ${message}`;
    }
    return null;
  },

  confirm: (value, confirmValue, field = 'Field') => {
    if (value !== confirmValue) {
      return `${field} confirmation does not match`;
    }
    return null;
  },

  fileSize: (file, maxSize, field = 'File') => {
    if (file && file.size > maxSize) {
      return `${field} size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
    }
    return null;
  },

  fileType: (file, allowedTypes, field = 'File') => {
    if (file && !allowedTypes.includes(file.type)) {
      return `${field} type must be one of: ${allowedTypes.join(', ')}`;
    }
    return null;
  }
};

/**
 * Validation schemas
 */
export const schemas = {
  // User validation schema
  user: {
    name: [
      { validator: validators.required, field: 'Name' },
      { validator: validators.minLength, params: [2], field: 'Name' },
      { validator: validators.maxLength, params: [100], field: 'Name' }
    ],
    email: [
      { validator: validators.required, field: 'Email' },
      { validator: validators.email, field: 'Email' }
    ],
    username: [
      { validator: validators.required, field: 'Username' },
      { validator: validators.username, field: 'Username' }
    ],
    phone: [
      { validator: validators.phone, field: 'Phone' }
    ],
    password: [
      { validator: validators.required, field: 'Password' },
      { validator: validators.password, field: 'Password' }
    ],
    confirmPassword: [
      { validator: validators.required, field: 'Confirm Password' },
      { validator: validators.confirm, field: 'Confirm Password' }
    ]
  },

  // Organization validation schema
  organization: {
    name: [
      { validator: validators.required, field: 'Organization Name' },
      { validator: validators.minLength, params: [2], field: 'Organization Name' },
      { validator: validators.maxLength, params: [100], field: 'Organization Name' }
    ],
    code: [
      { validator: validators.required, field: 'Organization Code' },
      { validator: validators.pattern, params: [/^[A-Z0-9_]+$/, 'Organization Code', 'must contain only uppercase letters, numbers and underscores'] },
      { validator: validators.minLength, params: [3], field: 'Organization Code' },
      { validator: validators.maxLength, params: [20], field: 'Organization Code' }
    ],
    email: [
      { validator: validators.required, field: 'Email' },
      { validator: validators.email, field: 'Email' }
    ],
    phone: [
      { validator: validators.phone, field: 'Phone' }
    ],
    website: [
      { validator: validators.url, field: 'Website' }
    ],
    address: [
      { validator: validators.maxLength, params: [500], field: 'Address' }
    ]
  },

  // Subscription validation schema
  subscription: {
    plan_id: [
      { validator: validators.required, field: 'Plan' }
    ],
    organization_id: [
      { validator: validators.required, field: 'Organization' }
    ],
    billing_cycle: [
      { validator: validators.required, field: 'Billing Cycle' },
      { validator: validators.oneOf, params: [['monthly', 'yearly']], field: 'Billing Cycle' }
    ],
    start_date: [
      { validator: validators.required, field: 'Start Date' },
      { validator: validators.date, field: 'Start Date' }
    ],
    end_date: [
      { validator: validators.date, field: 'End Date' }
    ]
  },

  // Chatbot validation schema
  chatbot: {
    name: [
      { validator: validators.required, field: 'Chatbot Name' },
      { validator: validators.minLength, params: [2], field: 'Chatbot Name' },
      { validator: validators.maxLength, params: [100], field: 'Chatbot Name' }
    ],
    description: [
      { validator: validators.maxLength, params: [500], field: 'Description' }
    ],
    personality: [
      { validator: validators.maxLength, params: [1000], field: 'Personality' }
    ],
    welcome_message: [
      { validator: validators.maxLength, params: [500], field: 'Welcome Message' }
    ],
    fallback_message: [
      { validator: validators.maxLength, params: [500], field: 'Fallback Message' }
    ]
  },

  // Search validation schema
  search: {
    query: [
      { validator: validators.minLength, params: [1], field: 'Search Query' },
      { validator: validators.maxLength, params: [100], field: 'Search Query' }
    ],
    page: [
      { validator: validators.integer, field: 'Page' },
      { validator: validators.positive, field: 'Page' }
    ],
    per_page: [
      { validator: validators.integer, field: 'Per Page' },
      { validator: validators.oneOf, params: [[10, 25, 50, 100]], field: 'Per Page' }
    ]
  }
};

/**
 * Validate single field
 */
export const validateField = (value, rules, fieldName = 'Field') => {
  const result = new ValidationResult();

  for (const rule of rules) {
    const { validator, params = [], field = fieldName } = rule;
    const error = validator(value, ...params, field);

    if (error) {
      result.addError(field, error);
      break; // Stop at first error
    }
  }

  return result;
};

/**
 * Validate object against schema
 */
export const validateObject = (data, schema) => {
  const result = new ValidationResult();

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const fieldResult = validateField(value, rules, field);

    if (!fieldResult.isValid) {
      result.errors.push(...fieldResult.errors);
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
};

/**
 * Validate form data
 */
export const validateForm = (formData, schema) => {
  return validateObject(formData, schema);
};

/**
 * Validate API request data
 */
export const validateApiRequest = (data, schema) => {
  return validateObject(data, schema);
};

/**
 * Validate search parameters
 */
export const validateSearchParams = (params) => {
  return validateObject(params, schemas.search);
};

/**
 * Validate pagination parameters
 */
export const validatePaginationParams = (params) => {
  const result = new ValidationResult();

  const { page = 1, per_page = 10, sort_by = '', sort_direction = 'asc' } = params;

  // Validate page
  if (!Number.isInteger(page) || page < 1) {
    result.addError('page', 'Page must be a positive integer');
  }

  // Validate per_page
  if (!Number.isInteger(per_page) || per_page < 1 || per_page > 100) {
    result.addError('per_page', 'Per page must be between 1 and 100');
  }

  // Validate sort_direction
  if (sort_direction && !['asc', 'desc'].includes(sort_direction)) {
    result.addError('sort_direction', 'Sort direction must be asc or desc');
  }

  return result;
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file, options = {}) => {
  const result = new ValidationResult();
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    field = 'File'
  } = options;

  if (!file) {
    result.addError(field, 'File is required');
    return result;
  }

  // Check file size
  const sizeError = validators.fileSize(file, maxSize, field);
  if (sizeError) {
    result.addError(field, sizeError);
  }

  // Check file type
  const typeError = validators.fileType(file, allowedTypes, field);
  if (typeError) {
    result.addError(field, typeError);
  }

  return result;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  return validators.email(email, 'Email') === null;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: true,
    score: 0,
    feedback: []
  };

  if (!password) {
    result.isValid = false;
    result.feedback.push('Password is required');
    return result;
  }

  // Length check
  if (password.length >= 8) {
    result.score += 1;
  } else {
    result.feedback.push('At least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('At least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('At least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('At least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.score += 1;
  } else {
    result.feedback.push('At least one special character');
  }

  result.isValid = result.score >= 4;

  return result;
};

/**
 * Sanitize input data
 */
export const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data.trim();
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
};

export default {
  ValidationResult,
  validators,
  schemas,
  validateField,
  validateObject,
  validateForm,
  validateApiRequest,
  validateSearchParams,
  validatePaginationParams,
  validateFileUpload,
  validateEmail,
  validatePasswordStrength,
  sanitizeInput
};
