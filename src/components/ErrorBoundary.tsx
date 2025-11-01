import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { stateManager } from '@/utils/stateManager';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Save error state
    const errorCount = this.state.errorCount + 1;
    this.setState({ errorInfo, errorCount });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Save crash report
    stateManager.saveState('last_crash', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: Date.now(),
      errorCount
    }, 0);

    // If too many errors, clear all state to recover
    if (errorCount >= 3) {
      console.warn('Multiple errors detected, clearing state to recover');
      stateManager.clearAllState();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-background-secondary">
          <div className="glass-card p-8 max-w-2xl w-full space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Something went wrong</h1>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                The application encountered an unexpected error. Don't worry, your work has been saved
                and you can continue where you left off.
              </p>

              {this.state.error && (
                <details className="glass-card p-4 space-y-2">
                  <summary className="cursor-pointer font-semibold text-sm">
                    Error Details
                  </summary>
                  <pre className="text-xs overflow-auto p-4 bg-background/50 rounded">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex gap-3 flex-wrap">
                <Button onClick={this.handleReset} className="transition-smooth">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  Reload Page
                </Button>
              </div>

              {this.state.errorCount >= 2 && (
                <div className="glass-card p-4 border-l-4 border-warning">
                  <p className="text-sm text-warning">
                    Multiple errors detected. If the problem persists after reloading, 
                    your state will be automatically reset to recover the application.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
