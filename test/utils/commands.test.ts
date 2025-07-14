import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { commands } from '~/routes/terminal/utils/commands';
import { createDefaultFileSystem, getNodeAtPath, resolvePath } from '~/routes/terminal/utils/filesystem';

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
      expect(result.output).toContain('Welcome to the Modern Terminal Emulator');
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

    it('should display line numbers with -n option', () => {
      // Create a test file with multiple lines
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['test-lines.txt'] = {
          name: 'test-lines.txt',
          type: 'file',
          content: 'line 1\nline 2\nline 3',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }

      const result = commands.cat(['-n', 'test-lines.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toContain('     1\tline 1');
      expect(result.output).toContain('     2\tline 2');
      expect(result.output).toContain('     3\tline 3');
    });

    it('should handle multiple files', () => {
      // Create test files
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['file1.txt'] = {
          name: 'file1.txt',
          type: 'file',
          content: 'content1',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
        currentDir.children['file2.txt'] = {
          name: 'file2.txt',
          type: 'file',
          content: 'content2',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }

      const result = commands.cat(['file1.txt', 'file2.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('content1content2');
    });

    it('should handle multiple files with line numbers', () => {
      // Create test files
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['multi1.txt'] = {
          name: 'multi1.txt',
          type: 'file',
          content: 'line 1\nline 2',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
        currentDir.children['multi2.txt'] = {
          name: 'multi2.txt',
          type: 'file',
          content: 'line 3\nline 4',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }

      const result = commands.cat(['-n', 'multi1.txt', 'multi2.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toContain('     1\tline 1');
      expect(result.output).toContain('     2\tline 2');
      expect(result.output).toContain('     3\tline 3');
      expect(result.output).toContain('     4\tline 4');
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
      expect(result.output).toBe('hello world\n');
    });

    it('should handle empty arguments', () => {
      const result = commands.echo([], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('\n');
    });
  });

  describe('date command', () => {
    it('should output current date in default format', () => {
      const result = commands.date([], filesystem);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(typeof result.output).toBe('string');
      // Should include day, month, year
      expect(result.output).toMatch(/\w{3} \w{3} \d{2} \d{2}:\d{2}:\d{2} \d{4}/);
    });

    it('should handle custom format strings', () => {
      const result = commands.date(['+%Y-%m-%d'], filesystem);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      // Should match YYYY-MM-DD format
      expect(result.output).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should handle invalid options', () => {
      const result = commands.date(['invalid'], filesystem);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.error).toContain('invalid option');
    });
  });

  describe('cp command', () => {
    it('should copy file to new location', () => {
      // Create test file
      filesystem.currentPath = ['home', 'user', 'documents'];
      const createResult = commands.touch(['test.txt'], filesystem);
      expect(createResult.success).toBe(true);

      // Copy file
      const result = commands.cp(['test.txt', 'copy.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('');

      // Check both files exist
      const ls = commands.ls([], filesystem);
      expect(ls.success).toBe(true);
      const outputText = Array.isArray(ls.output) ? ls.output.map((s) => s.text).join('') : ls.output;
      expect(outputText).toMatch(/test\.txt/);
      expect(outputText).toMatch(/copy\.txt/);
    });

    it('should copy file to existing directory', () => {
      filesystem.currentPath = ['home', 'user', 'documents'];
      const createResult = commands.touch(['test.txt'], filesystem);
      expect(createResult.success).toBe(true);

      // Go back to user directory and copy into a different directory
      filesystem.currentPath = ['home', 'user'];
      const mkdirResult = commands.mkdir(['testdir'], filesystem);
      expect(mkdirResult.success).toBe(true);

      const result = commands.cp(['documents/test.txt', 'testdir'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('');

      // Check file was copied into directory
      const ls = commands.ls(['testdir'], filesystem);
      expect(ls.success).toBe(true);
      const outputText = Array.isArray(ls.output) ? ls.output.map((s) => s.text).join('') : ls.output;
      expect(outputText).toMatch(/test\.txt/);
    });

    it('should copy directory recursively with -r flag', () => {
      filesystem.currentPath = ['home', 'user'];
      const mkdirResult = commands.mkdir(['testdir'], filesystem);
      expect(mkdirResult.success).toBe(true);

      const touchResult = commands.touch(['testdir/file.txt'], filesystem);
      expect(touchResult.success).toBe(true);

      const result = commands.cp(['-r', 'testdir', 'copydir'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('');

      // Check directory was copied
      const ls = commands.ls(['copydir'], filesystem);
      expect(ls.success).toBe(true);
      const outputText = Array.isArray(ls.output) ? ls.output.map((s) => s.text).join('') : ls.output;
      expect(outputText).toMatch(/file\.txt/);
    });

    it('should fail to copy directory without -r flag', () => {
      filesystem.currentPath = ['home', 'user'];
      const mkdirResult = commands.mkdir(['testdir'], filesystem);
      expect(mkdirResult.success).toBe(true);

      const result = commands.cp(['testdir', 'copydir'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain("omitting directory 'testdir'");
    });

    it('should fail when source does not exist', () => {
      const result = commands.cp(['nonexistent.txt', 'dest.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain("cannot stat 'nonexistent.txt'");
    });

    it('should require destination operand', () => {
      const result = commands.cp(['file1.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toBe('cp: missing destination file operand');
    });
  });

  describe('mv command', () => {
    it('should move file to new location', () => {
      filesystem.currentPath = ['home', 'user', 'documents'];
      const createResult = commands.touch(['test.txt'], filesystem);
      expect(createResult.success).toBe(true);

      const result = commands.mv(['test.txt', 'moved.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('');

      // Check source no longer exists
      const catOriginal = commands.cat(['test.txt'], filesystem);
      expect(catOriginal.success).toBe(false);

      // Check destination exists
      const ls = commands.ls([], filesystem);
      expect(ls.success).toBe(true);
      const outputText = Array.isArray(ls.output) ? ls.output.map((s) => s.text).join('') : ls.output;
      expect(outputText).toMatch(/moved\.txt/);
    });

    it('should move file to existing directory', () => {
      filesystem.currentPath = ['home', 'user', 'documents'];
      const createResult = commands.touch(['test.txt'], filesystem);
      expect(createResult.success).toBe(true);

      // Go back to user directory and move to a different directory
      filesystem.currentPath = ['home', 'user'];
      const mkdirResult = commands.mkdir(['testdir'], filesystem);
      expect(mkdirResult.success).toBe(true);

      const result = commands.mv(['documents/test.txt', 'testdir'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('');

      // Check file was moved into directory
      const ls = commands.ls(['testdir'], filesystem);
      expect(ls.success).toBe(true);
      const outputText = Array.isArray(ls.output) ? ls.output.map((s) => s.text).join('') : ls.output;
      expect(outputText).toMatch(/test\.txt/);
    });

    it('should move directory', () => {
      filesystem.currentPath = ['home', 'user'];
      const mkdirResult = commands.mkdir(['testdir'], filesystem);
      expect(mkdirResult.success).toBe(true);

      const touchResult = commands.touch(['testdir/file.txt'], filesystem);
      expect(touchResult.success).toBe(true);

      const result = commands.mv(['testdir', 'moveddir'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('');

      // Check source no longer exists
      const lsOriginal = commands.ls(['testdir'], filesystem);
      expect(lsOriginal.success).toBe(false);

      // Check directory was moved
      const ls = commands.ls(['moveddir'], filesystem);
      expect(ls.success).toBe(true);
      const outputText = Array.isArray(ls.output) ? ls.output.map((s) => s.text).join('') : ls.output;
      expect(outputText).toMatch(/file\.txt/);
    });

    it('should fail when source does not exist', () => {
      const result = commands.mv(['nonexistent.txt', 'dest.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain("cannot stat 'nonexistent.txt'");
    });

    it('should fail when source and destination are the same', () => {
      filesystem.currentPath = ['home', 'user', 'documents'];
      const createResult = commands.touch(['test.txt'], filesystem);
      expect(createResult.success).toBe(true);

      const result = commands.mv(['test.txt', 'test.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('are the same file');
    });

    it('should require destination operand', () => {
      const result = commands.mv(['file1.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toBe('mv: missing destination file operand');
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

    it('should show only line count with -l option', () => {
      // Create a test file with known content
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['wc-test.txt'] = {
          name: 'wc-test.txt',
          type: 'file',
          content: 'line 1\nline 2\nline 3',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }

      const result = commands.wc(['-l', 'wc-test.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/^\s*3\s+wc-test\.txt$/);
    });

    it('should show only word count with -w option', () => {
      // Create a test file with known content
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['wc-words.txt'] = {
          name: 'wc-words.txt',
          type: 'file',
          content: 'hello world test',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }

      const result = commands.wc(['-w', 'wc-words.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/^\s*3\s+wc-words\.txt$/);
    });

    it('should show only character count with -c option', () => {
      // Create a test file with known content
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['wc-chars.txt'] = {
          name: 'wc-chars.txt',
          type: 'file',
          content: 'hello',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }

      const result = commands.wc(['-c', 'wc-chars.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/^\s*5\s+wc-chars\.txt$/);
    });

    it('should handle multiple options', () => {
      // Create a test file with known content
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['wc-multi.txt'] = {
          name: 'wc-multi.txt',
          type: 'file',
          content: 'line 1\nline 2',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }

      const result = commands.wc(['-l', '-w', 'wc-multi.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toMatch(/^\s*2\s+4\s+wc-multi\.txt$/);
    });

    it('should handle multiple files with options', () => {
      // Create test files
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['wc-file1.txt'] = {
          name: 'wc-file1.txt',
          type: 'file',
          content: 'a\nb',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
        currentDir.children['wc-file2.txt'] = {
          name: 'wc-file2.txt',
          type: 'file',
          content: 'c\nd',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }

      const result = commands.wc(['-l', 'wc-file1.txt', 'wc-file2.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toContain('2 wc-file1.txt');
      expect(result.output).toContain('2 wc-file2.txt');
      expect(result.output).toContain('4 total');
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

    it('should handle files with content', () => {
      // Change to documents directory which has files with content
      filesystem.currentPath = ['home', 'user', 'documents'];
      const result = commands.vi(['readme.txt'], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('OPEN_EDITOR:readme.txt:');

      // Should have base64 encoded content
      const base64Content = (result.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      expect(decodedContent.length).toBeGreaterThan(0);
    });
  });

  describe('reset-fs command', () => {
    it('should return reset filesystem signal', () => {
      const result = commands['reset-fs']([], filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toBe('RESET_FILESYSTEM');
    });

    it('should return simplified reset signal', () => {
      const result = commands['reset-fs']([], filesystem);

      expect(result.success).toBe(true);
      // Should return simplified signal since both modes use the same structure
      expect(result.output).toBe('RESET_FILESYSTEM');
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

  describe('head command with files', () => {
    beforeEach(() => {
      // Create test file with multiple lines
      const content = 'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\nline11\nline12';
      const testFile = getNodeAtPath(filesystem, resolvePath(filesystem, 'testfile.txt'));
      if (!testFile) {
        // Add the file directly to the filesystem
        const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
        if (currentDir && currentDir.type === 'directory' && currentDir.children) {
          currentDir.children['testfile.txt'] = {
            name: 'testfile.txt',
            type: 'file',
            content: content,
            createdAt: new Date(),
            modifiedAt: new Date(),
            permissions: '644',
          };
        }
      }
    });

    it('should show first 10 lines by default', () => {
      const result = commands.head(['testfile.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      const lines = (result.output as string).split('\n');
      expect(lines.length).toBe(10);
      expect(lines[0]).toBe('line1');
      expect(lines[9]).toBe('line10');
    });

    it('should respect -n flag', () => {
      const result = commands.head(['-n', '3', 'testfile.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      const lines = (result.output as string).split('\n');
      expect(lines.length).toBe(3);
      expect(lines[0]).toBe('line1');
      expect(lines[2]).toBe('line3');
    });

    it('should fail for non-existent file', () => {
      const result = commands.head(['nonexistent.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });

    it('should fail for directory', () => {
      commands.mkdir(['testdir'], filesystem);
      const result = commands.head(['testdir'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Is a directory');
    });

    it('should show error message when no arguments', () => {
      const result = commands.head([], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('use with pipes or input redirection');
    });
  });

  describe('tail command with files', () => {
    beforeEach(() => {
      // Create test file with multiple lines
      const content = 'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\nline11\nline12';
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['testfile.txt'] = {
          name: 'testfile.txt',
          type: 'file',
          content: content,
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }
    });

    it('should show last 10 lines by default', () => {
      const result = commands.tail(['testfile.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      const lines = (result.output as string).split('\n');
      expect(lines.length).toBe(10);
      expect(lines[0]).toBe('line3');
      expect(lines[9]).toBe('line12');
    });

    it('should respect -n flag', () => {
      const result = commands.tail(['-n', '3', 'testfile.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      const lines = (result.output as string).split('\n');
      expect(lines.length).toBe(3);
      expect(lines[0]).toBe('line10');
      expect(lines[2]).toBe('line12');
    });

    it('should fail for non-existent file', () => {
      const result = commands.tail(['nonexistent.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });

    it('should fail for directory', () => {
      commands.mkdir(['testdir'], filesystem);
      const result = commands.tail(['testdir'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Is a directory');
    });
  });

  describe('sort command with files', () => {
    beforeEach(() => {
      // Create test file with unsorted lines
      const content = 'zebra\napple\nbanana\n3\n1\n2\n10';
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['unsorted.txt'] = {
          name: 'unsorted.txt',
          type: 'file',
          content: content,
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }
    });

    it('should sort alphabetically by default', () => {
      const result = commands.sort(['unsorted.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      const lines = (result.output as string).split('\n');
      expect(lines[0]).toBe('1');
      expect(lines[1]).toBe('10');
      expect(lines[2]).toBe('2');
      expect(lines[3]).toBe('3');
      expect(lines[4]).toBe('apple');
    });

    it('should sort numerically with -n flag', () => {
      const result = commands.sort(['-n', 'unsorted.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      const lines = (result.output as string).split('\n');
      // Non-numeric lines are treated as 0 and come first in stable sort
      expect(lines.slice(0, 3)).toEqual(['zebra', 'apple', 'banana']);
      expect(lines.slice(3)).toEqual(['1', '2', '3', '10']);
    });

    it('should reverse sort with -r flag', () => {
      const result = commands.sort(['-r', 'unsorted.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      const lines = (result.output as string).split('\n');
      expect(lines[0]).toBe('zebra');
      expect(lines[lines.length - 1]).toBe('1');
    });

    it('should fail for non-existent file', () => {
      const result = commands.sort(['nonexistent.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });
  });

  describe('uniq command with files', () => {
    beforeEach(() => {
      // Create test file with duplicate lines
      const content = 'apple\napple\nbanana\nbanana\nbanana\ncherry\napple';
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['duplicates.txt'] = {
          name: 'duplicates.txt',
          type: 'file',
          content: content,
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }
    });

    it('should remove consecutive duplicates', () => {
      const result = commands.uniq(['duplicates.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(typeof result.output).toBe('string');
      const lines = (result.output as string).split('\n');
      expect(lines).toEqual(['apple', 'banana', 'cherry', 'apple']);
    });

    it('should fail for non-existent file', () => {
      const result = commands.uniq(['nonexistent.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });

    it('should fail for directory', () => {
      commands.mkdir(['testdir'], filesystem);
      const result = commands.uniq(['testdir'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Is a directory');
    });
  });

  describe('grep command', () => {
    beforeEach(() => {
      // Create test files for grep tests
      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir && currentDir.type === 'directory' && currentDir.children) {
        currentDir.children['grep-test.txt'] = {
          name: 'grep-test.txt',
          type: 'file',
          content: 'Hello world\nThis is a test\nAnother line\ntest line here\nFinal line',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
        currentDir.children['anchor-test.txt'] = {
          name: 'anchor-test.txt',
          type: 'file',
          content: 'Start of line\nmiddle line\nend of line here\nAnother start line\nMidline end',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
        currentDir.children['case-test.txt'] = {
          name: 'case-test.txt',
          type: 'file',
          content: 'Linux is great\nI love linux\nWindows is different\nUNIX is powerful',
          createdAt: new Date(),
          modifiedAt: new Date(),
          permissions: '644',
        };
      }
    });

    it('should search for basic patterns', () => {
      const result = commands.grep(['test', 'grep-test.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('This is a test\ntest line here');
      expect(result.exitCode).toBe(0);
    });

    it('should handle case-insensitive search with -i flag', () => {
      const result = commands.grep(['-i', 'HELLO', 'grep-test.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('Hello world');
      expect(result.exitCode).toBe(0);
    });

    it('should show line numbers with -n flag', () => {
      const result = commands.grep(['-n', 'test', 'grep-test.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('2:This is a test\n4:test line here');
      expect(result.exitCode).toBe(0);
    });

    it('should count matches with -c flag', () => {
      const result = commands.grep(['-c', 'line', 'grep-test.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('3');
      expect(result.exitCode).toBe(0);
    });

    it('should invert match with -v flag', () => {
      const result = commands.grep(['-v', 'test', 'grep-test.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('Hello world\nAnother line\nFinal line');
      expect(result.exitCode).toBe(0);
    });

    it('should handle anchor patterns (^ and $)', () => {
      // Test start anchor
      const startResult = commands.grep(['^Start', 'anchor-test.txt'], filesystem);
      expect(startResult.success).toBe(true);
      expect(startResult.output).toBe('Start of line');
      expect(startResult.exitCode).toBe(0);

      // Test end anchor
      const endResult = commands.grep(['end$', 'anchor-test.txt'], filesystem);
      expect(endResult.success).toBe(true);
      expect(endResult.output).toBe('Midline end');
      expect(endResult.exitCode).toBe(0);
    });

    it('should handle alternation patterns (|)', () => {
      const result = commands.grep(['Linux|UNIX', 'case-test.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('Linux is great\nUNIX is powerful');
      expect(result.exitCode).toBe(0);
    });

    it('should handle case-insensitive alternation', () => {
      const result = commands.grep(['-i', 'linux|unix', 'case-test.txt'], filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('Linux is great\nI love linux\nUNIX is powerful');
      expect(result.exitCode).toBe(0);
    });

    it('should fail when no matches found', () => {
      const result = commands.grep(['nonexistent', 'grep-test.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.output).toBe('');
      expect(result.exitCode).toBe(1);
    });

    it('should fail for non-existent file', () => {
      const result = commands.grep(['test', 'nonexistent.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
      expect(result.exitCode).toBe(2);
    });

    it('should fail for directory', () => {
      commands.mkdir(['testdir'], filesystem);
      const result = commands.grep(['test', 'testdir'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Is a directory');
      expect(result.exitCode).toBe(2);
    });

    it('should fail for invalid regex pattern', () => {
      const result = commands.grep(['[', 'grep-test.txt'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('invalid pattern');
      expect(result.exitCode).toBe(2);
    });

    it('should fail when pattern is missing', () => {
      const result = commands.grep([], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing pattern');
      expect(result.exitCode).toBe(2);
    });

    it('should fail when no files specified and no input provided', () => {
      const result = commands.grep(['test'], filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('no input provided');
      expect(result.exitCode).toBe(1);
    });
  });
});
