// Simple performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTimes = new Map();
    this.renderCounts = new Map();
  }

  // Start timing an operation
  startTimer(operationName) {
    this.startTimes.set(operationName, performance.now());
  }

  // End timing an operation
  endTimer(operationName) {
    const startTime = this.startTimes.get(operationName);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.set(operationName, duration);
      
      if (duration > 16) { // More than 16ms (60fps threshold)
        console.warn(`🐌 Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      this.startTimes.delete(operationName);
      return duration;
    }
    return 0;
  }

  // Track component renders
  trackRender(componentName) {
    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);
    
    // Log every 20th render to avoid spam
    if ((count + 1) % 20 === 0) {
    }
    
    // Warn about excessive renders
    if (count + 1 > 50) {
      console.warn(`⚠️ ${componentName} has rendered ${count + 1} times - check for infinite loops`);
    }
  }

  // Get performance summary
  getSummary() {
    const summary = {
      metrics: Object.fromEntries(this.metrics),
      renderCounts: Object.fromEntries(this.renderCounts),
      timestamp: new Date().toISOString()
    };
    
    console.table(summary);
    return summary;
  }

  // Reset all metrics
  reset() {
    this.metrics.clear();
    this.startTimes.clear();
    this.renderCounts.clear();
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const measureOperation = (operationName, operation) => {
  performanceMonitor.startTimer(operationName);
  try {
    return operation();
  } finally {
    performanceMonitor.endTimer(operationName);
  }
};

export const trackComponentRender = (componentName) => {
  performanceMonitor.trackRender(componentName);
};

export const getPerformanceSummary = () => {
  return performanceMonitor.getSummary();
};

export const resetPerformanceMonitor = () => {
  performanceMonitor.reset();
};

export default performanceMonitor;
