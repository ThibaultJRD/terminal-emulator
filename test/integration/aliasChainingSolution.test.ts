import { beforeEach, describe, expect, it } from 'vitest';

import { createDefaultFilesystem } from '~/constants/defaultFilesystems';
import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { AliasManager } from '~/routes/terminal/utils/aliasManager';
import { executeCommand } from '~/routes/terminal/utils/commands';

/**
 * Specific tests to validate the fix for the alias chaining bug.
 * Original bug: Aliases containing chaining operators (&&, ||, ;)
 * only executed the first command.
 */
describe('Alias Chaining Solution Tests', () => {
  let filesystem: FileSystemState;
  let aliasManager: AliasManager;

  beforeEach(() => {
    filesystem = {
      root: createDefaultFilesystem(),
      currentPath: ['home', 'user'],
    };
    aliasManager = new AliasManager();
  });

  describe('Original problem case', () => {
    it('should execute both cd and ls in alias work="cd documents/projects && ls"', () => {
      // Create the projects folder for the test
      const createResult = executeCommand('mkdir -p documents/projects', filesystem, aliasManager);
      expect(createResult.success).toBe(true);

      // Create the original problematic alias
      aliasManager.setAlias('work', 'cd documents/projects && ls');

      // Reset the path
      filesystem.currentPath = ['home', 'user'];

      // Execute the alias
      const result = executeCommand('work', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Verify that cd worked (directory change)
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents', 'projects']);
      // Verify that ls was executed (there is output)
      expect(typeof result.output === 'string' || Array.isArray(result.output)).toBe(true);
    });

    it('should show projects directory content after work alias execution', () => {
      // Create the folder and add files
      executeCommand('mkdir -p documents/projects', filesystem, aliasManager);
      executeCommand('touch documents/projects/file1.txt', filesystem, aliasManager);
      executeCommand('touch documents/projects/file2.txt', filesystem, aliasManager);

      // Create and execute the alias
      aliasManager.setAlias('work', 'cd documents/projects && ls');
      filesystem.currentPath = ['home', 'user'];

      const result = executeCommand('work', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Verify that we are in the correct directory
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents', 'projects']);

      // Verify that ls listed the files
      const outputText = Array.isArray(result.output) ? result.output.map((segment) => segment.text).join('') : result.output;
      expect(outputText).toContain('file1.txt');
      expect(outputText).toContain('file2.txt');
    });
  });

  describe('Edge cases for chaining fix', () => {
    it('should handle failure in first command of && chain', () => {
      aliasManager.setAlias('failchain', 'cd nonexistent && echo "this should not appear"');

      const result = executeCommand('failchain', filesystem, aliasManager);

      // The cd should fail, so echo should not execute
      expect(result.success).toBe(false);
      const outputText = Array.isArray(result.output) ? result.output.map((segment) => segment.text).join('') : result.output;
      expect(outputText).not.toContain('this should not appear');
    });

    it('should handle success in first command causing || chain to skip', () => {
      aliasManager.setAlias('skipchain', 'cd documents || echo "fallback executed"');

      const result = executeCommand('skipchain', filesystem, aliasManager);

      // Le cd devrait réussir, donc echo ne devrait pas s'exécuter
      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents']);
      const outputText = Array.isArray(result.output) ? result.output.map((segment) => segment.text).join('') : result.output;
      expect(outputText).not.toContain('fallback executed');
    });

    it('should handle complex chaining with mixed operators', () => {
      // Simpler and more realistic test
      aliasManager.setAlias('complex', 'cd documents && echo "in documents" ; echo "final step"');

      const result = executeCommand('complex', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(filesystem.currentPath).toEqual(['home', 'user', 'documents']);

      const outputText = Array.isArray(result.output) ? result.output.map((segment) => segment.text).join('') : result.output;
      expect(outputText).toContain('in documents');
      expect(outputText).toContain('final step');
    });
  });

  describe('Regression tests', () => {
    it('should still work with simple aliases without chaining', () => {
      aliasManager.setAlias('ll', 'ls -la');

      const result = executeCommand('ll', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Should execute normal ls -la command
      expect(typeof result.output === 'string' || Array.isArray(result.output)).toBe(true);
    });

    it('should still work with alias arguments', () => {
      aliasManager.setAlias('lsdir', 'ls -la $1');

      const result = executeCommand('lsdir documents', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Should execute ls -la documents
    });
  });
});
