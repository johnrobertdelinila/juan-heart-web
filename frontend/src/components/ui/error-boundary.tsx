'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * Fallback UI to display when an error occurs
   */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /**
   * Whether to show error details in production
   */
  showDetails?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback
export function DefaultErrorFallback({
  error,
  resetError,
  showDetails = false,
}: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive size-6" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>An unexpected error occurred. Please try again.</CardDescription>
        </CardHeader>
        {showDetails && (
          <CardContent>
            <div className="bg-muted rounded-md p-4">
              <p className="text-destructive mb-2 font-mono text-sm font-semibold">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="text-muted-foreground overflow-x-auto text-xs">
                  <code>{error.stack}</code>
                </pre>
              )}
            </div>
          </CardContent>
        )}
        <CardFooter className="flex gap-2">
          <Button onClick={resetError}>
            <RefreshCw className="mr-2 size-4" />
            Try Again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            <Home className="mr-2 size-4" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Minimal error fallback
export function MinimalErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-4 rounded-lg border p-8 text-center">
      <AlertTriangle className="text-destructive size-12" />
      <div>
        <h3 className="text-lg font-semibold">Error Loading Content</h3>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
      <Button size="sm" onClick={resetError}>
        Try Again
      </Button>
    </div>
  );
}

// Healthcare-specific error fallback
export function ClinicalErrorFallback({ error, resetError, showDetails }: ErrorFallbackProps) {
  const isNetworkError =
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('fetch');
  const isDataError =
    error.message.toLowerCase().includes('data') ||
    error.message.toLowerCase().includes('validation');

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="border-destructive w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive size-6" />
            <CardTitle className="text-destructive">
              {isNetworkError
                ? 'Connection Error'
                : isDataError
                  ? 'Data Validation Error'
                  : 'System Error'}
            </CardTitle>
          </div>
          <CardDescription>
            {isNetworkError && (
              <>
                Unable to connect to the server. Please check your internet connection and try
                again.
              </>
            )}
            {isDataError && (
              <>
                There was a problem with the assessment data. Please verify the information and try
                again.
              </>
            )}
            {!isNetworkError && !isDataError && (
              <>
                An unexpected error occurred while processing your request. Our team has been
                notified.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-warning/10 rounded-md p-4">
            <p className="text-sm font-medium">⚠️ Important</p>
            <p className="text-muted-foreground mt-1 text-sm">
              If you were in the middle of validating a patient assessment or creating a referral,
              your progress may not have been saved. Please review your recent actions.
            </p>
          </div>
          {showDetails && (
            <div className="bg-muted mt-4 rounded-md p-4">
              <p className="text-destructive mb-2 font-mono text-xs font-semibold">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="text-muted-foreground overflow-x-auto text-xs">
                  <code>{error.stack}</code>
                </pre>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={resetError}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/dashboard')}>
            <Home className="mr-2 size-4" />
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = '/support')}>
            <Bug className="mr-2 size-4" />
            Report Issue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Inline error component (for non-critical errors)
export interface InlineErrorProps {
  /**
   * Error title
   */
  title?: string;
  /**
   * Error message
   */
  message: string;
  /**
   * Retry callback
   */
  onRetry?: () => void;
  /**
   * Whether to show the error icon
   */
  showIcon?: boolean;
  /**
   * Additional className
   */
  className?: string;
}

export function InlineError({
  title = 'Error',
  message,
  onRetry,
  showIcon = true,
  className,
}: InlineErrorProps) {
  return (
    <div
      className={`border-destructive/20 bg-destructive/5 rounded-lg border p-4 ${className || ''}`}
    >
      <div className="flex gap-3">
        {showIcon && <AlertTriangle className="text-destructive size-5 shrink-0" />}
        <div className="flex-1">
          <p className="text-destructive font-semibold">{title}</p>
          <p className="text-muted-foreground mt-1 text-sm">{message}</p>
          {onRetry && (
            <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
              <RefreshCw className="mr-2 size-3" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty state component (for no data scenarios)
export interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  /**
   * Title of the empty state
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Action button
   */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mt-2 text-sm">{description}</p>}
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
