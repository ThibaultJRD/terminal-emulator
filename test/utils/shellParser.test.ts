import { describe, expect, it } from 'vitest';

import { AliasManager } from '~/routes/terminal/utils/aliasManager';
import { ShellParser } from '~/routes/terminal/utils/shellParser';

describe('ShellParser', () => {
  describe('parse', () => {
    it('should parse empty content', () => {
      const result = ShellParser.parse('');
      expect(result.lines).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
      expect(result.aliasCount).toBe(0);
    });

    it('should parse empty lines', () => {
      const result = ShellParser.parse('\n\n\n');
      expect(result.lines).toHaveLength(4); // '\n\n\n' creates 4 empty strings when split
      expect(result.lines.every((line) => line.type === 'empty')).toBe(true);
    });

    it('should parse comments', () => {
      const content = '# This is a comment\n# Another comment';
      const result = ShellParser.parse(content);

      expect(result.lines).toHaveLength(2);
      expect(result.lines[0].type).toBe('comment');
      expect(result.lines[1].type).toBe('comment');
    });

    it('should parse alias definitions with single quotes', () => {
      const content = "alias ll='ls -la'";
      const result = ShellParser.parse(content);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].type).toBe('alias');
      expect(result.lines[0].alias).toEqual({
        name: 'll',
        command: 'ls -la',
      });
      expect(result.aliasCount).toBe(1);
    });

    it('should parse alias definitions with double quotes', () => {
      const content = 'alias ll="ls -la"';
      const result = ShellParser.parse(content);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].type).toBe('alias');
      expect(result.lines[0].alias).toEqual({
        name: 'll',
        command: 'ls -la',
      });
    });

    it('should parse alias definitions without quotes', () => {
      const content = 'alias ll=ls';
      const result = ShellParser.parse(content);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].type).toBe('alias');
      expect(result.lines[0].alias).toEqual({
        name: 'll',
        command: 'ls',
      });
    });

    it('should parse export statements', () => {
      const content = 'export PATH="/usr/bin"';
      const result = ShellParser.parse(content);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].type).toBe('export');
      expect(result.lines[0].export).toEqual({
        name: 'PATH',
        value: '/usr/bin',
      });
      expect(result.exportCount).toBe(1);
    });

    it('should detect invalid alias syntax', () => {
      const content = 'alias invalid syntax';
      const result = ShellParser.parse(content);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].type).toBe('error');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid alias syntax');
    });

    it('should parse mixed content', () => {
      const content = `# Shell configuration
alias ll='ls -la'
export PATH="/usr/bin"
ls -la
# End of file`;

      const result = ShellParser.parse(content);

      expect(result.lines).toHaveLength(5);
      expect(result.lines[0].type).toBe('comment');
      expect(result.lines[1].type).toBe('alias');
      expect(result.lines[2].type).toBe('export');
      expect(result.lines[3].type).toBe('command');
      expect(result.lines[4].type).toBe('comment');

      expect(result.aliasCount).toBe(1);
      expect(result.exportCount).toBe(1);
      expect(result.commandCount).toBe(1);
    });

    it('should handle complex alias commands', () => {
      const content = "alias gitlog='git log --oneline --graph --all'";
      const result = ShellParser.parse(content);

      expect(result.lines[0].alias?.command).toBe('git log --oneline --graph --all');
    });
  });

  describe('execute', () => {
    it('should execute aliases with AliasManager', () => {
      const content = `alias ll='ls -la'
alias la='ls -a'`;

      const parseResult = ShellParser.parse(content);
      const aliasManager = new AliasManager();

      const executeResult = ShellParser.execute(parseResult, aliasManager);

      expect(executeResult.success).toBe(true);
      expect(executeResult.appliedAliases).toEqual(['ll', 'la']);
      expect(executeResult.errors).toHaveLength(0);

      expect(aliasManager.hasAlias('ll')).toBe(true);
      expect(aliasManager.hasAlias('la')).toBe(true);
    });

    it('should handle invalid aliases', () => {
      const content = "alias 123='ls -la'"; // Invalid alias name

      const parseResult = ShellParser.parse(content);
      const aliasManager = new AliasManager();

      const executeResult = ShellParser.execute(parseResult, aliasManager);

      expect(executeResult.success).toBe(false);
      expect(executeResult.errors).toHaveLength(1);
      expect(executeResult.appliedAliases).toHaveLength(0);
    });

    it('should skip commands and exports', () => {
      const content = `alias ll='ls -la'
export PATH="/usr/bin"
ls -la`;

      const parseResult = ShellParser.parse(content);
      const aliasManager = new AliasManager();

      const executeResult = ShellParser.execute(parseResult, aliasManager);

      expect(executeResult.success).toBe(true);
      expect(executeResult.appliedAliases).toEqual(['ll']);
      expect(aliasManager.hasAlias('ll')).toBe(true);
    });
  });

  describe('validateAlias', () => {
    it('should validate correct alias', () => {
      const result = ShellParser.validateAlias('ll', 'ls -la');
      expect(result.valid).toBe(true);
    });

    it('should reject empty name', () => {
      const result = ShellParser.validateAlias('', 'ls -la');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject invalid name characters', () => {
      const result = ShellParser.validateAlias('my-alias', 'ls -la');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid alias name');
    });

    it('should reject empty command', () => {
      const result = ShellParser.validateAlias('ll', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should detect dangerous commands', () => {
      const dangerousCommands = ['rm -rf /', 'something > /dev/null 2>&1 && rm', 'eval(something)', 'ls $(rm -rf /)'];

      dangerousCommands.forEach((cmd) => {
        const result = ShellParser.validateAlias('test', cmd);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('dangerous');
      });
    });
  });

  describe('formatAlias', () => {
    it('should format simple alias without quotes', () => {
      const result = ShellParser.formatAlias('ll', 'ls');
      expect(result).toBe('alias ll=ls');
    });

    it('should format alias with quotes when needed', () => {
      const result = ShellParser.formatAlias('ll', 'ls -la');
      expect(result).toBe("alias ll='ls -la'");
    });

    it('should escape single quotes in command', () => {
      const result = ShellParser.formatAlias('test', "echo 'hello'");
      expect(result).toBe("alias test='echo '\\''hello'\\'''");
    });

    it('should quote commands with special characters', () => {
      const specialChars = ['&', '|', ';', '<', '>', '(', ')', '{', '}', '[', ']', '$', '`'];

      specialChars.forEach((char) => {
        const result = ShellParser.formatAlias('test', `ls ${char}`);
        expect(result).toBe(`alias test='ls ${char}'`);
      });
    });
  });
});
