/**
 * Notification Helper Functions
 * Centralized toast notification system for consistent UI feedback
 */

// Import toast function - will be implemented with shadcn/ui toast
import { toast } from '@/components/ui';

/**
 * Show success notification
 * @param {string} message - Success message to display
 * @param {object} options - Additional toast options
 */
export const notifySuccess = (message, options = {}) => {
  toast({
    title: message || 'Berhasil',
    variant: 'default',
    className: 'bg-green-50 border-green-200 text-green-800',
    ...options
  });
};

/**
 * Show error notification
 * @param {string} message - Error message to display
 * @param {object} options - Additional toast options
 */
export const notifyError = (message, options = {}) => {
  toast({
    title: message || 'Terjadi kesalahan',
    variant: 'destructive',
    className: 'bg-red-50 border-red-200 text-red-800',
    ...options
  });
};

/**
 * Show info notification
 * @param {string} message - Info message to display
 * @param {object} options - Additional toast options
 */
export const notifyInfo = (message, options = {}) => {
  toast({
    title: message || 'Info',
    variant: 'default',
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    ...options
  });
};

/**
 * Show warning notification
 * @param {string} message - Warning message to display
 * @param {object} options - Additional toast options
 */
export const notifyWarning = (message, options = {}) => {
  toast({
    title: message || 'Peringatan',
    variant: 'default',
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    ...options
  });
};

/**
 * Show loading notification (for long operations)
 * @param {string} message - Loading message to display
 * @param {object} options - Additional toast options
 */
export const notifyLoading = (message, options = {}) => {
  toast({
    title: message || 'Memproses...',
    variant: 'default',
    className: 'bg-gray-50 border-gray-200 text-gray-800',
    duration: Infinity, // Don't auto-dismiss
    ...options
  });
};

/**
 * Dismiss all notifications
 */
export const dismissAll = () => {
  // Implementation depends on toast library
  // For now, we'll use a simple approach
  const toasts = document.querySelectorAll('[data-toast]');
  toasts.forEach(toast => toast.remove());
};

/**
 * Dismiss specific notification by id
 * @param {string} toastId - ID of toast to dismiss
 */
export const dismissToast = (toastId) => {
  const toast = document.querySelector(`[data-toast-id="${toastId}"]`);
  if (toast) {
    toast.remove();
  }
};
