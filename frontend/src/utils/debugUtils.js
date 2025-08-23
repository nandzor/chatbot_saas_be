// Debug utilities for development
import { devConfig, devUtils } from '@/config/development';

// Infinite loop detection
class InfiniteLoopDetector {
  constructor(maxCalls = 100, timeWindow = 1000) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindow;
    this.callCounts = new Map();
    this.lastReset = Date.now();
  }

  check(identifier) {
    const now = Date.now();

    // Reset counters if time window has passed
    if (now - this.lastReset > this.timeWindow) {
      this.callCounts.clear();
      this.lastReset = now;
    }

    // Increment call count
    const currentCount = this.callCounts.get(identifier) || 0;
    const newCount = currentCount + 1;
    this.callCounts.set(identifier, newCount);

    // Check for potential infinite loop
    if (newCount > this.maxCalls) {
      console.warn(`⚠️ Potential infinite loop detected in: ${identifier} (${newCount} calls)`);
      return true;
    }

    return false;
  }

  reset() {
    this.callCounts.clear();
    this.lastReset = Date.now();
  }
}

// Global instance
export const infiniteLoopDetector = new InfiniteLoopDetector();

// Render counter for components
export const renderCounter = new Map();

export const trackRender = (componentName) => {
  if (!devConfig.enableDebugLogs) return;

  const count = renderCounter.get(componentName) || 0;
  const newCount = count + 1;
  renderCounter.set(componentName, newCount);

  // Log every 10th render to avoid spam
  if (newCount % 10 === 0) {
    console.log(`🔄 ${componentName} rendered ${newCount} times`);
  }

  // Check for excessive renders
  if (newCount > 100) {
    console.warn(`⚠️ ${componentName} has rendered ${newCount} times - potential performance issue`);
  }
};

// Performance monitoring
export const measureRenderTime = (componentName, renderFn) => {
  if (!devConfig.enablePerformanceMonitoring) {
    return renderFn();
  }

  const start = performance.now();
  const result = renderFn();
  const end = performance.now();

  const renderTime = end - start;

  if (renderTime > 16) { // More than 16ms (60fps threshold)
    console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
  }

  return result;
};

// State change tracker
export const trackStateChange = (contextName, stateName, oldValue, newValue) => {
  if (!devConfig.enableDebugLogs) return;

  // Only log if values actually changed
  if (oldValue !== newValue) {
    console.log(`📊 ${contextName}.${stateName} changed:`, {
      from: oldValue,
      to: newValue,
      timestamp: new Date().toISOString()
    });
  }
};

// Effect dependency tracker
export const trackEffectDependencies = (effectName, dependencies) => {
  if (!devConfig.enableDebugLogs) return;

  console.log(`🔗 Effect ${effectName} dependencies:`, dependencies);
};

// Context usage tracker
export const trackContextUsage = (contextName, hookName) => {
  if (!devConfig.enableDebugLogs) return;

  console.log(`🎯 ${hookName} used in ${contextName}`);
};

// Memory leak detection
export const memoryLeakDetector = {
  subscriptions: new Set(),

  trackSubscription(subscription) {
    this.subscriptions.add(subscription);
    console.log(`📡 Subscription added, total: ${this.subscriptions.size}`);
  },

  cleanupSubscription(subscription) {
    this.subscriptions.delete(subscription);
    console.log(`🧹 Subscription cleaned up, total: ${this.subscriptions.size}`);
  },

  checkForLeaks() {
    if (this.subscriptions.size > 0) {
      console.warn(`⚠️ Potential memory leak: ${this.subscriptions.size} subscriptions not cleaned up`);
    }
  }
};

// Export all utilities
export default {
  infiniteLoopDetector,
  renderCounter,
  trackRender,
  measureRenderTime,
  trackStateChange,
  trackEffectDependencies,
  trackContextUsage,
  memoryLeakDetector
};
