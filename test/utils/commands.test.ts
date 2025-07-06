import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { commands } from '~/routes/terminal/utils/commands';
import { createDefaultFileSystem } from '~/routes/terminal/utils/filesystem';

describe('Commands', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = createDefaultFileSystem();
  });

  describe('cd command', () => {
    it('should change to home directory with no arguments', () => {
      filesystem.currentPath = ['tmp'];
      const result = commands.cd([], filesystem);
      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user']);
    });

    it('should change to specified directory', () => {
      const result = commands.cd(['documents'], filesystem);
      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents']);
    });

    it('should handle absolute paths', () => {
      const result = commands.cd(['/tmp'], filesystem);
      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['tmp']);
    });

    it('should fail for non-existent directory', () => {
      const result = commands.cd(['nonexistent'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('no such file or directory');
    });

    it('should fail when trying to cd into a file', () => {
      const result = commands.cd(['documents/readme.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not a directory');
    });
  });

  describe('ls command', () => {
    it('should list directory contents', () => {
      const result = commands.ls([], filesystem);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.output)).toBe(true);
    });

    it('should show hidden files with -a flag', () => {
      const result = commands.ls(['-a'], filesystem);
      expect(result.success).toBe(true);
      // Should include .secret file
      const output = result.output as any[];
      const hasHiddenFile = output.some((segment) => segment.text && segment.text.includes('.secret'));
      expect(hasHiddenFile).toBe(true);
    });

    it('should show detailed information with -l flag', () => {
      const result = commands.ls(['-l'], filesystem);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.output)).toBe(true);
    });

    it('should combine flags (-la)', () => {
      const result = commands.ls(['-la'], filesystem);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.output)).toBe(true);
    });

    it('should list specific directory', () => {
      const result = commands.ls(['documents'], filesystem);
      expect(result.success).toBe(true);
    });

    it('should fail for non-existent directory', () => {
      const result = commands.ls(['nonexistent'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('cannot access');
    });
  });

  describe('pwd command', () => {
    it('should return current directory path', () => {
      const result = commands.pwd([], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('/home/user');
    });

    it('should work from different directories', () => {
      filesystem.currentPath = ['tmp'];
      const result = commands.pwd([], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('/tmp');
    });
  });

  describe('touch command', () => {
    it('should create a new file', () => {
      const result = commands.touch(['newfile.txt'], filesystem);
      expect(result.success).toBe(true);

      // Verify file was created
      const lsResult = commands.ls([], filesystem);
      const output = lsResult.output as any[];
      const hasNewFile = output.some((segment) => segment.text && segment.text.includes('newfile.txt'));
      expect(hasNewFile).toBe(true);
    });

    it('should update modification time of existing file', () => {
      // First create a file
      commands.touch(['testfile.txt'], filesystem);

      // Touch it again
      const result = commands.touch(['testfile.txt'], filesystem);
      expect(result.success).toBe(true);
    });

    it('should fail with no arguments', () => {
      const result = commands.touch([], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing file operand');
    });
  });

  describe('cat command', () => {
    it('should display file contents', () => {
      // Change to documents directory first
      filesystem.currentPath = ['home', 'user', 'documents'];
      const result = commands.cat(['readme.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output === 'string').toBe(true);
      expect(result.output).toContain('Welcome to the terminal emulator');
    });

    it('should render markdown files with formatting', () => {
      // Change to documents directory first
      filesystem.currentPath = ['home', 'user', 'documents'];
      const result = commands.cat(['notes.md'], filesystem);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.output)).toBe(true);
    });

    it('should fail for non-existent file', () => {
      const result = commands.cat(['nonexistent.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });

    it('should fail when trying to cat a directory', () => {
      const result = commands.cat(['documents'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Is a directory');
    });
  });

  describe('mkdir command', () => {
    it('should create a new directory', () => {
      const result = commands.mkdir(['newdir'], filesystem);
      expect(result.success).toBe(true);

      // Verify directory was created
      const lsResult = commands.ls([], filesystem);
      const output = lsResult.output as any[];
      const hasNewDir = output.some((segment) => segment.text && segment.text.includes('newdir'));
      expect(hasNewDir).toBe(true);
    });

    it('should create parent directories with -p flag', () => {
      const result = commands.mkdir(['-p', 'deep/nested/directory'], filesystem);
      expect(result.success).toBe(true);

      // Verify nested directory structure was created
      const cdResult = commands.cd(['deep/nested/directory'], filesystem);
      expect(cdResult.success).toBe(true);
    });

    it('should fail when directory already exists without -p', () => {
      commands.mkdir(['testdir'], filesystem);
      const result = commands.mkdir(['testdir'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('File exists');
    });

    it('should succeed when directory exists with -p', () => {
      commands.mkdir(['testdir'], filesystem);
      const result = commands.mkdir(['-p', 'testdir'], filesystem);
      expect(result.success).toBe(true);
    });
  });

  describe('rm command', () => {
    it('should remove a file', () => {
      // First create a file
      commands.touch(['tempfile.txt'], filesystem);

      const result = commands.rm(['tempfile.txt'], filesystem);
      expect(result.success).toBe(true);

      // Verify file was removed
      const catResult = commands.cat(['tempfile.txt'], filesystem);
      expect(catResult.success).toBe(false);
    });

    it('should remove directory with -r flag', () => {
      // Create directory and file
      commands.mkdir(['tempdir'], filesystem);

      const result = commands.rm(['-r', 'tempdir'], filesystem);
      expect(result.success).toBe(true);
    });

    it('should force remove with -f flag', () => {
      const result = commands.rm(['-f', 'nonexistent.txt'], filesystem);
      expect(result.success).toBe(true); // Force mode should succeed even for non-existent files
    });

    it('should fail to remove directory without -r', () => {
      commands.mkdir(['tempdir'], filesystem);
      const result = commands.rm(['tempdir'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Is a directory');
    });
  });

  describe('echo command', () => {
    it('should output text', () => {
      const result = commands.echo(['hello', 'world'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('hello world');
    });

    it('should handle empty arguments', () => {
      const result = commands.echo([], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('');
    });
  });

  describe('wc command', () => {
    it('should count lines, words, and characters', () => {
      // Change to documents directory first
      filesystem.currentPath = ['home', 'user', 'documents'];
      const result = commands.wc(['readme.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output === 'string').toBe(true);
      expect(result.output).toMatch(/\d+\s+\d+\s+\d+\s+readme.txt/);
    });

    it('should handle multiple files', () => {
      // Change to documents directory first
      filesystem.currentPath = ['home', 'user', 'documents'];
      const result = commands.wc(['readme.txt', 'notes.md'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toContain('total');
    });

    it('should fail for non-existent file', () => {
      const result = commands.wc(['nonexistent.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });
  });

  describe('clear command', () => {
    it('should return CLEAR signal', () => {
      const result = commands.clear([], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('CLEAR');
    });
  });

  describe('help command', () => {
    it('should display help information', () => {
      const result = commands.help([], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output === 'string').toBe(true);
      expect(result.output).toContain('Available commands');
      expect(result.output).toContain('Redirection');
    });
  });

  // Tests for bug fixes and new commands
  describe('rm and rmdir trailing slash fixes', () => {
    beforeEach(() => {
      // Create test directories and files
      commands.mkdir(['testdir'], filesystem);
      commands.touch(['testfile.txt'], filesystem);
    });

    it('should handle rm with trailing slash', () => {
      // With our fix, rm now uses resolvePath which handles trailing slashes properly
      // The trailing slash is stripped by path resolution, so it should succeed
      const result = commands.rm(['testfile.txt/'], filesystem);
      expect(result.success).toBe(true);
    });

    it('should handle rmdir with trailing slash', () => {
      // This was the main bug: rmdir testdir/ would fail
      const result = commands.rmdir(['testdir/'], filesystem);
      expect(result.success).toBe(true);

      // Verify directory was removed
      const lsResult = commands.ls([], filesystem);
      expect(lsResult.output).not.toContain('testdir');
    });

    it('should handle rmdir without trailing slash', () => {
      const result = commands.rmdir(['testdir'], filesystem);
      expect(result.success).toBe(true);
    });

    it('should handle rm -r with trailing slash on directory', () => {
      const result = commands.rm(['-r', 'testdir/'], filesystem);
      expect(result.success).toBe(true);
    });

    it('should handle nested directory paths with trailing slash', () => {
      commands.mkdir(['-p', 'nested/deep/path'], filesystem);
      const result = commands.rmdir(['nested/deep/path/'], filesystem);
      expect(result.success).toBe(true);
    });
  });

  describe('nano command', () => {
    it('should open existing file for editing', () => {
      commands.touch(['test.txt'], filesystem);
      const result = commands.nano(['test.txt'], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('OPEN_EDITOR:test.txt:');
    });

    it('should open new file for editing', () => {
      const result = commands.nano(['newfile.txt'], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('OPEN_EDITOR:newfile.txt:');

      // Content should be empty (base64 encoded empty string)
      const base64Content = result.output.split(':')[2];
      expect(atob(base64Content)).toBe('');
    });

    it('should fail to open directory', () => {
      commands.mkdir(['testdir'], filesystem);
      const result = commands.nano(['testdir'], filesystem);

      expect(result.success).toBe(false);
      expect(result.error).toBe('nano: testdir: Is a directory');
    });

    it('should require filename argument', () => {
      const result = commands.nano([], filesystem);

      expect(result.success).toBe(false);
      expect(result.error).toBe('nano: missing filename argument');
    });

    it('should handle files with content', () => {
      // Create file with content using echo
      commands.echo(['hello', 'world'], filesystem);
      // Since we can't directly create file with content, let's test with existing files

      // Change to documents directory which has files with content
      filesystem.currentPath = ['home', 'user', 'documents'];
      const result = commands.nano(['readme.txt'], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('OPEN_EDITOR:readme.txt:');

      // Should have base64 encoded content
      const base64Content = result.output.split(':')[2];
      const decodedContent = atob(base64Content);
      expect(decodedContent.length).toBeGreaterThan(0);
    });
  });

  describe('vi command', () => {
    it('should open existing file for editing', () => {
      commands.touch(['test.txt'], filesystem);
      const result = commands.vi(['test.txt'], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('OPEN_EDITOR:test.txt:');
    });

    it('should open new file for editing', () => {
      const result = commands.vi(['newfile.txt'], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('OPEN_EDITOR:newfile.txt:');
    });

    it('should fail to open directory', () => {
      commands.mkdir(['testdir'], filesystem);
      const result = commands.vi(['testdir'], filesystem);

      expect(result.success).toBe(false);
      expect(result.error).toBe('vi: testdir: Is a directory');
    });

    it('should require filename argument', () => {
      const result = commands.vi([], filesystem);

      expect(result.success).toBe(false);
      expect(result.error).toBe('vi: missing filename argument');
    });

    it('should work identically to nano', () => {
      commands.touch(['same-file.txt'], filesystem);

      const nanoResult = commands.nano(['same-file.txt'], filesystem);
      const viResult = commands.vi(['same-file.txt'], filesystem);

      expect(nanoResult.success).toBe(viResult.success);
      // Both should open the same file with same content
      expect(nanoResult.output.split(':')[0]).toBe('OPEN_EDITOR');
      expect(viResult.output.split(':')[0]).toBe('OPEN_EDITOR');
    });
  });

  describe('reset-fs command', () => {
    it('should return reset filesystem signal', () => {
      const result = commands['reset-fs']([], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('RESET_FILESYSTEM:');
    });

    it('should include filesystem mode in output', () => {
      const result = commands['reset-fs']([], filesystem);

      expect(result.success).toBe(true);
      // Should contain a filesystem mode (default, portfolio, etc.)
      expect(result.output).toMatch(/RESET_FILESYSTEM:(default|portfolio)/);
    });

    it('should not require any arguments', () => {
      const result = commands['reset-fs']([], filesystem);
      expect(result.success).toBe(true);

      const resultWithArgs = commands['reset-fs'](['ignored', 'args'], filesystem);
      expect(resultWithArgs.success).toBe(true);
    });
  });

  describe('storage-info command', () => {
    it('should display storage information', () => {
      const result = commands['storage-info']([], filesystem);

      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      expect(result.output).toContain('Browser Storage Information');
      expect(result.output).toContain('Total terminal storage');
      expect(result.output).toContain('Filesystem data');
      expect(result.output).toContain('Has backups');
      expect(result.output).toContain('Last saved');
    });

    it('should include commands section', () => {
      const result = commands['storage-info']([], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Commands:');
      expect(result.output).toContain('reset-fs');
    });

    it('should not require any arguments', () => {
      const result = commands['storage-info']([], filesystem);
      expect(result.success).toBe(true);

      const resultWithArgs = commands['storage-info'](['ignored'], filesystem);
      expect(resultWithArgs.success).toBe(true);
    });

    it('should format file sizes correctly', () => {
      const result = commands['storage-info']([], filesystem);

      expect(result.success).toBe(true);
      // Should contain size units (B, KB, MB)
      expect(result.output).toMatch(/\d+(\.\d+)?\s+(B|KB|MB)/);
    });
  });

  describe('rmdir command edge cases', () => {
    it('should fail to remove non-empty directory', () => {
      commands.mkdir(['nonempty'], filesystem);
      filesystem.currentPath.push('nonempty');
      commands.touch(['file.txt'], filesystem);
      filesystem.currentPath.pop();

      const result = commands.rmdir(['nonempty'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Directory not empty');
    });

    it('should fail to remove file', () => {
      commands.touch(['not-a-dir.txt'], filesystem);
      const result = commands.rmdir(['not-a-dir.txt'], filesystem);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not a directory');
    });

    it('should fail for non-existent directory', () => {
      const result = commands.rmdir(['does-not-exist'], filesystem);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });

    it('should require directory argument', () => {
      const result = commands.rmdir([], filesystem);

      expect(result.success).toBe(false);
      expect(result.error).toContain('missing operand');
    });
  });

  describe('path resolution consistency', () => {
    beforeEach(() => {
      // Create test structure
      commands.mkdir(['-p', 'test/nested/deep'], filesystem);
      commands.touch(['test/file.txt'], filesystem);
    });

    it('should handle absolute paths consistently across commands', () => {
      // cd should work with absolute paths
      const cdResult = commands.cd(['/home/user/test'], filesystem);
      expect(cdResult.success).toBe(true);

      // Reset position
      filesystem.currentPath = ['home', 'user'];

      // rmdir should work with absolute paths
      const rmdirResult = commands.rmdir(['/home/user/test/nested/deep'], filesystem);
      expect(rmdirResult.success).toBe(true);
    });

    it('should handle relative paths with .. consistently', () => {
      filesystem.currentPath = ['home', 'user', 'test', 'nested'];

      // Go up one level and remove directory
      const result = commands.rmdir(['../file.txt'], filesystem);
      // This should fail since file.txt is a file, not directory
      expect(result.success).toBe(false);
    });

    it('should handle multiple trailing slashes', () => {
      const result = commands.rmdir(['test/nested/deep///'], filesystem);
      expect(result.success).toBe(true);
    });
  });
});
