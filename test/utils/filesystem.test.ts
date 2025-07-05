import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import {
  createDefaultFileSystem,
  createDirectory,
  createFile,
  deleteNode,
  formatPath,
  getCurrentDirectory,
  getNodeAtPath,
  resolvePath,
} from '~/routes/terminal/utils/filesystem';

describe('Filesystem utilities', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = createDefaultFileSystem();
  });

  describe('createDefaultFileSystem', () => {
    it('should create a default filesystem structure', () => {
      expect(filesystem.root.name).toBe('/');
      expect(filesystem.root.type).toBe('directory');
      expect(filesystem.currentPath).toEqual(['home', 'user']);
      expect(filesystem.root.children).toBeDefined();
      expect(filesystem.root.children!['home']).toBeDefined();
      expect(filesystem.root.children!['home'].children!['user']).toBeDefined();
    });

    it('should have default files in the filesystem', () => {
      const userDir = getNodeAtPath(filesystem, ['home', 'user']);
      expect(userDir).toBeDefined();
      expect(userDir!.children!['documents']).toBeDefined();
      expect(userDir!.children!['.secret']).toBeDefined();

      const documentsDir = getNodeAtPath(filesystem, ['home', 'user', 'documents']);
      expect(documentsDir!.children!['readme.txt']).toBeDefined();
      expect(documentsDir!.children!['example.md']).toBeDefined();
    });
  });

  describe('getNodeAtPath', () => {
    it('should return the correct node for a valid path', () => {
      const node = getNodeAtPath(filesystem, ['home', 'user']);
      expect(node).toBeDefined();
      expect(node!.name).toBe('user');
      expect(node!.type).toBe('directory');
    });

    it('should return null for an invalid path', () => {
      const node = getNodeAtPath(filesystem, ['nonexistent', 'path']);
      expect(node).toBeNull();
    });

    it('should return root for empty path', () => {
      const node = getNodeAtPath(filesystem, []);
      expect(node).toBe(filesystem.root);
    });
  });

  describe('getCurrentDirectory', () => {
    it('should return the current directory', () => {
      const currentDir = getCurrentDirectory(filesystem);
      expect(currentDir).toBeDefined();
      expect(currentDir!.name).toBe('user');
    });

    it('should return null if current path is invalid', () => {
      filesystem.currentPath = ['invalid', 'path'];
      const currentDir = getCurrentDirectory(filesystem);
      expect(currentDir).toBeNull();
    });
  });

  describe('resolvePath', () => {
    it('should resolve absolute paths', () => {
      const path = resolvePath(filesystem, '/home/user/documents');
      expect(path).toEqual(['home', 'user', 'documents']);
    });

    it('should resolve relative paths', () => {
      const path = resolvePath(filesystem, 'documents');
      expect(path).toEqual(['home', 'user', 'documents']);
    });

    it('should resolve parent directory (..) paths', () => {
      const path = resolvePath(filesystem, '..');
      expect(path).toEqual(['home']);
    });

    it('should resolve current directory (.) paths', () => {
      const path = resolvePath(filesystem, '.');
      expect(path).toEqual(['home', 'user']);
    });

    it('should resolve complex relative paths', () => {
      const path = resolvePath(filesystem, '../user/documents');
      expect(path).toEqual(['home', 'user', 'documents']);
    });
  });

  describe('formatPath', () => {
    it('should format root path', () => {
      const formatted = formatPath([]);
      expect(formatted).toBe('/');
    });

    it('should format non-root paths', () => {
      const formatted = formatPath(['home', 'user']);
      expect(formatted).toBe('/home/user');
    });
  });

  describe('createFile', () => {
    it('should create a new file', () => {
      const success = createFile(filesystem, ['home', 'user'], 'test.txt', 'test content');
      expect(success).toBe(true);

      const file = getNodeAtPath(filesystem, ['home', 'user'])!.children!['test.txt'];
      expect(file).toBeDefined();
      expect(file.type).toBe('file');
      expect(file.content).toBe('test content');
      expect(file.size).toBe(12);
    });

    it('should not create file in invalid directory', () => {
      const success = createFile(filesystem, ['invalid', 'path'], 'test.txt', 'content');
      expect(success).toBe(false);
    });
  });

  describe('createDirectory', () => {
    it('should create a new directory', () => {
      const success = createDirectory(filesystem, ['home', 'user'], 'testdir');
      expect(success).toBe(true);

      const dir = getNodeAtPath(filesystem, ['home', 'user'])!.children!['testdir'];
      expect(dir).toBeDefined();
      expect(dir.type).toBe('directory');
      expect(dir.children).toBeDefined();
    });

    it('should not create directory in invalid path', () => {
      const success = createDirectory(filesystem, ['invalid', 'path'], 'testdir');
      expect(success).toBe(false);
    });
  });

  describe('deleteNode', () => {
    it('should delete an existing file', () => {
      // First create a file
      createFile(filesystem, ['home', 'user'], 'temp.txt', 'temp');

      const success = deleteNode(filesystem, ['home', 'user'], 'temp.txt');
      expect(success).toBe(true);

      const file = getNodeAtPath(filesystem, ['home', 'user'])!.children!['temp.txt'];
      expect(file).toBeUndefined();
    });

    it('should delete an existing directory', () => {
      // First create a directory
      createDirectory(filesystem, ['home', 'user'], 'tempdir');

      const success = deleteNode(filesystem, ['home', 'user'], 'tempdir');
      expect(success).toBe(true);

      const dir = getNodeAtPath(filesystem, ['home', 'user'])!.children!['tempdir'];
      expect(dir).toBeUndefined();
    });

    it('should return false for non-existent node', () => {
      const success = deleteNode(filesystem, ['home', 'user'], 'nonexistent');
      expect(success).toBe(false);
    });
  });
});
