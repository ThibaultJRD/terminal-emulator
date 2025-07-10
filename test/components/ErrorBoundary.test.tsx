import { describe, expect, it, vi } from 'vitest';

import { TerminalErrorBoundary, useErrorHandler } from '~/routes/terminal/components/ErrorBoundary';

describe('TerminalErrorBoundary (Unit Tests)', () => {
  it('should be importable', () => {
    expect(TerminalErrorBoundary).toBeDefined();
    expect(typeof TerminalErrorBoundary).toBe('function');
  });

  it('should have required methods', () => {
    const errorBoundary = new TerminalErrorBoundary({ children: null });
    expect(typeof errorBoundary.render).toBe('function');
    expect(typeof errorBoundary.componentDidCatch).toBe('function');
  });
});

describe('useErrorHandler', () => {
  it('should return error handler function', () => {
    const errorHandler = useErrorHandler();
    expect(typeof errorHandler).toBe('function');
  });

  it('should log errors to console', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorHandler = useErrorHandler();
    const testError = new Error('Test error');
    const errorInfo = { componentStack: 'test stack' };

    errorHandler(testError, errorInfo);

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error in terminal:', testError, errorInfo);

    consoleSpy.mockRestore();
  });

  it('should handle errors without errorInfo', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorHandler = useErrorHandler();
    const testError = new Error('Test error');

    errorHandler(testError);

    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error in terminal:', testError, undefined);

    consoleSpy.mockRestore();
  });

  it('should handle production environment', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorHandler = useErrorHandler();
    const testError = new Error('Test error');

    errorHandler(testError);

    expect(consoleSpy).toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
    consoleSpy.mockRestore();
  });
});
