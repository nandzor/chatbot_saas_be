/**
 * Performance Optimization Utilities
 * Utilities untuk optimasi performa React aplikasi
 */

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Debounce hook untuk input optimization
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook untuk scroll/resize optimization
 */
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Previous value hook untuk dependency comparison
 */
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/**
 * Deep comparison untuk complex objects
 */
export const useDeepMemo = (factory, deps) => {
  const ref = useRef();
  const signalRef = useRef(0);

  if (!ref.current || !isEqual(deps, ref.current.deps)) {
    ref.current = {
      deps,
      value: factory()
    };
    signalRef.current += 1;
  }

  return useMemo(() => ref.current.value, [signalRef.current]);
};

/**
 * Shallow comparison function
 */
const isEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    return keysA.length === keysB.length &&
           keysA.every(key => a[key] === b[key]);
  }
  return false;
};

/**
 * Optimized component wrapper dengan memo
 */
export const withMemo = (Component, propsAreEqual = null) => {
  return memo(Component, propsAreEqual);
};

/**
 * Optimized callback hook dengan dependency analysis
 */
export const useOptimizedCallback = (callback, deps) => {
  const previousDeps = usePrevious(deps);

  return useCallback(
    callback,
    // Only update if dependencies actually changed
    isEqual(deps, previousDeps) ? previousDeps : deps
  );
};

/**
 * Optimized memo hook dengan dependency analysis
 */
export const useOptimizedMemo = (factory, deps) => {
  const previousDeps = usePrevious(deps);

  return useMemo(
    factory,
    // Only update if dependencies actually changed
    isEqual(deps, previousDeps) ? previousDeps : deps
  );
};

/**
 * Virtual scrolling hook untuk large lists
 */
export const useVirtualScroll = ({
  items,
  itemHeight,
  containerHeight,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + 2 * overscan);

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;
  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
    handleScroll
  };
};

/**
 * Intersection Observer hook untuk lazy loading
 */
export const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = React.useState(null);
  const [node, setNode] = React.useState(null);

  const observer = useRef(null);

  useEffect(() => {
    if (!node) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.current.observe(node);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [node, options]);

  return [setNode, entry];
};

/**
 * Lazy loading component wrapper
 */
export const LazyComponent = ({ children, fallback = null, rootMargin = '100px' }) => {
  const [ref, entry] = useIntersectionObserver({
    rootMargin,
    threshold: 0.1
  });

  const isVisible = entry?.isIntersecting;

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  );
};

/**
 * Image lazy loading component
 */
export const LazyImage = ({
  src,
  alt,
  placeholder = null,
  className = '',
  ...props
}) => {
  const [ref, entry] = useIntersectionObserver({
    rootMargin: '50px',
    threshold: 0.1
  });

  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const isVisible = entry?.isIntersecting;

  const handleLoad = useCallback(() => {
    setLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  return (
    <div ref={ref} className={className}>
      {isVisible && !error ? (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      ) : placeholder || (
        <div className="bg-gray-200 animate-pulse w-full h-full" />
      )}
    </div>
  );
};

/**
 * Bundle splitting helper
 */
export const createLazyComponent = (importFn, fallback = null) => {
  const LazyComp = React.lazy(importFn);

  return (props) => (
    <React.Suspense fallback={fallback}>
      <LazyComp {...props} />
    </React.Suspense>
  );
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (name) => {
  const startTime = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime.current;

      // Only log if render count is reasonable (prevent spam)
      if (import.meta.env.DEV && renderCount.current <= 3) {
        console.log(`⚡ Component "${name}" render time: ${duration.toFixed(2)}ms`);
      }
    };
  });

  const markStart = useCallback((markName) => {
    performance.mark(`${name}-${markName}-start`);
  }, [name]);

  const markEnd = useCallback((markName) => {
    performance.mark(`${name}-${markName}-end`);
    performance.measure(
      `${name}-${markName}`,
      `${name}-${markName}-start`,
      `${name}-${markName}-end`
    );
  }, [name]);

  return { markStart, markEnd };
};

/**
 * Memory leak prevention hook
 */
export const useCleanup = (cleanupFn) => {
  const cleanupRef = useRef(cleanupFn);
  cleanupRef.current = cleanupFn;

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);
};

/**
 * Optimized event handler
 */
export const useOptimizedEventHandler = (handler, deps = []) => {
  return useCallback(handler, deps);
};

/**
 * Component render optimization HOC
 */
export const withPerformanceOptimization = (Component, options = {}) => {
  const {
    memoize = true,
    monitorPerformance = false,
    propsAreEqual = null
  } = options;

  let OptimizedComponent = Component;

  if (memoize) {
    OptimizedComponent = memo(OptimizedComponent, propsAreEqual);
  }

  if (monitorPerformance && import.meta.env.DEV) {
    OptimizedComponent = (props) => {
      const { markStart, markEnd } = usePerformanceMonitor(Component.displayName || Component.name);

      useEffect(() => {
        markStart('render');
        return () => markEnd('render');
      });

      return <Component {...props} />;
    };
  }

  return OptimizedComponent;
};

export default {
  useDebounce,
  useThrottle,
  usePrevious,
  useDeepMemo,
  withMemo,
  useOptimizedCallback,
  useOptimizedMemo,
  useVirtualScroll,
  useIntersectionObserver,
  LazyComponent,
  LazyImage,
  createLazyComponent,
  usePerformanceMonitor,
  useCleanup,
  useOptimizedEventHandler,
  withPerformanceOptimization
};
