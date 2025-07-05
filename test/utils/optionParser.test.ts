import { describe, expect, it } from 'vitest';

import { parseOptions } from '~/routes/terminal/utils/optionParser';

describe('Option Parser', () => {
  describe('Single short options', () => {
    it('should parse single short options', () => {
      const result = parseOptions(['-a']);
      expect(result.flags.has('a')).toBe(true);
      expect(result.positionalArgs).toEqual([]);
    });

    it('should parse multiple single short options', () => {
      const result = parseOptions(['-a', '-l']);
      expect(result.flags.has('a')).toBe(true);
      expect(result.flags.has('l')).toBe(true);
      expect(result.positionalArgs).toEqual([]);
    });
  });

  describe('Combined short options', () => {
    it('should parse combined short options', () => {
      const result = parseOptions(['-la']);
      expect(result.flags.has('l')).toBe(true);
      expect(result.flags.has('a')).toBe(true);
      expect(result.positionalArgs).toEqual([]);
    });

    it('should parse complex combined options', () => {
      const result = parseOptions(['-rf']);
      expect(result.flags.has('r')).toBe(true);
      expect(result.flags.has('f')).toBe(true);
      expect(result.positionalArgs).toEqual([]);
    });

    it('should parse mixed combined and single options', () => {
      const result = parseOptions(['-la', '-v']);
      expect(result.flags.has('l')).toBe(true);
      expect(result.flags.has('a')).toBe(true);
      expect(result.flags.has('v')).toBe(true);
      expect(result.positionalArgs).toEqual([]);
    });
  });

  describe('Long options', () => {
    it('should parse long options', () => {
      const result = parseOptions(['--verbose']);
      expect(result.flags.has('verbose')).toBe(true);
      expect(result.positionalArgs).toEqual([]);
    });

    it('should parse multiple long options', () => {
      const result = parseOptions(['--verbose', '--help']);
      expect(result.flags.has('verbose')).toBe(true);
      expect(result.flags.has('help')).toBe(true);
      expect(result.positionalArgs).toEqual([]);
    });
  });

  describe('Positional arguments', () => {
    it('should parse positional arguments', () => {
      const result = parseOptions(['file1', 'file2']);
      expect(result.flags.size).toBe(0);
      expect(result.positionalArgs).toEqual(['file1', 'file2']);
    });

    it('should parse mixed options and positional arguments', () => {
      const result = parseOptions(['-la', 'directory', 'file']);
      expect(result.flags.has('l')).toBe(true);
      expect(result.flags.has('a')).toBe(true);
      expect(result.positionalArgs).toEqual(['directory', 'file']);
    });

    it('should handle options and arguments in any order', () => {
      const result = parseOptions(['file1', '-a', 'file2', '-l']);
      expect(result.flags.has('a')).toBe(true);
      expect(result.flags.has('l')).toBe(true);
      expect(result.positionalArgs).toEqual(['file1', 'file2']);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty args', () => {
      const result = parseOptions([]);
      expect(result.flags.size).toBe(0);
      expect(result.positionalArgs).toEqual([]);
    });

    it('should handle single dash as positional argument', () => {
      const result = parseOptions(['-']);
      expect(result.flags.size).toBe(0);
      expect(result.positionalArgs).toEqual(['-']);
    });

    it('should handle double dash without name', () => {
      const result = parseOptions(['--']);
      expect(result.flags.has('')).toBe(true);
      expect(result.positionalArgs).toEqual([]);
    });

    it('should handle complex real-world example', () => {
      const result = parseOptions(['-rf', 'folder1', '--verbose', 'folder2']);
      expect(result.flags.has('r')).toBe(true);
      expect(result.flags.has('f')).toBe(true);
      expect(result.flags.has('verbose')).toBe(true);
      expect(result.positionalArgs).toEqual(['folder1', 'folder2']);
    });
  });
});
