/**
 * Performance monitoring and logging for MixxMaster operations
 */

export class PerformanceMonitor {
  private static metrics: Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    errors: number;
  }> = new Map();

  /**
   * Track operation performance
   */
  static async track<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    let error = false;

    try {
      const result = await fn();
      return result;
    } catch (err) {
      error = true;
      throw err;
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration, error);
    }
  }

  /**
   * Record metric
   */
  private static recordMetric(operation: string, duration: number, error: boolean): void {
    const existing = this.metrics.get(operation);

    if (!existing) {
      this.metrics.set(operation, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration,
        errors: error ? 1 : 0,
      });
    } else {
      existing.count++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
      if (error) existing.errors++;
    }

    // Log slow operations (>5s)
    if (duration > 5000) {
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Get metrics summary
   */
  static getMetrics(): Record<string, any> {
    const summary: Record<string, any> = {};

    for (const [operation, metrics] of this.metrics.entries()) {
      summary[operation] = {
        count: metrics.count,
        avgTime: metrics.totalTime / metrics.count,
        minTime: metrics.minTime,
        maxTime: metrics.maxTime,
        errors: metrics.errors,
        errorRate: (metrics.errors / metrics.count) * 100,
      };
    }

    return summary;
  }

  /**
   * Reset metrics
   */
  static reset(): void {
    this.metrics.clear();
  }
}

/**
 * Structured logging
 */
export class Logger {
  private static logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: any;
  }> = [];

  static info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  static warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  static error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  private static log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    // Console output
    const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleMethod(`[MixxMaster ${level.toUpperCase()}]`, message, data || '');

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }

    // Store in localStorage for debugging
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('mixxmaster_logs', JSON.stringify(this.logs.slice(-100)));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  static getLogs(level?: 'info' | 'warn' | 'error'): typeof Logger.logs {
    if (!level) return [...this.logs];
    return this.logs.filter(log => log.level === level);
  }

  static clear(): void {
    this.logs = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('mixxmaster_logs');
    }
  }
}

/**
 * Error tracking
 */
export class ErrorTracker {
  private static errors: Map<string, number> = new Map();

  static track(error: Error, context?: string): void {
    const key = `${context || 'unknown'}:${error.message}`;
    const count = (this.errors.get(key) || 0) + 1;
    this.errors.set(key, count);

    Logger.error(`Error in ${context || 'unknown'}`, {
      message: error.message,
      stack: error.stack,
      count,
    });

    // Alert on repeated errors (>3 times)
    if (count > 3) {
      console.error(`Repeated error detected (${count} times):`, error.message);
    }
  }

  static getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errors);
  }

  static reset(): void {
    this.errors.clear();
  }
}

/**
 * Session state monitoring
 */
export class SessionMonitor {
  static monitorSession(sessionId: string): void {
    Logger.info('Session monitoring started', { sessionId });

    // Track session creation time
    const createdAt = Date.now();

    // Setup periodic health checks
    const healthCheckInterval = setInterval(async () => {
      try {
        // Check session health
        const sessionAge = Date.now() - createdAt;
        
        Logger.info('Session health check', {
          sessionId,
          age: sessionAge,
          ageMinutes: Math.floor(sessionAge / 60000),
        });

        // Warn if session is very old (>24 hours)
        if (sessionAge > 86400000) {
          Logger.warn('Long-running session detected', {
            sessionId,
            ageHours: Math.floor(sessionAge / 3600000),
          });
        }
      } catch (error) {
        ErrorTracker.track(error as Error, 'session_health_check');
      }
    }, 300000); // Every 5 minutes

    // Cleanup on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(healthCheckInterval);
        Logger.info('Session monitoring stopped', { sessionId });
      });
    }
  }
}

/**
 * Export metrics for debugging
 */
export function exportDiagnostics(): {
  performance: Record<string, any>;
  errors: Record<string, number>;
  logs: any[];
} {
  return {
    performance: PerformanceMonitor.getMetrics(),
    errors: ErrorTracker.getErrorStats(),
    logs: Logger.getLogs(),
  };
}

/**
 * Enable debug mode
 */
export function enableDebugMode(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('mixxmaster_debug', 'true');
    console.log('MixxMaster debug mode enabled');
    console.log('View diagnostics with: exportDiagnostics()');
  }
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('mixxmaster_debug') === 'true';
  }
  return false;
}
