/**
 * Toaster Component
 * Displays toast notifications
 */

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui';

const Toaster = () => {
  const { toasts, dismiss } = useToast();

  const getIcon = (variant) => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getVariantClasses = (variant, className = '') => {
    const baseClasses = 'border rounded-lg p-4 shadow-lg max-w-sm w-full';

    switch (variant) {
      case 'destructive':
        return `${baseClasses} bg-red-50 border-red-200 text-red-800 ${className}`;
      case 'success':
        return `${baseClasses} bg-green-50 border-green-200 text-green-800 ${className}`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800 ${className}`;
      default:
        return `${baseClasses} bg-white border-gray-200 text-gray-800 ${className}`;
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={getVariantClasses(toast.variant, toast.className)}
          data-toast-id={toast.id}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(toast.variant)}
            </div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="font-medium text-sm">
                  {toast.title}
                </div>
              )}

              {toast.description && (
                <div className="text-sm mt-1 opacity-90">
                  {toast.description}
                </div>
              )}
            </div>

            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
