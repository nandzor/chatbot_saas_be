/**
 * Accessibility Utilities
 * Utilities untuk meningkatkan aksesibilitas aplikasi
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Focus management hook
 */
export const useFocusManagement = () => {
  const focusRef = useRef(null);

  const setFocus = useCallback((element = null) => {
    const target = element || focusRef.current;
    if (target && typeof target.focus === 'function') {
      // Delay to ensure element is rendered
      setTimeout(() => target.focus(), 0);
    }
  }, []);

  const focusFirstElement = useCallback((container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  const focusLastElement = useCallback((container) => {
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, []);

  return {
    focusRef,
    setFocus,
    focusFirstElement,
    focusLastElement
  };
};

/**
 * Keyboard navigation hook
 */
export const useKeyboardNavigation = (options = {}) => {
  const {
    onEscape = null,
    onEnter = null,
    onArrowUp = null,
    onArrowDown = null,
    onArrowLeft = null,
    onArrowRight = null,
    onTab = null,
    onShiftTab = null
  } = options;

  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft(event);
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight(event);
        }
        break;
      case 'Tab':
        if (event.shiftKey && onShiftTab) {
          event.preventDefault();
          onShiftTab(event);
        } else if (onTab) {
          event.preventDefault();
          onTab(event);
        }
        break;
    }
  }, [onEscape, onEnter, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab, onShiftTab]);

  return { handleKeyDown };
};

/**
 * Screen reader announcements hook
 */
export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [type, setType] = useState('success');

  const announce = useCallback((message, announcementType = 'success', priority = 'polite') => {
    console.log('useAnnouncement: Announcing message:', message, 'Type:', announcementType); // Debug log
    setAnnouncement(message);
    setType(announcementType);
    setIsVisible(true);

    // Clear announcement after a delay to allow re-announcement of same message
    setTimeout(() => {
      setIsVisible(false);
      // Clear the message after fade out animation
      setTimeout(() => {
        setAnnouncement('');
      }, 300);
    }, 3000); // Show for 3 seconds
  }, []);

  const getNotificationStyles = (notificationType) => {
    const styles = {
      success: {
        bg: 'bg-green-600',
        icon: (
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        )
      },
      error: {
        bg: 'bg-red-600',
        icon: (
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        )
      },
      warning: {
        bg: 'bg-yellow-600',
        icon: (
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        )
      },
      info: {
        bg: 'bg-blue-600',
        icon: (
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        )
      }
    };
    return styles[notificationType] || styles.success;
  };

  const AnnouncementRegion = () => {
    console.log('AnnouncementRegion: Rendering with announcement:', announcement); // Debug log
    const notificationStyle = getNotificationStyles(type);

    return (
      <>
        {/* Screen reader announcement */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

        {/* Visual notification for sighted users */}
        {announcement && (
          <div className={`fixed top-4 right-4 z-50 ${notificationStyle.bg} text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            isVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-full'
          }`}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                {notificationStyle.icon}
              </svg>
              <span className="text-sm font-medium">{announcement}</span>
            </div>
          </div>
        )}
      </>
    );
  };

  return { announce, AnnouncementRegion };
};

/**
 * Focus trap hook untuk modals
 */
export const useFocusTrap = (isActive = true) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Set initial focus
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Skip link component
 */
export const SkipLink = ({ href = '#main-content', children = 'Skip to main content' }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
  >
    {children}
  </a>
);

/**
 * Accessible heading hierarchy hook
 */
export const useHeadingLevel = (baseLevel = 1) => {
  const [currentLevel, setCurrentLevel] = useState(baseLevel);

  const incrementLevel = useCallback(() => {
    setCurrentLevel(prev => Math.min(prev + 1, 6));
  }, []);

  const decrementLevel = useCallback(() => {
    setCurrentLevel(prev => Math.max(prev - 1, 1));
  }, []);

  const resetLevel = useCallback(() => {
    setCurrentLevel(baseLevel);
  }, [baseLevel]);

  const getHeadingProps = useCallback((level = currentLevel) => ({
    'aria-level': level,
    role: 'heading'
  }), [currentLevel]);

  return {
    currentLevel,
    incrementLevel,
    decrementLevel,
    resetLevel,
    getHeadingProps
  };
};

/**
 * High contrast mode detection
 */
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');

    setIsHighContrast(mediaQuery.matches);

    const handleChange = (e) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isHighContrast;
};

/**
 * Reduced motion detection
 */
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

/**
 * ARIA attributes helper
 */
export const getAriaAttributes = (options = {}) => {
  const {
    label,
    labelledBy,
    describedBy,
    expanded,
    selected,
    checked,
    disabled,
    required,
    invalid,
    hidden,
    controls,
    owns,
    activedescendant,
    level,
    setsize,
    posinset,
    orientation,
    sort,
    valuemin,
    valuemax,
    valuenow,
    valuetext
  } = options;

  const attrs = {};

  if (label) attrs['aria-label'] = label;
  if (labelledBy) attrs['aria-labelledby'] = labelledBy;
  if (describedBy) attrs['aria-describedby'] = describedBy;
  if (expanded !== undefined) attrs['aria-expanded'] = expanded;
  if (selected !== undefined) attrs['aria-selected'] = selected;
  if (checked !== undefined) attrs['aria-checked'] = checked;
  if (disabled !== undefined) attrs['aria-disabled'] = disabled;
  if (required !== undefined) attrs['aria-required'] = required;
  if (invalid !== undefined) attrs['aria-invalid'] = invalid;
  if (hidden !== undefined) attrs['aria-hidden'] = hidden;
  if (controls) attrs['aria-controls'] = controls;
  if (owns) attrs['aria-owns'] = owns;
  if (activedescendant) attrs['aria-activedescendant'] = activedescendant;
  if (level) attrs['aria-level'] = level;
  if (setsize) attrs['aria-setsize'] = setsize;
  if (posinset) attrs['aria-posinset'] = posinset;
  if (orientation) attrs['aria-orientation'] = orientation;
  if (sort) attrs['aria-sort'] = sort;
  if (valuemin !== undefined) attrs['aria-valuemin'] = valuemin;
  if (valuemax !== undefined) attrs['aria-valuemax'] = valuemax;
  if (valuenow !== undefined) attrs['aria-valuenow'] = valuenow;
  if (valuetext) attrs['aria-valuetext'] = valuetext;

  return attrs;
};

/**
 * Accessible button component
 */
export const AccessibleButton = React.forwardRef(({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  variant = 'default',
  ...props
}, ref) => {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: (e) => {
      if (!disabled && onClick) {
        onClick(e);
      }
    }
  });

  return (
    <button
      ref={ref}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none ring-offset-background
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

/**
 * Accessible form field component
 */
export const AccessibleFormField = ({
  id,
  label,
  children,
  error,
  description,
  required = false,
  className = ''
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const descriptionId = description ? `${id}-description` : undefined;
  const describedBy = [errorId, descriptionId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
      </label>

      {React.cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required
      })}

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default {
  useFocusManagement,
  useKeyboardNavigation,
  useAnnouncement,
  useFocusTrap,
  SkipLink,
  useHeadingLevel,
  useHighContrast,
  useReducedMotion,
  getAriaAttributes,
  AccessibleButton,
  AccessibleFormField
};
