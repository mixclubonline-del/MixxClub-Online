interface ErrorContext {
  userId?: string;
  userRole?: string;
  page?: string;
  component?: string;
  action?: string;
  timestamp: string;
}

interface ErrorLog {
  error: Error;
  context: ErrorContext;
}

class ErrorLogger {
  private errorQueue: ErrorLog[] = [];
  private lastLogTime = 0;
  private readonly RATE_LIMIT_MS = 1000; // Max 1 error per second

  log(error: Error, context: Partial<ErrorContext> = {}) {
    const now = Date.now();
    
    // Rate limiting
    if (now - this.lastLogTime < this.RATE_LIMIT_MS) {
      this.errorQueue.push({
        error,
        context: { ...context, timestamp: new Date().toISOString() }
      });
      return;
    }

    this.lastLogTime = now;
    this.processError(error, context);

    // Process queued errors
    if (this.errorQueue.length > 0) {
      const queued = this.errorQueue.shift();
      if (queued) {
        setTimeout(() => this.processError(queued.error, queued.context), this.RATE_LIMIT_MS);
      }
    }
  }

  private processError(error: Error, context: Partial<ErrorContext>) {
    const fullContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      ...context,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.group('🔴 Error logged');
      console.error('Error:', error);
      console.table(fullContext);
      console.groupEnd();
    }

    // In production, you would send this to your monitoring service
    // Example: Sentry, LogRocket, Datadog, etc.
    if (import.meta.env.PROD) {
      // TODO: Integrate with your error monitoring service
      // Example: Sentry.captureException(error, { contexts: { custom: fullContext } });
    }
  }

  // Log performance issues
  logPerformance(metric: string, value: number, context: Partial<ErrorContext> = {}) {
    if (import.meta.env.DEV) {
      console.log(`⚡ Performance: ${metric} = ${value}ms`, context);
    }

    // In production, send to analytics
    if (import.meta.env.PROD) {
      // TODO: Send to analytics service
    }
  }

  // Log user actions for debugging
  logAction(action: string, data: any = {}) {
    if (import.meta.env.DEV) {
      console.log(`🎯 Action: ${action}`, data);
    }
  }
}

export const errorLogger = new ErrorLogger();