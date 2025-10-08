/**
 * Performance Monitoring Utilities for MixxStudio
 * Phase 8: System-Wide Testing
 */

export interface PerformanceMetrics {
  waveformRenderTime: number;
  playbackLatency: number;
  timelineScrubFPS: number;
  trackAddTime: number;
  fileUploadTime: number;
  audioDecodingTime: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  start(operation: string): void {
    this.startTimes.set(operation, performance.now());
  }

  /**
   * End timing and record the duration
   */
  end(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`Performance monitor: No start time for ${operation}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(operation);

    // Store metric
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation)!.push(duration);

    return duration;
  }

  /**
   * Get average time for an operation
   */
  getAverage(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;

    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};

    this.metrics.forEach((times, operation) => {
      result[operation] = {
        avg: this.getAverage(operation),
        min: Math.min(...times),
        max: Math.max(...times),
        count: times.length
      };
    });

    return result;
  }

  /**
   * Check if performance is acceptable
   */
  validatePerformance(): {
    passed: boolean;
    failures: string[];
  } {
    const failures: string[] = [];

    // Benchmarks (in milliseconds)
    const benchmarks = {
      waveformRender: 100,
      playbackLatency: 10,
      trackAdd: 50,
      fileUpload: 5000,
      audioDecoding: 1000
    };

    Object.entries(benchmarks).forEach(([operation, threshold]) => {
      const avg = this.getAverage(operation);
      if (avg > threshold) {
        failures.push(`${operation}: ${avg.toFixed(2)}ms (threshold: ${threshold}ms)`);
      }
    });

    return {
      passed: failures.length === 0,
      failures
    };
  }

  /**
   * Log performance report
   */
  logReport(): void {
    console.group('🎵 MixxStudio Performance Report');
    console.table(this.getAllMetrics());
    
    const validation = this.validatePerformance();
    if (validation.passed) {
      console.log('✅ All performance benchmarks passed!');
    } else {
      console.warn('⚠️ Performance issues detected:');
      validation.failures.forEach(failure => console.warn(`  - ${failure}`));
    }
    
    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Higher-order function to measure async function performance
 */
export function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  performanceMonitor.start(operation);
  return fn().finally(() => {
    const duration = performanceMonitor.end(operation);
    console.log(`⏱️ ${operation}: ${duration.toFixed(2)}ms`);
  });
}

/**
 * Decorator to measure function performance
 */
export function measure(operation: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      performanceMonitor.start(operation);
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        performanceMonitor.end(operation);
      }
    };

    return descriptor;
  };
}
