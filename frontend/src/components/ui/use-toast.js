/**
 * Toast Hook for Notification System
 * Simple implementation for toast notifications
 */

import { useState, useCallback, useEffect } from 'react';

// Global toast state
let toastState = {
  toasts: [],
  listeners: new Set()
};

// Toast ID counter
let toastIdCounter = 0;

/**
 * Generate unique toast ID
 */
const generateToastId = () => `toast-${++toastIdCounter}`;

/**
 * Add toast to state and notify listeners
 */
const addToast = (toast) => {
  const id = generateToastId();
  const newToast = {
    id,
    ...toast,
    createdAt: Date.now()
  };

  toastState.toasts.push(newToast);
  toastState.listeners.forEach(listener => listener([...toastState.toasts]));

  // Auto dismiss after duration (default 5 seconds)
  const duration = toast.duration || 5000;
  if (duration !== Infinity) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

/**
 * Remove toast from state and notify listeners
 */
const removeToast = (id) => {
  toastState.toasts = toastState.toasts.filter(toast => toast.id !== id);
  toastState.listeners.forEach(listener => listener([...toastState.toasts]));
};

/**
 * Clear all toasts
 */
const clearAllToasts = () => {
  toastState.toasts = [];
  toastState.listeners.forEach(listener => listener([]));
};

/**
 * Toast hook for components
 */
export const useToast = () => {
  const [toasts, setToasts] = useState(toastState.toasts);

  // Subscribe to toast state changes
  const subscribe = useCallback((listener) => {
    toastState.listeners.add(listener);
    return () => {
      toastState.listeners.delete(listener);
    };
  }, []);

  // Subscribe on mount
  useEffect(() => {
    const unsubscribe = subscribe(setToasts);
    return unsubscribe;
  }, [subscribe]);

  const toast = useCallback((toastData) => {
    return addToast(toastData);
  }, []);

  const dismiss = useCallback((id) => {
    removeToast(id);
  }, []);

  const dismissAll = useCallback(() => {
    clearAllToasts();
  }, []);

  return {
    toasts,
    toast,
    dismiss,
    dismissAll
  };
};

/**
 * Main toast function for use in utils/notify.js
 */
export const toast = (toastData) => {
  return addToast(toastData);
};
