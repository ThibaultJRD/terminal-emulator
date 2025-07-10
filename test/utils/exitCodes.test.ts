import { describe, expect, it } from 'vitest';

import { getFilesystemByMode } from '~/constants/defaultFilesystems';
import { parseChainedCommand } from '~/routes/terminal/utils/commandParser';
import { executeCommand } from '~/routes/terminal/utils/commands';

describe('Exit Codes and Command Chaining', () => {
  const filesystem = {
    root: getFilesystemByMode('default'),
    currentPath: ['home', 'user'],
  };

  describe('Exit Codes', () => {
    it('should return exit code 0 for successful commands', () => {
      const result = executeCommand('echo "hello"', filesystem);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
    });

    it('should return exit code 1 for failed commands', () => {
      const result = executeCommand('ls nonexistent', filesystem);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
    });

    it('should return exit code 127 for unknown commands', () => {
      const result = executeCommand('unknowncommand', filesystem);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(127);
    });

    it('should display last exit code with echo $?', () => {
      const result = executeCommand('echo $?', filesystem, undefined, 42);
      expect(result.success).toBe(true);
      expect(result.output).toBe('42\n');
      expect(result.exitCode).toBe(0);
    });

    it('should substitute $? in string arguments', () => {
      const result = executeCommand('echo "Exit code was $?"', filesystem, undefined, 5);
      expect(result.success).toBe(true);
      expect(result.output).toBe('Exit code was 5\n');
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Command Chaining Parser', () => {
    it('should parse single commands correctly', () => {
      const result = parseChainedCommand('echo hello');
      expect(result).toEqual({
        command: 'echo',
        args: ['hello'],
      });
    });

    it('should parse && operator', () => {
      const result = parseChainedCommand('echo hello && echo world');
      expect('commands' in result).toBe(true);
      if ('commands' in result) {
        expect(result.commands).toHaveLength(2);
        expect(result.operators).toEqual(['&&']);
        expect(result.commands[0].command).toBe('echo');
        expect(result.commands[0].args).toEqual(['hello']);
        expect(result.commands[1].command).toBe('echo');
        expect(result.commands[1].args).toEqual(['world']);
      }
    });

    it('should parse || operator', () => {
      const result = parseChainedCommand('false || echo backup');
      expect('commands' in result).toBe(true);
      if ('commands' in result) {
        expect(result.commands).toHaveLength(2);
        expect(result.operators).toEqual(['||']);
        expect(result.commands[0].command).toBe('false');
        expect(result.commands[1].command).toBe('echo');
        expect(result.commands[1].args).toEqual(['backup']);
      }
    });

    it('should parse multiple chained commands', () => {
      const result = parseChainedCommand('echo a && echo b || echo c');
      expect('commands' in result).toBe(true);
      if ('commands' in result) {
        expect(result.commands).toHaveLength(3);
        expect(result.operators).toEqual(['&&', '||']);
      }
    });
  });

  describe('Command Chaining Execution', () => {
    it('should execute second command when first succeeds with &&', () => {
      const result = executeCommand('echo first && echo second', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('first\nsecond\n');
      expect(result.exitCode).toBe(0);
    });

    it('should not execute second command when first fails with &&', () => {
      const result = executeCommand('ls nonexistent && echo should_not_appear', filesystem);
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.output).not.toContain('should_not_appear');
    });

    it('should execute second command when first fails with ||', () => {
      const result = executeCommand('ls nonexistent || echo fallback', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toContain('fallback');
      expect(result.exitCode).toBe(0);
    });

    it('should not execute second command when first succeeds with ||', () => {
      const result = executeCommand('echo success || echo should_not_appear', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('success\n');
      expect(result.exitCode).toBe(0);
      expect(result.output).not.toContain('should_not_appear');
    });

    it('should handle complex chaining scenarios', () => {
      // mkdir should succeed, echo should execute, ls should succeed
      const result = executeCommand('mkdir testdir && echo "Created" && ls', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toContain('Created');
      expect(result.exitCode).toBe(0);
    });

    it('should return exit code of last executed command', () => {
      // First command fails, second succeeds
      const result = executeCommand('ls nonexistent || echo "recovered"', filesystem);
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0); // exit code of echo
    });
  });
});
