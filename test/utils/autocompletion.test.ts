import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { applyCompletion, getAutocompletions } from '~/routes/terminal/utils/autocompletion';
import { createDefaultFileSystem, createDirectory, createFile } from '~/routes/terminal/utils/filesystem';

describe('Autocompletion', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = createDefaultFileSystem();
    // Add some test files for completion
    createFile(filesystem, ['home', 'user'], 'test1.txt', 'content1');
    createFile(filesystem, ['home', 'user'], 'test2.txt', 'content2');
    createFile(filesystem, ['home', 'user'], 'readme.md', 'markdown content');
    createDirectory(filesystem, ['home', 'user'], 'testdir');
  });

  describe('Command completion', () => {
    it('should complete command names', () => {
      const result = getAutocompletions('l', filesystem);
      expect(result.completions).toContain('ls');
      expect(result.completions.length).toBeGreaterThan(0);
    });

    it('should complete partial command names', () => {
      const result = getAutocompletions('ec', filesystem);
      expect(result.completions).toContain('echo');
    });

    it('should return all commands for empty input', () => {
      const result = getAutocompletions('', filesystem);
      expect(result.completions.length).toBeGreaterThan(5);
      expect(result.completions).toContain('ls');
      expect(result.completions).toContain('cd');
      expect(result.completions).toContain('cat');
    });

    it('should return common prefix for multiple matches', () => {
      const result = getAutocompletions('c', filesystem);
      expect(result.completions.filter((cmd) => cmd.startsWith('c')).length).toBeGreaterThan(1);
      expect(result.commonPrefix).toBe('c');
    });
  });

  describe('Path completion', () => {
    it('should complete file and directory names', () => {
      const result = getAutocompletions('ls test', filesystem);
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
      expect(result.completions).toContain('testdir/');
    });

    it('should complete with partial filename', () => {
      const result = getAutocompletions('cat test1', filesystem);
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).not.toContain('test2.txt');
    });

    it('should complete directory paths', () => {
      const result = getAutocompletions('cd doc', filesystem);
      expect(result.completions).toContain('documents/');
    });

    it('should complete only directories for cd command', () => {
      const result = getAutocompletions('cd test', filesystem);
      expect(result.completions).toContain('testdir/');
      expect(result.completions).not.toContain('test1.txt');
      expect(result.completions).not.toContain('test2.txt');
    });

    it('should complete only directories for cd command with empty path', () => {
      const result = getAutocompletions('cd ', filesystem);
      expect(result.completions).toContain('documents/');
      expect(result.completions).toContain('testdir/');
      expect(result.completions).not.toContain('test1.txt');
      expect(result.completions).not.toContain('test2.txt');
      expect(result.completions).not.toContain('readme.md');
    });

    it('should complete hidden directories for cd command with dot prefix', () => {
      const result = getAutocompletions('cd .', filesystem);
      expect(result.completions).not.toContain('.secret'); // This is a file
      expect(result.completions).not.toContain('.bashrc'); // This is a file
      // Add a hidden directory for testing
      createDirectory(filesystem, ['home', 'user'], '.config');
      const result2 = getAutocompletions('cd .', filesystem);
      expect(result2.completions).toContain('.config/');
      expect(result2.completions).not.toContain('.secret');
      expect(result2.completions).not.toContain('.bashrc');
    });

    it('should complete both files and directories for non-cd commands', () => {
      const result = getAutocompletions('ls test', filesystem);
      expect(result.completions).toContain('testdir/');
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
    });

    it('should complete only directories for mkdir command', () => {
      const result = getAutocompletions('mkdir test', filesystem);
      expect(result.completions).toContain('testdir/');
      expect(result.completions).not.toContain('test1.txt');
      expect(result.completions).not.toContain('test2.txt');
    });

    it('should complete only directories for rmdir command', () => {
      const result = getAutocompletions('rmdir test', filesystem);
      expect(result.completions).toContain('testdir/');
      expect(result.completions).not.toContain('test1.txt');
      expect(result.completions).not.toContain('test2.txt');
    });

    it('should complete only directories for mkdir with empty path', () => {
      const result = getAutocompletions('mkdir ', filesystem);
      expect(result.completions).toContain('documents/');
      expect(result.completions).toContain('testdir/');
      expect(result.completions).not.toContain('test1.txt');
      expect(result.completions).not.toContain('test2.txt');
      expect(result.completions).not.toContain('readme.md');
    });

    it('should complete only directories for rmdir with empty path', () => {
      const result = getAutocompletions('rmdir ', filesystem);
      expect(result.completions).toContain('documents/');
      expect(result.completions).toContain('testdir/');
      expect(result.completions).not.toContain('test1.txt');
      expect(result.completions).not.toContain('test2.txt');
      expect(result.completions).not.toContain('readme.md');
    });

    it('should complete both files and directories for rm command', () => {
      const result = getAutocompletions('rm test', filesystem);
      expect(result.completions).toContain('testdir/');
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
    });

    it('should complete both files and directories for touch command', () => {
      const result = getAutocompletions('touch test', filesystem);
      expect(result.completions).toContain('testdir/');
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
    });

    it('should complete both files and directories for vi command', () => {
      const result = getAutocompletions('vi test', filesystem);
      expect(result.completions).toContain('testdir/');
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
    });

    it('should complete files in subdirectories', () => {
      const result = getAutocompletions('cat documents/no', filesystem);
      expect(result.completions).toContain('documents/notes.md');
    });

    it('should handle absolute paths', () => {
      const result = getAutocompletions('ls /home/user/doc', filesystem);
      expect(result.completions).toContain('/home/user/documents/');
    });

    it('should complete hidden files with dot prefix', () => {
      const result = getAutocompletions('cat .', filesystem);
      expect(result.completions).toContain('.secret');
    });

    it('should NOT show hidden files without dot prefix', () => {
      const result = getAutocompletions('ls ', filesystem);
      expect(result.completions).not.toContain('.secret');
      expect(result.completions).not.toContain('.bashrc');
      // Should still show regular files
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
      expect(result.completions).toContain('testdir/');
    });

    it('should show hidden files when prefix starts with dot', () => {
      const result = getAutocompletions('ls .', filesystem);
      expect(result.completions).toContain('.secret');
      expect(result.completions).toContain('.bashrc');
      // Should NOT show regular files when prefix is dot
      expect(result.completions).not.toContain('test1.txt');
      expect(result.completions).not.toContain('test2.txt');
    });

    it('should filter hidden files by dot prefix', () => {
      const result = getAutocompletions('ls .s', filesystem);
      expect(result.completions).toContain('.secret');
      expect(result.completions).not.toContain('.bashrc');
      expect(result.completions).not.toContain('test1.txt');
    });
  });

  describe('Redirection completion', () => {
    it('should complete filenames after > operator', () => {
      const result = getAutocompletions('echo test > test', filesystem);
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
      expect(result.completions).toContain('testdir/');
    });

    it('should complete filenames after >> operator', () => {
      const result = getAutocompletions('echo test >> test', filesystem);
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
    });

    it('should complete only files (not directories) after < operator', () => {
      const result = getAutocompletions('wc < test', filesystem);
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');
      expect(result.completions).not.toContain('testdir/');
    });

    it('should not complete after << operator (heredoc)', () => {
      const result = getAutocompletions('cat << E', filesystem);
      expect(result.completions).toEqual([]);
    });

    it('should handle complex redirection with spaces', () => {
      const result = getAutocompletions('echo "hello world" > test', filesystem);
      expect(result.completions).toContain('test1.txt');
    });

    it('should NOT show hidden files in redirection without dot prefix', () => {
      const result = getAutocompletions('echo test > ', filesystem);
      expect(result.completions).not.toContain('.secret');
      expect(result.completions).not.toContain('.bashrc');
      expect(result.completions).toContain('test1.txt');
    });

    it('should show hidden files in redirection with dot prefix', () => {
      const result = getAutocompletions('echo test > .', filesystem);
      expect(result.completions).toContain('.secret');
      expect(result.completions).toContain('.bashrc');
      expect(result.completions).not.toContain('test1.txt');
    });

    it('should show all hidden files in input redirection with dot prefix', () => {
      const result = getAutocompletions('wc < .', filesystem);
      expect(result.completions).toContain('.secret');
      expect(result.completions).toContain('.bashrc');
      expect(result.completions).not.toContain('test1.txt');
    });

    it('should filter hidden files in input redirection by specific dot prefix', () => {
      const result = getAutocompletions('wc < .s', filesystem);
      expect(result.completions).toContain('.secret');
      expect(result.completions).not.toContain('.bashrc'); // .bashrc doesn't match .s prefix
      expect(result.completions).not.toContain('test1.txt');
    });
  });

  describe('Apply completion', () => {
    it('should apply command completion', () => {
      const result = applyCompletion('l', 'ls');
      expect(result).toBe('ls ');
    });

    it('should apply path completion', () => {
      const result = applyCompletion('cat test', 'test1.txt');
      expect(result).toBe('cat test1.txt');
    });

    it('should apply completion after redirection', () => {
      const result = applyCompletion('echo test > test', 'test1.txt');
      expect(result).toBe('echo test > test1.txt');
    });

    it('should handle complex command completion', () => {
      const result = applyCompletion('ls -la doc', 'documents/');
      expect(result).toBe('ls -la documents/');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const result = getAutocompletions('', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
    });

    it('should handle input with only spaces', () => {
      const result = getAutocompletions('   ', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
    });

    it('should handle non-existent command completion', () => {
      const result = getAutocompletions('xyz', filesystem);
      expect(result.completions).toEqual([]);
      expect(result.commonPrefix).toBe('');
    });

    it('should handle non-existent path completion', () => {
      const result = getAutocompletions('cat nonexistent', filesystem);
      expect(result.completions).toEqual([]);
    });

    it('should handle completion in different directories', () => {
      // Change to documents directory
      filesystem.currentPath = ['home', 'user', 'documents'];

      const result = getAutocompletions('cat read', filesystem);
      expect(result.completions).toContain('readme.txt');
    });

    it('should handle completion with various command types', () => {
      // Commands that should complete paths
      const pathCommands = ['cd', 'ls', 'cat', 'rm', 'rmdir', 'mkdir', 'touch'];

      for (const cmd of pathCommands) {
        const result = getAutocompletions(`${cmd} test`, filesystem);
        expect(result.completions.length).toBeGreaterThan(0);
      }
    });

    it('should not complete paths for commands that do not expect them', () => {
      const result = getAutocompletions('echo test', filesystem);
      expect(result.completions).toEqual([]);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle tab completion workflow', () => {
      // User types "cat doc" and presses tab
      let result = getAutocompletions('cat doc', filesystem);
      expect(result.completions).toContain('documents/');

      // Apply the completion
      let completed = applyCompletion('cat doc', 'documents/');
      expect(completed).toBe('cat documents/');

      // User continues typing "cat documents/no" and presses tab
      result = getAutocompletions('cat documents/no', filesystem);
      expect(result.completions).toContain('documents/notes.md');
    });

    it('should handle multiple possible completions', () => {
      const result = getAutocompletions('cat test', filesystem);
      expect(result.completions.length).toBeGreaterThan(1);
      expect(result.completions).toContain('test1.txt');
      expect(result.completions).toContain('test2.txt');

      // Common prefix should be 'test'
      expect(result.commonPrefix).toBe('test');
    });

    it('should handle redirection completion workflow', () => {
      // Create a file that matches the prefix
      createFile(filesystem, ['home', 'user'], 'output.txt', 'existing content');

      // User types command with output redirection
      const result = getAutocompletions('ls -la > output', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
      expect(result.completions).toContain('output.txt');

      // Apply completion for output file
      const completed = applyCompletion('ls -la > output', 'output.txt');
      expect(completed).toBe('ls -la > output.txt');
    });
  });
});
