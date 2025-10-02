export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

interface LogContext {
  functionName?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private context: LogContext = {};
  
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }
  
  private log(level: LogLevel, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...(data && { data })
    };
    
    console.log(JSON.stringify(logEntry));
  }
  
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
  }
  
  performance(operation: string, durationMs: number, metadata?: any): void {
    this.info(`Performance: ${operation}`, {
      durationMs,
      ...metadata
    });
  }
}

export function createLogger(functionName: string): Logger {
  const logger = new Logger();
  logger.setContext({ functionName });
  return logger;
}
