import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { executeCommand } from '~/routes/terminal/utils/commands';
import { createDefaultFileSystem, createFile } from '~/routes/terminal/utils/filesystem';

describe('Pipe Operations Integration', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = createDefaultFileSystem();
  });

  describe('Basic piping', () => {
    it('should pipe ls output to grep', () => {
      // Create test files
      createFile(filesystem, ['home', 'user'], 'test.txt', 'Hello world');
      createFile(filesystem, ['home', 'user'], 'example.md', '# Example');
      createFile(filesystem, ['home', 'user'], 'data.json', '{"key": "value"}');
      createFile(filesystem, ['home', 'user'], 'script.sh', '#!/bin/bash\necho "hello"');

      const result = executeCommand('ls | grep test', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toContain('test.txt');
      expect(result.exitCode).toBe(0);
    });

    it('should pipe cat output to grep', () => {
      createFile(filesystem, ['home', 'user'], 'test.txt', 'Hello world\nThis is a test\nAnother line');

      const result = executeCommand('cat test.txt | grep test', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('This is a test');
      expect(result.exitCode).toBe(0);
    });

    it('should pipe output through multiple commands', () => {
      createFile(filesystem, ['home', 'user'], 'numbers.txt', '3\n1\n4\n1\n5\n9\n2\n6');

      const result = executeCommand('cat numbers.txt | sort | uniq', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('1\n2\n3\n4\n5\n6\n9');
      expect(result.exitCode).toBe(0);
    });

    it('should handle grep with flags in pipe', () => {
      createFile(filesystem, ['home', 'user'], 'mixed.txt', 'Hello\nWORLD\nTest\ntest\nEXAMPLE');

      const result = executeCommand('cat mixed.txt | grep -i test', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('Test\ntest');
      expect(result.exitCode).toBe(0);
    });

    it('should handle head command in pipe', () => {
      createFile(filesystem, ['home', 'user'], 'lines.txt', '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12');

      const result = executeCommand('cat lines.txt | head -5', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('1\n2\n3\n4\n5');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Error handling in pipes', () => {
    it('should fail when first command fails', () => {
      const result = executeCommand('cat nonexistent.txt | grep test', filesystem);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it('should handle grep with no matches', () => {
      createFile(filesystem, ['home', 'user'], 'test.txt', 'Hello world\nThis is a test');

      const result = executeCommand('cat test.txt | grep nonexistent', filesystem);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.output).toBe('');
    });

    it('should handle invalid grep pattern in pipe', () => {
      createFile(filesystem, ['home', 'user'], 'test.txt', 'Hello world');

      const result = executeCommand('cat test.txt | grep "["', filesystem);
      expect(result.success).toBe(false);
      // The pipe should return the exit code from the failing command (grep)
      expect(result.exitCode).toBe(2);
    });
  });
});
