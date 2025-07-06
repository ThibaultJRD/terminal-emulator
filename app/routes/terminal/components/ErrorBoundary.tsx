import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error boundary component for graceful error handling in the terminal
 */
export class TerminalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('Terminal Error Boundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorReportingService(error, errorInfo);
    }
  }

  private handleReload = () => {
    // Reset the error boundary
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });

    // Optionally reload the page
    window.location.reload();
  };

  private handleReset = () => {
    // Just reset the error boundary without reloading
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI with terminal theme
      return (
        <div className="min-h-screen bg-[var(--color-ctp-base)] p-8 font-mono text-[var(--color-ctp-text)]">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8">
              <h1 className="mb-4 text-2xl font-bold text-[var(--color-ctp-red)]">Terminal Error</h1>
              <p className="mb-4 text-[var(--color-ctp-subtext0)]">
                Something went wrong in the terminal emulator. This error has been logged for investigation.
              </p>
            </div>

            <div className="mb-6 rounded-lg border border-[var(--color-ctp-surface1)] bg-[var(--color-ctp-surface0)] p-6">
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-ctp-yellow)]">Error Details</h2>

              {this.state.error && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-[var(--color-ctp-subtext1)]">Error Message:</h3>
                  <pre className="overflow-x-auto rounded bg-[var(--color-ctp-mantle)] p-3 text-sm text-[var(--color-ctp-red)]">{this.state.error.message}</pre>
                </div>
              )}

              {this.state.error?.stack && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-medium text-[var(--color-ctp-subtext1)]">Stack Trace:</h3>
                  <pre className="max-h-40 overflow-x-auto overflow-y-auto rounded bg-[var(--color-ctp-mantle)] p-3 text-xs text-[var(--color-ctp-subtext0)]">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              {process.env.NODE_ENV === 'development' && this.state.errorInfo?.componentStack && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-[var(--color-ctp-subtext1)]">Component Stack:</h3>
                  <pre className="max-h-40 overflow-x-auto overflow-y-auto rounded bg-[var(--color-ctp-mantle)] p-3 text-xs text-[var(--color-ctp-subtext0)]">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={this.handleReset}
                className="rounded bg-[var(--color-ctp-blue)] px-4 py-2 text-[var(--color-ctp-base)] transition-colors hover:bg-[var(--color-ctp-sapphire)]"
              >
                Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="rounded bg-[var(--color-ctp-green)] px-4 py-2 text-[var(--color-ctp-base)] transition-colors hover:bg-[var(--color-ctp-teal)]"
              >
                Reload Page
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="rounded bg-[var(--color-ctp-surface1)] px-4 py-2 text-[var(--color-ctp-text)] transition-colors hover:bg-[var(--color-ctp-surface2)]"
              >
                Go Home
              </button>
            </div>

            <div className="mt-8 text-sm text-[var(--color-ctp-subtext0)]">
              <p>
                If this error persists, please report it on our{' '}
                <a
                  href="https://github.com/your-repo/issues"
                  className="text-[var(--color-ctp-blue)] underline hover:text-[var(--color-ctp-sapphire)]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub issues page
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Unhandled error in terminal:', error, errorInfo);

    // In a real app, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorReportingService(error, errorInfo);
    }
  };
}
