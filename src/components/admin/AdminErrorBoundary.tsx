import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Copy, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
  section?: string;
  navigate?: (path: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class AdminErrorBoundaryComponent extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin error caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleGoToDashboard = () => {
    if (this.props.navigate) {
      this.props.navigate('/admin');
    } else {
      const navigate = () => {
        const a = document.createElement('a');
        a.href = '/admin';
        a.click();
      };
      navigate();
    }
  };

  private copyErrorDetails = () => {
    const details = `
Error: ${this.state.error?.message}
Component Stack: ${this.state.errorInfo?.componentStack}
Section: ${this.props.section || 'Unknown'}
Timestamp: ${new Date().toISOString()}
    `.trim();
    
    navigator.clipboard.writeText(details);
  };

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      
      return (
        <div className="p-6">
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <CardTitle className="text-destructive">
                  {this.props.section 
                    ? `Error in ${this.props.section}` 
                    : 'Something went wrong'}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An error occurred while loading this admin section. This has been logged for review.
              </p>

              {isDev && this.state.error && (
                <details className="text-xs bg-destructive/10 p-3 rounded border border-destructive/20">
                  <summary className="cursor-pointer font-medium mb-2 text-destructive">
                    Error details (dev only)
                  </summary>
                  <div className="space-y-2 mt-2">
                    <div>
                      <div className="font-semibold">Message:</div>
                      <pre className="overflow-auto text-xs mt-1">{this.state.error.message}</pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <div className="font-semibold">Stack:</div>
                        <pre className="overflow-auto text-xs mt-1">{this.state.error.stack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={this.handleReset} size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoToDashboard} variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Button>
                <Button onClick={this.copyErrorDetails} variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Error
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://docs.lovable.dev', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AdminErrorBoundary: React.FC<Props> = (props) => {
  return <AdminErrorBoundaryComponent {...props} />;
};

// Lightweight error boundary for sections/cards
export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Section error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">Error loading this section</p>
                <p className="text-xs text-muted-foreground">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <Button onClick={this.handleReset} size="sm" variant="outline">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}