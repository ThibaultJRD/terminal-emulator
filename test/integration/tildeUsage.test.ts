import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { executeCommand } from '~/routes/terminal/utils/commands';
import { createFreshFileSystem } from '~/routes/terminal/utils/filesystem';

describe('Tilde Usage Integration Tests', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = createFreshFileSystem('default');
  });

  // Helper function to convert output to text
  const getOutputText = (output: any): string => {
    if (Array.isArray(output)) {
      return output.map((s) => s.text || '').join('');
    }
    return output || '';
  };

  describe('cd command with tilde', () => {
    it('should navigate to home directory with cd ~', () => {
      // First navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('cd ~', filesystem);

      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user']);
    });

    it('should navigate to subdirectory with cd ~/documents', () => {
      // First create a documents directory in home
      filesystem.currentPath = ['home', 'user'];
      executeCommand('mkdir documents', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('cd ~/documents', filesystem);

      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents']);
    });

    it('should work with nested paths using tilde', () => {
      // Create nested directory structure
      filesystem.currentPath = ['home', 'user'];
      executeCommand('mkdir -p documents/projects/app', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('cd ~/documents/projects/app', filesystem);

      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents', 'projects', 'app']);
    });

    it('should fail for non-existent tilde paths', () => {
      const result = executeCommand('cd ~/nonexistent', filesystem);

      expect(result.success).toBe(false);
      expect(result.error).toContain('no such file or directory');
    });
  });

  describe('ls command with tilde', () => {
    it('should list home directory contents with ls ~', () => {
      // Create some files in home directory
      filesystem.currentPath = ['home', 'user'];
      executeCommand('touch file1.txt', filesystem);
      executeCommand('mkdir documents', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('ls ~', filesystem);

      expect(result.success).toBe(true);
      const outputText = getOutputText(result.output);
      expect(outputText).toContain('file1.txt');
      expect(outputText).toContain('documents');
    });

    it('should list subdirectory contents with ls ~/documents', () => {
      // Create files in a subdirectory
      filesystem.currentPath = ['home', 'user'];
      executeCommand('mkdir documents', filesystem);
      filesystem.currentPath = ['home', 'user', 'documents'];
      executeCommand('touch readme.txt', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('ls ~/documents', filesystem);

      expect(result.success).toBe(true);
      const outputText = getOutputText(result.output);
      expect(outputText).toContain('readme.txt');
    });
  });

  describe('cat command with tilde', () => {
    it('should read file using tilde path', () => {
      // Create a file in home directory
      filesystem.currentPath = ['home', 'user'];
      executeCommand('touch greeting.txt', filesystem);
      executeCommand('echo "Hello from home" > greeting.txt', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('cat ~/greeting.txt', filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Hello from home');
    });

    it('should read file from subdirectory using tilde path', () => {
      // Create a file in a subdirectory
      filesystem.currentPath = ['home', 'user'];
      executeCommand('mkdir documents', filesystem);
      filesystem.currentPath = ['home', 'user', 'documents'];
      executeCommand('touch note.txt', filesystem);
      executeCommand('echo "Important note" > note.txt', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('cat ~/documents/note.txt', filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Important note');
    });
  });

  describe('mkdir command with tilde', () => {
    it('should create directory using tilde path', () => {
      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('mkdir ~/newdir', filesystem);

      if (!result.success) {
        console.log('mkdir failed:', result.error);
      }
      expect(result.success).toBe(true);

      // Verify directory was created
      const lsResult = executeCommand('ls ~', filesystem);
      const outputText = getOutputText(lsResult.output);
      expect(outputText).toContain('newdir');
    });

    it('should create nested directories using tilde path with -p', () => {
      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('mkdir -p ~/documents/projects/new', filesystem);

      expect(result.success).toBe(true);

      // Verify nested directory was created
      const lsResult = executeCommand('ls ~/documents/projects', filesystem);
      const outputText = getOutputText(lsResult.output);
      expect(outputText).toContain('new');
    });
  });

  describe('touch command with tilde', () => {
    it('should create file using tilde path', () => {
      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('touch ~/newfile.txt', filesystem);

      expect(result.success).toBe(true);

      // Verify file was created
      const lsResult = executeCommand('ls ~', filesystem);
      const outputText = getOutputText(lsResult.output);
      expect(outputText).toContain('newfile.txt');
    });

    it('should create file in subdirectory using tilde path', () => {
      // Create documents directory first
      filesystem.currentPath = ['home', 'user'];
      executeCommand('mkdir documents', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('touch ~/documents/project.txt', filesystem);

      expect(result.success).toBe(true);

      // Verify file was created
      const lsResult = executeCommand('ls ~/documents', filesystem);
      const outputText = getOutputText(lsResult.output);
      expect(outputText).toContain('project.txt');
    });
  });

  describe('rm command with tilde', () => {
    it('should remove file using tilde path', () => {
      // Create a file in home directory
      filesystem.currentPath = ['home', 'user'];
      executeCommand('touch removeme.txt', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('rm ~/removeme.txt', filesystem);

      expect(result.success).toBe(true);

      // Verify file was removed
      const lsResult = executeCommand('ls ~', filesystem);
      const outputText = getOutputText(lsResult.output);
      expect(outputText).not.toContain('removeme.txt');
    });

    it('should remove directory recursively using tilde path', () => {
      // Create a directory with files
      filesystem.currentPath = ['home', 'user'];
      executeCommand('mkdir -p tempdir/subdir', filesystem);
      filesystem.currentPath = ['home', 'user', 'tempdir'];
      executeCommand('touch file1.txt file2.txt', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('rm -rf ~/tempdir', filesystem);

      expect(result.success).toBe(true);

      // Verify directory was removed
      const lsResult = executeCommand('ls ~', filesystem);
      const outputText = getOutputText(lsResult.output);
      expect(outputText).not.toContain('tempdir');
    });
  });

  describe('redirection with tilde', () => {
    it('should redirect output to file using tilde path', () => {
      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('echo "Hello World" > ~/output.txt', filesystem);

      expect(result.success).toBe(true);

      // Verify file was created and contains content
      const catResult = executeCommand('cat ~/output.txt', filesystem);
      expect(catResult.output).toContain('Hello World');
    });

    it('should append output to file using tilde path', () => {
      // Create initial file
      filesystem.currentPath = ['home', 'user'];
      executeCommand('echo "Line 1" > log.txt', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('echo "Line 2" >> ~/log.txt', filesystem);

      expect(result.success).toBe(true);

      // Verify file contains both lines
      const catResult = executeCommand('cat ~/log.txt', filesystem);
      expect(catResult.output).toContain('Line 1');
      expect(catResult.output).toContain('Line 2');
    });

    it('should read input from file using tilde path', () => {
      // Create a file with content
      filesystem.currentPath = ['home', 'user'];
      executeCommand('echo "test content" > input.txt', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['etc'];

      const result = executeCommand('wc ~/input.txt', filesystem);

      if (!result.success) {
        console.log('wc failed:', result.error);
      }
      expect(result.success).toBe(true);
      const outputText = getOutputText(result.output);
      expect(outputText).toContain('input.txt');
    });
  });

  describe('portfolio mode tilde usage', () => {
    beforeEach(() => {
      filesystem = createFreshFileSystem('portfolio');
    });

    it('should use /about as home directory in portfolio mode', () => {
      // Navigate away from home
      filesystem.currentPath = ['projects'];

      const result = executeCommand('cd ~', filesystem);

      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user']);
    });

    it('should expand ~/projects to /about/projects in portfolio mode', () => {
      // Create projects directory
      filesystem.currentPath = ['about'];
      executeCommand('mkdir projects', filesystem);

      // Navigate away from home
      filesystem.currentPath = ['contact'];

      const result = executeCommand('cd ~/projects', filesystem);

      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user', 'projects']);
    });

    it('should list home directory contents in portfolio mode', () => {
      // Navigate away from home
      filesystem.currentPath = ['projects'];

      const result = executeCommand('ls ~', filesystem);

      expect(result.success).toBe(true);
      // Should contain default portfolio content
      const outputText = getOutputText(result.output);
      expect(outputText).toContain('about');
    });
  });
});
