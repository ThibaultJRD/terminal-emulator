import { describe, expect, it, vi } from 'vitest';

// Simple test without @testing-library to avoid dependency issues
describe('Terminal Component (Unit Tests)', () => {
  it('should be importable', async () => {
    const { Terminal } = await import('~/routes/terminal/components/Terminal');
    expect(Terminal).toBeDefined();
    expect(typeof Terminal).toBe('function');
  });
});
