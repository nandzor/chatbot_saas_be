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

  const announce = useCallback((message, priority = 'polite') => {
    setAnnouncement(message);

    // Clear announcement after a short delay to allow re-announcement of same message
    setTimeout(() => {
      setAnnouncement('');
    }, 1000);
  }, []);

  const AnnouncementRegion = () => (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );

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
