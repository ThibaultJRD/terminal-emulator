import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { createDefaultFileSystem } from '~/routes/terminal/utils/filesystem';

// Mock the persistence module
vi.mock('~/routes/terminal/utils/persistence', () => ({
  saveFilesystemState: vi.fn(),
  initializeFilesystem: vi.fn(() => ({
    filesystem: { type: 'directory', children: {}, modifiedAt: new Date() },
    mode: 'default',
    currentPath: [],
  })),
}));

describe('useFilesystemPersistence (Unit Tests)', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = createDefaultFileSystem();
    vi.clearAllMocks();
  });

  it('should be importable', async () => {
    const { useFilesystemPersistence } = await import('~/routes/terminal/hooks/useFilesystemPersistence');
    expect(useFilesystemPersistence).toBeDefined();
    expect(typeof useFilesystemPersistence).toBe('function');
  });
});
