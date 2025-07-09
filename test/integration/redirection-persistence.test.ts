import { beforeEach, describe, expect, it, vi } from 'vitest';

import { executeCommand } from '~/routes/terminal/utils/commands';
import { createDefaultFileSystem, getNodeAtPath } from '~/routes/terminal/utils/filesystem';
import { loadFilesystemState, saveFilesystemState } from '~/routes/terminal/utils/persistence';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Redirection Persistence Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('Output redirection file creation', () => {
    it('should create file with echo redirection and persist correctly', () => {
      const filesystem = createDefaultFileSystem();

      // Execute echo with redirection
      const result = executeCommand('echo "Hello World" > hello.txt', filesystem);
      expect(result.success).toBe(true);

      // Verify file was created in memory
      const helloFile = getNodeAtPath(filesystem, ['home', 'user', 'hello.txt']);
      expect(helloFile).toBeTruthy();
      expect(helloFile?.type).toBe('file');
      expect(helloFile?.content).toBe('Hello World\n');

      // Save the filesystem
      const saveResult = saveFilesystemState(filesystem.root, 'default', filesystem.currentPath);
      expect(saveResult.success).toBe(true);

      // Load the filesystem (simulating page refresh)
      const loadResult = loadFilesystemState('default');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();

      if (loadResult.data) {
        // Create a new filesystem state from loaded data
        const newFilesystem = {
          root: loadResult.data.filesystem,
          currentPath: loadResult.data.currentPath,
        };

        // Verify the file still exists after loading
        const restoredFile = getNodeAtPath(newFilesystem, ['home', 'user', 'hello.txt']);
        expect(restoredFile).toBeTruthy();
        expect(restoredFile?.type).toBe('file');
        expect(restoredFile?.content).toBe('Hello World\n');

        // Verify dates are restored as Date objects
        expect(restoredFile?.createdAt).toBeInstanceOf(Date);
        expect(restoredFile?.modifiedAt).toBeInstanceOf(Date);
      }
    });

    it('should handle append redirection correctly', () => {
      const filesystem = createDefaultFileSystem();

      // Create initial file
      executeCommand('echo "Line 1" > test.txt', filesystem);

      // Append to file
      const result = executeCommand('echo "Line 2" >> test.txt', filesystem);
      expect(result.success).toBe(true);

      // Verify content
      const testFile = getNodeAtPath(filesystem, ['home', 'user', 'test.txt']);
      expect(testFile?.content).toBe('Line 1\nLine 2\n');

      // Test persistence
      const saveResult = saveFilesystemState(filesystem.root, 'default', filesystem.currentPath);
      expect(saveResult.success).toBe(true);

      const loadResult = loadFilesystemState('default');
      expect(loadResult.success).toBe(true);

      if (loadResult.data) {
        const newFilesystem = {
          root: loadResult.data.filesystem,
          currentPath: loadResult.data.currentPath,
        };

        const restoredFile = getNodeAtPath(newFilesystem, ['home', 'user', 'test.txt']);
        expect(restoredFile?.content).toBe('Line 1\nLine 2\n');
      }
    });

    it('should handle ls redirection correctly', () => {
      const filesystem = createDefaultFileSystem();

      // Execute ls with redirection
      const result = executeCommand('ls > listing.txt', filesystem);
      expect(result.success).toBe(true);

      // Verify listing file was created
      const listingFile = getNodeAtPath(filesystem, ['home', 'user', 'listing.txt']);
      expect(listingFile).toBeTruthy();
      expect(listingFile?.type).toBe('file');
      expect(listingFile?.content).toContain('documents');
      expect(listingFile?.content).toContain('downloads');

      // Test persistence
      const saveResult = saveFilesystemState(filesystem.root, 'default', filesystem.currentPath);
      expect(saveResult.success).toBe(true);

      const loadResult = loadFilesystemState('default');
      expect(loadResult.success).toBe(true);

      if (loadResult.data) {
        const newFilesystem = {
          root: loadResult.data.filesystem,
          currentPath: loadResult.data.currentPath,
        };

        const restoredFile = getNodeAtPath(newFilesystem, ['home', 'user', 'listing.txt']);
        expect(restoredFile?.content).toContain('documents');
        expect(restoredFile?.content).toContain('downloads');
      }
    });
  });
});
