import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';

// Toast types and their configurations
const TOAST_TYPES = {
  success: {
    icon: '✓',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-600',
    iconColor: 'text-green-100'
  },
  error: {
    icon: '✕',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600',
    iconColor: 'text-red-100'
  },
  warning: {
    icon: '⚠',
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
    borderColor: 'border-yellow-600',
    iconColor: 'text-yellow-100'
  },
  info: {
    icon: 'ℹ',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    iconColor: 'text-blue-100'
  }
};

// Context creation
const ToasterContext = createContext();

// Custom hook with proper error handling
export const useToaster = () => {
  const context = useContext(ToasterContext);
  if (!context) {
    console.warn('useToaster must be used within a ToasterProvider');
    // Return fallback toaster for graceful degradation
    return {
      addToast: (message, type = 'info', options = {}) => {
        console.log(`[${type.toUpperCase()}] ${message}`, options);
      },
      removeToast: () => {},
      clearToasts: () => {}
    };
  }
  return context;
};

// Individual Toast Component
const Toast = ({ toast, onRemove, onPause, onResume }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const toastConfig = TOAST_TYPES[toast.type] || TOAST_TYPES.info;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPaused || toast.persistent) return;

    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [isPaused, toast.persistent, toast.duration, toast.id, onRemove]);

  const handlePause = () => {
    if (!toast.persistent) {
      setIsPaused(true);
      onPause?.(toast.id);
    }
  };

  const handleResume = () => {
    if (!toast.persistent) {
      setIsPaused(false);
      onResume?.(toast.id);
    }
  };

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${toastConfig.bgColor} ${toastConfig.textColor} ${toastConfig.borderColor}
        border rounded-lg shadow-lg max-w-sm w-full
        hover:shadow-xl transition-shadow duration-200
      `}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-5 h-5 ${toastConfig.iconColor} text-lg font-bold`}>
            {toastConfig.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="text-sm font-semibold mb-1">
                {toast.title}
              </p>
            )}
            <p className="text-sm leading-relaxed">
              {toast.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={handleRemove}
            className={`
              flex-shrink-0 w-5 h-5 rounded-full
              ${toastConfig.iconColor} hover:bg-white hover:bg-opacity-20
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
            `}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        {!toast.persistent && (
          <div className="mt-3 w-full bg-black bg-opacity-20 rounded-full h-1">
            <div
              className={`h-1 ${toastConfig.iconColor} rounded-full transition-all duration-100`}
              style={{
                width: isPaused ? '100%' : '0%',
                transition: isPaused ? 'none' : `width ${toast.duration || 5000}ms linear`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Main Toaster Component
export const Toaster = () => {
  const { toasts, removeToast, pauseToast, resumeToast } = useToaster();

  if (!toasts || toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-3 max-w-sm"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
          onPause={pauseToast}
          onResume={resumeToast}
        />
      ))}
    </div>
  );
};

// Provider Component
export const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [pausedToasts, setPausedToasts] = useState(new Set());
  const cleanupIntervalRef = useRef(null);

  // Add toast with comprehensive options
  const addToast = useCallback((message, type = 'info', options = {}) => {
    try {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newToast = {
        id,
        message,
        type,
        title: options.title,
        duration: options.duration || 5000,
        persistent: options.persistent || false,
        createdAt: new Date().toISOString(),
        ...options
      };

      setToasts(prev => [newToast, ...prev]);

      console.log(`✅ Toast added: [${type}] ${message}`, { id, options });

      return id;
    } catch (error) {
      console.error('❌ Error adding toast:', error);
      return null;
    }
  }, []);

  // Remove specific toast
  const removeToast = useCallback((id) => {
    try {
      setToasts(prev => prev.filter(toast => toast.id !== id));
      setPausedToasts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error('❌ Error removing toast:', error);
    }
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    try {
      setToasts([]);
      setPausedToasts(new Set());
    } catch (error) {
      console.error('❌ Error clearing toasts:', error);
    }
  }, []);

  // Pause toast (pause auto-removal)
  const pauseToast = useCallback((id) => {
    setPausedToasts(prev => new Set([...prev, id]));
  }, []);

  // Resume toast (resume auto-removal)
  const resumeToast = useCallback((id) => {
    setPausedToasts(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Auto-cleanup old toasts using interval instead of useEffect with toasts dependency
  useEffect(() => {
    // Set up cleanup interval
    cleanupIntervalRef.current = setInterval(() => {
      setToasts(prev => {
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; // 5 minutes

        const filteredToasts = prev.filter(toast => {
          const age = now - new Date(toast.createdAt).getTime();
          return age < maxAge;
        });

        // Only update if there are toasts to remove
        if (filteredToasts.length !== prev.length) {
          console.log(`🧹 Cleaned up ${prev.length - filteredToasts.length} old toasts`);
        }

        return filteredToasts;
      });
    }, 30000); // Check every 30 seconds instead of on every render

    // Cleanup interval on unmount
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Context value with memoization
  const value = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    clearToasts,
    pauseToast,
    resumeToast
  }), [toasts, addToast, removeToast, clearToasts, pauseToast, resumeToast]);

  return (
    <ToasterContext.Provider value={value}>
      {children}
    </ToasterContext.Provider>
  );
};
