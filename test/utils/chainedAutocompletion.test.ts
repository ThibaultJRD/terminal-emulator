import { describe, expect, it } from 'vitest';

import { getFilesystemByMode } from '~/constants/defaultFilesystems';
import { applyCompletion, getAutocompletions } from '~/routes/terminal/utils/autocompletion';

describe('Chained Command Autocompletion', () => {
  const filesystem = {
    root: getFilesystemByMode('default'),
    currentPath: ['home', 'user'],
  };

  describe('Command Context Detection', () => {
    it('should detect command completion after && operator', () => {
      const result = getAutocompletions('echo hello && ', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
      expect(result.completions).toContain('ls');
      expect(result.completions).toContain('pwd');
      expect(result.completions).toContain('echo');
    });

    it('should detect command completion after || operator', () => {
      const result = getAutocompletions('ls nonexistent || ', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
      expect(result.completions).toContain('echo');
      expect(result.completions).toContain('mkdir');
    });

    it('should detect command completion after ; operator', () => {
      const result = getAutocompletions('echo first; ', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
      expect(result.completions).toContain('ls');
      expect(result.completions).toContain('pwd');
      expect(result.completions).toContain('echo');
    });

    it('should complete partial commands after operators', () => {
      const result = getAutocompletions('echo hello && ec', filesystem);
      expect(result.completions).toContain('echo');
      expect(result.completions.length).toBe(1);
    });

    it('should complete partial commands after ; operator', () => {
      const result = getAutocompletions('ls; pw', filesystem);
      expect(result.completions).toContain('pwd');
    });

    it('should handle multiple chained commands', () => {
      const result = getAutocompletions('echo a && echo b || ', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
      expect(result.completions).toContain('echo');
      expect(result.completions).toContain('ls');
    });

    it('should handle mixed operators', () => {
      const result = getAutocompletions('echo a ; echo b && ', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
      expect(result.completions).toContain('echo');
      expect(result.completions).toContain('ls');
    });
  });

  describe('File Completion in Chained Context', () => {
    it('should complete files for commands that expect files after chaining', () => {
      // After completing the command, should complete files when appropriate
      const result = getAutocompletions('echo hello && cat ', filesystem);
      // Note: This should complete files, not commands, because cat expects files
      // The test verifies that normal command behavior still works after chaining
      expect(result.completions.length).toBeGreaterThan(0);
    });

    it('should complete directories for cd command after chaining', () => {
      const result = getAutocompletions('echo hello && cd ', filesystem);
      // Should complete directories for cd command
      expect(result.completions.length).toBeGreaterThan(0);
    });
  });

  describe('Apply Completion in Chained Context', () => {
    it('should correctly apply command completion after && operator', () => {
      const input = 'echo hello && ';
      const completion = 'ls';
      const result = applyCompletion(input, completion);
      expect(result).toBe('echo hello && ls ');
    });

    it('should correctly apply command completion after || operator', () => {
      const input = 'ls nonexistent || ec';
      const completion = 'echo';
      const result = applyCompletion(input, completion);
      expect(result).toBe('ls nonexistent || echo ');
    });

    it('should correctly apply command completion after ; operator', () => {
      const input = 'echo first; ';
      const completion = 'pwd';
      const result = applyCompletion(input, completion);
      expect(result).toBe('echo first; pwd ');
    });

    it('should correctly apply partial command completion', () => {
      const input = 'echo hello && ec';
      const completion = 'echo';
      const result = applyCompletion(input, completion);
      expect(result).toBe('echo hello && echo ');
    });

    it('should preserve the original command chain structure', () => {
      const input = 'mkdir test && echo success || echo failed; l';
      const completion = 'ls';
      const result = applyCompletion(input, completion);
      expect(result).toBe('mkdir test && echo success || echo failed; ls ');
    });

    it('should handle file completion in chained context', () => {
      const input = 'echo hello && cat ';
      const completion = 'file.txt';
      const result = applyCompletion(input, completion);
      expect(result).toBe('echo hello && cat file.txt');
    });

    it('should handle multiple levels of chaining', () => {
      const input = 'echo a; echo b && echo c || ';
      const completion = 'echo';
      const result = applyCompletion(input, completion);
      expect(result).toBe('echo a; echo b && echo c || echo ');
    });
  });

  describe('Edge Cases', () => {
    it('should handle operators with varying whitespace', () => {
      const result1 = getAutocompletions('echo hello&&', filesystem);
      const result2 = getAutocompletions('echo hello  &&  ', filesystem);
      expect(result1.completions.length).toBeGreaterThan(0);
      expect(result2.completions.length).toBeGreaterThan(0);
    });

    it('should handle nested operators correctly', () => {
      const result = getAutocompletions('echo "test && another" && ', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
      expect(result.completions).toContain('echo');
    });

    it('should handle quoted strings with operators', () => {
      const result = getAutocompletions('echo "hello; world" ; ', filesystem);
      expect(result.completions.length).toBeGreaterThan(0);
      expect(result.completions).toContain('ls');
    });
  });
});
