import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { executeCommand } from '~/routes/terminal/utils/commands';
import { createDefaultFileSystem } from '~/routes/terminal/utils/filesystem';

describe('Command Execution Integration Tests', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = createDefaultFileSystem();
  });

  describe('Basic command execution', () => {
    it('should execute simple commands', () => {
      const result = executeCommand('pwd', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('/home/user');
    });

    it('should execute commands with arguments', () => {
      const result = executeCommand('echo hello world', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('hello world\n');
    });

    it('should handle quoted arguments', () => {
      const result = executeCommand('echo "Hello les amis comment allez vous ?"', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('Hello les amis comment allez vous ?\n');
    });

    it('should fail for unknown commands', () => {
      const result = executeCommand('unknowncommand', filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('command not found');
    });
  });

  describe('Output redirection', () => {
    it('should redirect output to new file with >', () => {
      const result = executeCommand('echo "test content" > testfile.txt', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe(''); // No output when redirecting

      // Verify file was created with correct content
      const catResult = executeCommand('cat testfile.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('test content\n');
    });

    it('should append output to existing file with >>', () => {
      // Create initial file
      executeCommand('echo "first line" > testfile.txt', filesystem);

      // Append to it
      const result = executeCommand('echo "second line" >> testfile.txt', filesystem);
      expect(result.success).toBe(true);

      // Verify content was appended
      const catResult = executeCommand('cat testfile.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('first line\nsecond line\n');
    });

    it('should overwrite existing file with >', () => {
      // Create initial file
      executeCommand('echo "original content" > testfile.txt', filesystem);

      // Overwrite it
      const result = executeCommand('echo "new content" > testfile.txt', filesystem);
      expect(result.success).toBe(true);

      // Verify content was overwritten
      const catResult = executeCommand('cat testfile.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('new content\n');
    });

    it('should handle complex commands with redirection', () => {
      const result = executeCommand('ls -la > filelist.txt', filesystem);
      expect(result.success).toBe(true);

      // Verify file was created with ls output
      const catResult = executeCommand('cat filelist.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(typeof catResult.output === 'string').toBe(true);
      expect(catResult.output).toContain('documents');
    });

    it('should handle quoted filenames in redirection', () => {
      const result = executeCommand('echo test > "file with spaces.txt"', filesystem);
      expect(result.success).toBe(true);

      const catResult = executeCommand('cat "file with spaces.txt"', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('test\n');
    });
  });

  describe('Input redirection', () => {
    it('should handle input redirection with <', () => {
      // First create a file with content
      executeCommand('echo "test content for wc" > input.txt', filesystem);

      // Use input redirection (simplified - mainly tests parsing)
      const result = executeCommand('wc < input.txt', filesystem);
      expect(result.success).toBe(true);
    });

    it('should handle heredoc with <<', () => {
      const result = executeCommand('cat << EOF', filesystem);
      expect(result.success).toBe(true);
    });

    it('should fail for non-existent input file', () => {
      const result = executeCommand('wc < nonexistent.txt', filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle multiple file operations', () => {
      // Create multiple files
      executeCommand('echo "file1 content" > file1.txt', filesystem);
      executeCommand('echo "file2 content" > file2.txt', filesystem);
      executeCommand('echo "file3 content" > file3.txt', filesystem);

      // List them
      const lsResult = executeCommand('ls', filesystem);
      expect(lsResult.success).toBe(true);

      // Count words in all files
      const wcResult = executeCommand('wc file1.txt file2.txt file3.txt', filesystem);
      expect(wcResult.success).toBe(true);
      expect(wcResult.output).toContain('total');
    });

    it('should handle directory operations with options', () => {
      // Create nested directory structure
      const mkdirResult = executeCommand('mkdir -p deep/nested/structure', filesystem);
      expect(mkdirResult.success).toBe(true);

      // Navigate and create file
      executeCommand('cd deep/nested/structure', filesystem);
      executeCommand('echo "deep file" > deep.txt', filesystem);

      // Verify file exists
      const catResult = executeCommand('cat deep.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('deep file\n');
    });

    it('should handle file removal with options', () => {
      // Create directory with files
      executeCommand('mkdir testdir', filesystem);
      executeCommand('echo "file in dir" > testdir/file.txt', filesystem);

      // Try to remove directory (should fail without -r)
      let rmResult = executeCommand('rm testdir', filesystem);
      expect(rmResult.success).toBe(false);

      // Remove with -r flag
      rmResult = executeCommand('rm -r testdir', filesystem);
      expect(rmResult.success).toBe(true);

      // Verify directory is gone
      const lsResult = executeCommand('ls', filesystem);
      const output = lsResult.output as any[];
      const hasTestDir = output.some((segment) => segment.text && segment.text.includes('testdir'));
      expect(hasTestDir).toBe(false);
    });

    it('should handle markdown file rendering', () => {
      const result = executeCommand('cat documents/notes.md', filesystem);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.output)).toBe(true);

      const segments = result.output as any[];
      const hasMarkdownFormatting = segments.some((segment) => segment.type === 'header-1' || segment.type === 'bold' || segment.type === 'code-block');
      expect(hasMarkdownFormatting).toBe(true);
    });

    it('should handle easter egg discovery', () => {
      // Hidden files should not show by default
      let lsResult = executeCommand('ls', filesystem);
      let output = lsResult.output as any[];
      let hasSecret = output.some((segment) => segment.text && segment.text.includes('.secret'));
      expect(hasSecret).toBe(false);

      // Should show with -a flag
      lsResult = executeCommand('ls -a', filesystem);
      output = lsResult.output as any[];
      hasSecret = output.some((segment) => segment.text && segment.text.includes('.secret'));
      expect(hasSecret).toBe(true);

      // Should be able to read the easter egg
      const catResult = executeCommand('cat .secret', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toContain('Easter Egg');
      expect(catResult.output).toContain('🐱');
    });
  });

  describe('Error handling', () => {
    it('should handle invalid redirection targets', () => {
      // Try to redirect to a directory
      executeCommand('mkdir testdir', filesystem);
      const result = executeCommand('echo test > testdir', filesystem);
      expect(result.success).toBe(false);
    });

    it('should handle permission-like errors gracefully', () => {
      const result = executeCommand('rm -f definitely-does-not-exist.txt', filesystem);
      expect(result.success).toBe(true); // Force mode should succeed
    });

    it('should maintain filesystem consistency after errors', () => {
      // Cause an error
      executeCommand('rm nonexistent.txt', filesystem);

      // Filesystem should still work normally
      const pwdResult = executeCommand('pwd', filesystem);
      expect(pwdResult.success).toBe(true);

      const lsResult = executeCommand('ls', filesystem);
      expect(lsResult.success).toBe(true);
    });
  });
});
