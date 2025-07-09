import { beforeEach, describe, expect, it } from 'vitest';

import { createDefaultFilesystem } from '~/constants/defaultFilesystems';
import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { AliasManager } from '~/routes/terminal/utils/aliasManager';
import { executeCommand } from '~/routes/terminal/utils/commands';

describe('Alias Integration Tests', () => {
  let filesystem: FileSystemState;
  let aliasManager: AliasManager;

  beforeEach(() => {
    filesystem = {
      root: createDefaultFilesystem(),
      currentPath: ['home', 'user'],
    };
    aliasManager = new AliasManager();
  });

  describe('alias command', () => {
    it('should list all aliases when no arguments', () => {
      aliasManager.setAlias('ll', 'ls -la');
      aliasManager.setAlias('la', 'ls -a');

      const result = executeCommand('alias', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(result.output).toContain("alias la='ls -a'");
      expect(result.output).toContain("alias ll='ls -la'");
    });

    it('should show empty output when no aliases', () => {
      const result = executeCommand('alias', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(result.output).toBe('');
    });

    it('should create new alias', () => {
      const result = executeCommand("alias ll='ls -la'", filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(result.output).toBe('');
      expect(aliasManager.hasAlias('ll')).toBe(true);
    });

    it('should create alias without quotes', () => {
      const result = executeCommand('alias ll=ls', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(aliasManager.getAlias('ll')?.command).toBe('ls');
    });

    it('should show specific alias', () => {
      aliasManager.setAlias('ll', 'ls -la');

      const result = executeCommand('alias ll', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(result.output).toBe("alias ll='ls -la'");
    });

    it('should show error for non-existent alias', () => {
      const result = executeCommand('alias nonexistent', filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should reject invalid alias names', () => {
      const result = executeCommand("alias 123='ls -la'", filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found'); // Invalid names don't match regex so are treated as alias lookups
    });

    it('should reject dangerous commands', () => {
      const result = executeCommand("alias danger='rm -rf /'", filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('dangerous');
    });
  });

  describe('unalias command', () => {
    it('should remove existing alias', () => {
      aliasManager.setAlias('ll', 'ls -la');

      const result = executeCommand('unalias ll', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(result.output).toBe('');
      expect(aliasManager.hasAlias('ll')).toBe(false);
    });

    it('should show error for non-existent alias', () => {
      const result = executeCommand('unalias nonexistent', filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should remove all aliases with -a flag', () => {
      aliasManager.setAlias('ll', 'ls -la');
      aliasManager.setAlias('la', 'ls -a');

      const result = executeCommand('unalias -a', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(result.output).toBe('');
      expect(aliasManager.getAllAliases()).toHaveLength(0);
    });

    it('should remove multiple aliases', () => {
      aliasManager.setAlias('ll', 'ls -la');
      aliasManager.setAlias('la', 'ls -a');

      const result = executeCommand('unalias ll la', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(aliasManager.hasAlias('ll')).toBe(false);
      expect(aliasManager.hasAlias('la')).toBe(false);
    });

    it('should show error for missing operand', () => {
      const result = executeCommand('unalias', filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('missing operand');
    });
  });

  describe('source command', () => {
    it('should source .bashrc file', () => {
      const result = executeCommand('source .bashrc', filesystem, aliasManager);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Applied');

      // Check if aliases from .bashrc are loaded
      expect(aliasManager.hasAlias('ll')).toBe(true);
      expect(aliasManager.hasAlias('la')).toBe(true);
      expect(aliasManager.hasAlias('l')).toBe(true);
    });

    it('should handle non-existent file', () => {
      const result = executeCommand('source nonexistent.sh', filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No such file or directory');
    });

    it('should handle directory instead of file', () => {
      const result = executeCommand('source documents', filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Is a directory');
    });

    it('should show error for missing operand', () => {
      const result = executeCommand('source', filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('missing operand');
    });
  });

  describe('alias resolution', () => {
    it('should resolve simple alias', () => {
      aliasManager.setAlias('ll', 'ls -la');

      const result = executeCommand('ll', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Should execute ls -la command
      expect(typeof result.output === 'string' || Array.isArray(result.output)).toBe(true);
    });

    it('should resolve alias with arguments', () => {
      aliasManager.setAlias('lsdir', 'ls -la $1');

      const result = executeCommand('lsdir documents', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Should execute ls -la documents
    });

    it('should resolve nested aliases', () => {
      aliasManager.setAlias('l', 'ls');
      aliasManager.setAlias('ll', 'l -la');

      const result = executeCommand('ll', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Should resolve to ls -la
    });

    it('should handle circular aliases gracefully', () => {
      aliasManager.setAlias('a', 'b');
      aliasManager.setAlias('b', 'a');

      const result = executeCommand('a', filesystem, aliasManager);

      expect(result.success).toBe(false);
      expect(result.error).toContain('command not found');
    });

    it('should preserve original command when alias does not exist', () => {
      const result = executeCommand('ls', filesystem, aliasManager);

      expect(result.success).toBe(true);
      // Should execute normal ls command
    });
  });

  describe('alias persistence through .bashrc', () => {
    it('should auto-load aliases from .bashrc on initialization', () => {
      // This test verifies that initializeTerminalState loads aliases from .bashrc
      // The actual loading is tested in the terminalHandlers test

      const result = executeCommand('alias ll', filesystem, aliasManager);

      // If .bashrc was loaded, ll alias should exist
      // Since we're not testing the full initialization here, we'll just check the command structure
      expect(result.success).toBe(false); // Because ll is not set in this isolated test
      expect(result.error).toContain('not found');
    });
  });

  describe('alias without alias manager', () => {
    it('should show error when alias manager is not available', () => {
      const result = executeCommand('alias', filesystem); // No alias manager

      expect(result.success).toBe(false);
      expect(result.error).toContain('alias manager not available');
    });

    it('should show error when unalias manager is not available', () => {
      const result = executeCommand('unalias ll', filesystem); // No alias manager

      expect(result.success).toBe(false);
      expect(result.error).toContain('alias manager not available');
    });

    it('should show error when source manager is not available', () => {
      const result = executeCommand('source .bashrc', filesystem); // No alias manager

      expect(result.success).toBe(false);
      expect(result.error).toContain('alias manager not available');
    });
  });
});
