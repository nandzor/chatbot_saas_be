/**
 * Security Utilities
 * Utilities untuk meningkatkan keamanan aplikasi frontend
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * XSS protection utilities
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * SQL injection protection for search queries
 */
export const sanitizeSearchQuery = (query) => {
  if (typeof query !== 'string') return '';

  // Remove SQL keywords and special characters
  return query
    .replace(/[';\-]/g, '')
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '')
    .trim();
};

/**
 * Safe HTML parsing
 */
export const createSafeHTML = (htmlString) => {
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'span', 'div'];
  const allowedAttributes = ['class', 'id'];

  // Simple HTML sanitization (in production, use DOMPurify)
  const cleanHTML = htmlString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');

  return { __html: cleanHTML };
};

/**
 * CSRF token management
 */
export const useCSRFToken = () => {
  const token = useRef(null);

  const getCSRFToken = useCallback(() => {
    if (!token.current) {
      // Get token from meta tag or generate one
      const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      token.current = metaToken || generateSecureToken();
    }
    return token.current;
  }, []);

  const refreshCSRFToken = useCallback(() => {
    token.current = null;
    return getCSRFToken();
  }, [getCSRFToken]);

  return { getCSRFToken, refreshCSRFToken };
};

/**
 * Secure token generation
 */
export const generateSecureToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for older browsers
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  return result;
};

/**
 * Session timeout management
 */
export const useSessionTimeout = (timeoutMinutes = 30) => {
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Show warning 5 minutes before timeout
    const warningTime = (timeoutMinutes - 5) * 60 * 1000;
    const timeoutTime = timeoutMinutes * 60 * 1000;

    if (warningTime > 0) {
      warningRef.current = setTimeout(() => {
        const event = new CustomEvent('sessionWarning', {
          detail: { remainingMinutes: 5 }
        });
        window.dispatchEvent(event);
      }, warningTime);
    }

    timeoutRef.current = setTimeout(() => {
      const event = new CustomEvent('sessionTimeout');
      window.dispatchEvent(event);
    }, timeoutTime);
  }, [timeoutMinutes]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    resetTimeout();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimeout]);

  return { resetTimeout };
};

/**
 * Input validation utilities
 */
export const validateInput = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  phoneNumber: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  alphanumeric: (input) => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    return alphanumericRegex.test(input);
  },

  noScriptTags: (input) => {
    return !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(input);
  }
};

/**
 * Content Security Policy helpers
 */
export const addCSPMeta = (policy) => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = policy;
  document.head.appendChild(meta);
};

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  setItem: (key, value, encrypt = false) => {
    try {
      const data = encrypt ? btoa(JSON.stringify(value)) : JSON.stringify(value);
      localStorage.setItem(key, data);
      return true;
    } catch (error) {
      console.warn('Failed to store data securely:', error);
      return false;
    }
  },

  getItem: (key, decrypt = false) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;

      const parsed = decrypt ? JSON.parse(atob(data)) : JSON.parse(data);
      return parsed;
    } catch (error) {
      console.warn('Failed to retrieve data securely:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove data securely:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear storage securely:', error);
      return false;
    }
  }
};

/**
 * Rate limiting hook
 */
export const useRateLimit = (maxAttempts = 5, windowMs = 60000) => {
  const attempts = useRef([]);

  const isAllowed = useCallback(() => {
    const now = Date.now();

    // Remove old attempts outside the window
    attempts.current = attempts.current.filter(time => now - time < windowMs);

    // Check if under limit
    if (attempts.current.length < maxAttempts) {
      attempts.current.push(now);
      return true;
    }

    return false;
  }, [maxAttempts, windowMs]);

  const getRemainingTime = useCallback(() => {
    if (attempts.current.length < maxAttempts) return 0;

    const oldestAttempt = Math.min(...attempts.current);
    const remainingTime = windowMs - (Date.now() - oldestAttempt);

    return Math.max(0, remainingTime);
  }, [maxAttempts, windowMs]);

  return { isAllowed, getRemainingTime };
};

/**
 * Permission validation
 */
export const validatePermissions = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) {
    return false;
  }

  // Check if user has all required permissions
  return requiredPermissions.every(permission =>
    userPermissions.includes(permission) || userPermissions.includes('*')
  );
};

/**
 * Secure form submission
 */
export const useSecureForm = () => {
  const { getCSRFToken } = useCSRFToken();

  const submitSecurely = useCallback(async (url, data, options = {}) => {
    const csrfToken = getCSRFToken();

    const secureData = {
      ...data,
      _token: csrfToken,
      _timestamp: Date.now()
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        ...options.headers
      },
      body: JSON.stringify(secureData),
      ...options
    });

    return response;
  }, [getCSRFToken]);

  return { submitSecurely };
};

/**
 * Secure file upload validation
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  } = options;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }

  // Check for dangerous file names
  if (/[<>:"/\\|?*]/.test(file.name)) {
    errors.push('File name contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  sanitizeInput,
  sanitizeSearchQuery,
  createSafeHTML,
  useCSRFToken,
  generateSecureToken,
  useSessionTimeout,
  validateInput,
  addCSPMeta,
  secureStorage,
  useRateLimit,
  validatePermissions,
  useSecureForm,
  validateFileUpload
};
