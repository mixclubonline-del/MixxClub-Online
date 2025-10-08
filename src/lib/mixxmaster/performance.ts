// Performance optimization utilities for MixxMaster

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  audioProcessingTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initObservers();
  }

  private initObservers() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor long tasks
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.warn('Long task detected:', entry.duration, 'ms');
            this.recordMetric('long-tasks', entry.duration);
          }
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // longtask not supported in all browsers
      }

      // Monitor layout shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ('value' in entry) {
              this.recordMetric('layout-shift', (entry as any).value);
            }
          }
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (e) {
        // layout-shift not supported in all browsers
      }
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);

    // Keep only last 100 measurements
    if (this.metrics.get(name)!.length > 100) {
      this.metrics.get(name)!.shift();
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  clearMetrics() {
    this.metrics.clear();
  }

  dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Audio buffer pooling for memory efficiency
class AudioBufferPool {
  private pools: Map<number, Float32Array[]> = new Map();
  private readonly MAX_POOL_SIZE = 50;

  acquire(size: number): Float32Array {
    const pool = this.pools.get(size) || [];
    const buffer = pool.pop();

    if (buffer) {
      buffer.fill(0); // Clear before reuse
      return buffer;
    }

    return new Float32Array(size);
  }

  release(buffer: Float32Array) {
    const size = buffer.length;
    const pool = this.pools.get(size) || [];

    if (pool.length < this.MAX_POOL_SIZE) {
      pool.push(buffer);
      this.pools.set(size, pool);
    }
  }

  clear() {
    this.pools.clear();
  }

  getStats() {
    let totalBuffers = 0;
    let totalMemory = 0;

    this.pools.forEach((pool, size) => {
      totalBuffers += pool.length;
      totalMemory += pool.length * size * 4; // 4 bytes per float
    });

    return {
      totalBuffers,
      totalMemoryMB: (totalMemory / (1024 * 1024)).toFixed(2)
    };
  }
}

export const audioBufferPool = new AudioBufferPool();

// Web Worker for offloading audio processing
export class AudioWorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: Array<{
    data: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(workerCount: number = navigator.hardwareConcurrency || 4) {
    // Create worker pool
    for (let i = 0; i < workerCount; i++) {
      try {
        const worker = new Worker(
          new URL('../workers/audio-processor.worker.ts', import.meta.url),
          { type: 'module' }
        );

        worker.onmessage = (e) => this.handleWorkerMessage(worker, e);
        worker.onerror = (e) => this.handleWorkerError(worker, e);

        this.workers.push(worker);
        this.availableWorkers.push(worker);
      } catch (error) {
        console.error('Failed to create audio worker:', error);
      }
    }
  }

  private handleWorkerMessage(worker: Worker, event: MessageEvent) {
    // Worker completed task, make it available again
    this.availableWorkers.push(worker);
    this.processQueue();
  }

  private handleWorkerError(worker: Worker, error: ErrorEvent) {
    console.error('Audio worker error:', error);
    // Worker errored, still make it available for retry
    this.availableWorkers.push(worker);
    this.processQueue();
  }

  private processQueue() {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.availableWorkers.shift()!;

      worker.postMessage(task.data);

      worker.onmessage = (e) => {
        task.resolve(e.data);
        this.availableWorkers.push(worker);
        this.processQueue();
      };

      worker.onerror = (e) => {
        task.reject(new Error(e.message));
        this.availableWorkers.push(worker);
        this.processQueue();
      };
    }
  }

  async process(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ data, resolve, reject });
      this.processQueue();
    });
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
  }

  getStats() {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length
    };
  }
}

// Throttle function for performance-sensitive operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function(this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func.apply(this, args);

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Debounce for less frequent updates
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function(this: any, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func.apply(this, args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Measure rendering performance
export function measureRender(componentName: string, callback: () => void) {
  const start = performance.now();
  callback();
  const duration = performance.now() - start;

  performanceMonitor.recordMetric(`render-${componentName}`, duration);

  if (duration > 16.67) { // 60fps = 16.67ms per frame
    console.warn(`Slow render detected for ${componentName}: ${duration.toFixed(2)}ms`);
  }
}

// Memory monitoring
export function checkMemoryUsage(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
}

// Batch DOM updates
export class DOMBatcher {
  private updates: Array<() => void> = [];
  private scheduled = false;

  add(update: () => void) {
    this.updates.push(update);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush() {
    const updates = this.updates.splice(0);
    updates.forEach(update => update());
    this.scheduled = false;
  }
}

export const domBatcher = new DOMBatcher();
