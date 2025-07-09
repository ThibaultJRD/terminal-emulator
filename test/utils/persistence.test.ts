import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createDefaultFileSystem, createFile, getNodeAtPath } from '~/routes/terminal/utils/filesystem';
import { clearFilesystemState, loadFilesystemState, saveFilesystemState } from '~/routes/terminal/utils/persistence';

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

describe('Persistence utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('saveFilesystemState and loadFilesystemState', () => {
    it('should save and restore filesystem with correct date objects', () => {
      const filesystem = createDefaultFileSystem();
      const mode = 'default' as const;
      const currentPath = ['home', 'user'];

      // Save the filesystem
      const saveResult = saveFilesystemState(filesystem.root, mode, currentPath);
      expect(saveResult.success).toBe(true);

      // Load the filesystem
      const loadResult = loadFilesystemState(mode);
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();

      if (loadResult.data) {
        // Check that dates are restored as Date objects
        expect(loadResult.data.filesystem.createdAt).toBeInstanceOf(Date);
        expect(loadResult.data.filesystem.modifiedAt).toBeInstanceOf(Date);

        // Check that children also have Date objects
        const homeDir = loadResult.data.filesystem.children?.home;
        expect(homeDir?.createdAt).toBeInstanceOf(Date);
        expect(homeDir?.modifiedAt).toBeInstanceOf(Date);

        // Check nested children
        const userDir = homeDir?.children?.user;
        expect(userDir?.createdAt).toBeInstanceOf(Date);
        expect(userDir?.modifiedAt).toBeInstanceOf(Date);

        // Check a file
        const documentsDir = userDir?.children?.documents;
        const readmeFile = documentsDir?.children?.['readme.txt'];
        expect(readmeFile?.createdAt).toBeInstanceOf(Date);
        expect(readmeFile?.modifiedAt).toBeInstanceOf(Date);

        // Check that other properties are preserved
        expect(loadResult.data.mode).toBe(mode);
        expect(loadResult.data.currentPath).toEqual(currentPath);
      }
    });

    it('should handle missing dates by creating new ones', () => {
      // Create a filesystem with missing dates
      const filesystem = createDefaultFileSystem();

      // Manually remove dates to simulate corrupted data
      const corruptedData = {
        filesystem: {
          ...filesystem.root,
          createdAt: undefined,
          modifiedAt: undefined,
        },
        mode: 'default' as const,
        version: '1.0.0',
        savedAt: new Date().toISOString(),
        currentPath: ['home', 'user'],
      };

      // Save corrupted data directly to localStorage
      localStorage.setItem('terminal-emulator-filesystem-default', JSON.stringify(corruptedData));

      // Load should still work and create new dates
      const loadResult = loadFilesystemState('default');
      expect(loadResult.success).toBe(true);
      expect(loadResult.data?.filesystem.createdAt).toBeInstanceOf(Date);
      expect(loadResult.data?.filesystem.modifiedAt).toBeInstanceOf(Date);
    });

    it('should handle string dates from JSON serialization', () => {
      const filesystem = createDefaultFileSystem();
      const mode = 'default' as const;
      const currentPath = ['home', 'user'];

      // Save normally first
      saveFilesystemState(filesystem.root, mode, currentPath);

      // Get the stored data as string and parse it (simulating localStorage behavior)
      const storedString = localStorage.getItem('terminal-emulator-filesystem-default');
      expect(storedString).toBeTruthy();

      if (storedString) {
        const parsedData = JSON.parse(storedString);

        // Verify that dates are now strings (this is what JSON.parse does)
        expect(typeof parsedData.filesystem.createdAt).toBe('string');
        expect(typeof parsedData.filesystem.modifiedAt).toBe('string');

        // Now load and verify dates are restored as Date objects
        const loadResult = loadFilesystemState('default');
        expect(loadResult.success).toBe(true);
        expect(loadResult.data?.filesystem.createdAt).toBeInstanceOf(Date);
        expect(loadResult.data?.filesystem.modifiedAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('clearFilesystemState', () => {
    it('should clear saved filesystem state', () => {
      const filesystem = createDefaultFileSystem();
      const mode = 'default' as const;
      const currentPath = ['home', 'user'];

      // Save first
      saveFilesystemState(filesystem.root, mode, currentPath);
      expect(localStorage.getItem('terminal-emulator-filesystem-default')).toBeTruthy();

      // Clear
      const clearResult = clearFilesystemState('default');
      expect(clearResult.success).toBe(true);
      expect(localStorage.getItem('terminal-emulator-filesystem-default')).toBeNull();
    });
  });

  describe('Editor modification persistence', () => {
    it('should handle file creation via createFile and persist correctly', () => {
      const filesystem = createDefaultFileSystem();
      const mode = 'default' as const;
      const currentPath = ['home', 'user'];

      // Simulate what happens when editor saves a file
      const success = createFile(filesystem, currentPath, 'edited-file.txt', 'This file was edited in nano');
      expect(success).toBe(true);

      // Save the filesystem (simulating what handleTextEditorSave does)
      const saveResult = saveFilesystemState(filesystem.root, mode, currentPath);
      expect(saveResult.success).toBe(true);

      // Load the filesystem (simulating page refresh)
      const loadResult = loadFilesystemState(mode);
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();

      if (loadResult.data) {
        // Create a new filesystem state from loaded data
        const newFilesystem = {
          root: loadResult.data.filesystem,
          currentPath: loadResult.data.currentPath,
        };

        // Verify the edited file still exists after loading
        const restoredFile = getNodeAtPath(newFilesystem, ['home', 'user', 'edited-file.txt']);
        expect(restoredFile).toBeTruthy();
        expect(restoredFile?.type).toBe('file');
        expect(restoredFile?.content).toBe('This file was edited in nano');

        // Verify dates are restored as Date objects
        expect(restoredFile?.createdAt).toBeInstanceOf(Date);
        expect(restoredFile?.modifiedAt).toBeInstanceOf(Date);
      }
    });

    it('should handle file modification and preserve updated content', () => {
      const filesystem = createDefaultFileSystem();
      const mode = 'default' as const;
      const currentPath = ['home', 'user'];

      // Create initial file
      createFile(filesystem, currentPath, 'test-edit.txt', 'Original content');

      // Modify the file (simulating editor save)
      const modifySuccess = createFile(filesystem, currentPath, 'test-edit.txt', 'Modified content from editor');
      expect(modifySuccess).toBe(true);

      // Save and reload
      saveFilesystemState(filesystem.root, mode, currentPath);
      const loadResult = loadFilesystemState(mode);
      expect(loadResult.success).toBe(true);

      if (loadResult.data) {
        const newFilesystem = {
          root: loadResult.data.filesystem,
          currentPath: loadResult.data.currentPath,
        };

        const restoredFile = getNodeAtPath(newFilesystem, ['home', 'user', 'test-edit.txt']);
        expect(restoredFile?.content).toBe('Modified content from editor');
      }
    });
  });
});
