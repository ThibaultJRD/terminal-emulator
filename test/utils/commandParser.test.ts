import { describe, expect, it } from 'vitest';

import { parseChainedCommand, parseCommand } from '~/routes/terminal/utils/commandParser';

describe('Command Parser', () => {
  describe('Basic command parsing', () => {
    it('should parse simple commands', () => {
      const result = parseCommand('ls');
      expect(result.command).toBe('ls');
      expect(result.args).toEqual([]);
      expect(result.redirectOutput).toBeUndefined();
      expect(result.redirectInput).toBeUndefined();
    });

    it('should parse commands with arguments', () => {
      const result = parseCommand('ls -la /home');
      expect(result.command).toBe('ls');
      expect(result.args).toEqual(['-la', '/home']);
    });

    it('should handle quoted arguments', () => {
      const result = parseCommand('echo "hello world"');
      expect(result.command).toBe('echo');
      expect(result.args).toEqual(['hello world']);
    });

    it('should handle single quoted arguments', () => {
      const result = parseCommand("echo 'hello world'");
      expect(result.command).toBe('echo');
      expect(result.args).toEqual(['hello world']);
    });

    it('should handle mixed quotes and spaces', () => {
      const result = parseCommand('echo "hello world" test "another quote"');
      expect(result.command).toBe('echo');
      expect(result.args).toEqual(['hello world', 'test', 'another quote']);
    });
  });

  describe('Output redirection parsing', () => {
    it('should parse output redirection with >', () => {
      const result = parseCommand('echo hello > file.txt');
      expect(result.command).toBe('echo');
      expect(result.args).toEqual(['hello']);
      expect(result.redirectOutput).toEqual({
        type: '>',
        filename: 'file.txt',
      });
    });

    it('should parse output redirection with >>', () => {
      const result = parseCommand('ls -la >> output.log');
      expect(result.command).toBe('ls');
      expect(result.args).toEqual(['-la']);
      expect(result.redirectOutput).toEqual({
        type: '>>',
        filename: 'output.log',
      });
    });

    it('should handle quoted filenames in redirection', () => {
      const result = parseCommand('echo test > "file with spaces.txt"');
      expect(result.command).toBe('echo');
      expect(result.args).toEqual(['test']);
      expect(result.redirectOutput).toEqual({
        type: '>',
        filename: 'file with spaces.txt',
      });
    });

    it('should handle complex commands with redirection', () => {
      const result = parseCommand('echo "Hello les amis comment allez vous ?" > test.txt');
      expect(result.command).toBe('echo');
      expect(result.args).toEqual(['Hello les amis comment allez vous ?']);
      expect(result.redirectOutput).toEqual({
        type: '>',
        filename: 'test.txt',
      });
    });
  });

  describe('Input redirection parsing', () => {
    it('should parse input redirection with <', () => {
      const result = parseCommand('wc < input.txt');
      expect(result.command).toBe('wc');
      expect(result.args).toEqual([]);
      expect(result.redirectInput).toEqual({
        type: '<',
        source: 'input.txt',
      });
    });

    it('should parse heredoc with <<', () => {
      const result = parseCommand('cat << EOF');
      expect(result.command).toBe('cat');
      expect(result.args).toEqual([]);
      expect(result.redirectInput).toEqual({
        type: '<<',
        source: 'EOF',
      });
    });

    it('should handle commands with arguments and input redirection', () => {
      const result = parseCommand('grep -n pattern < file.txt');
      expect(result.command).toBe('grep');
      expect(result.args).toEqual(['-n', 'pattern']);
      expect(result.redirectInput).toEqual({
        type: '<',
        source: 'file.txt',
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty input', () => {
      const result = parseCommand('');
      expect(result.command).toBe('');
      expect(result.args).toEqual([]);
    });

    it('should handle whitespace-only input', () => {
      const result = parseCommand('   ');
      expect(result.command).toBe('');
      expect(result.args).toEqual([]);
    });

    it('should handle commands with only spaces', () => {
      const result = parseCommand('  ls   -la  ');
      expect(result.command).toBe('ls');
      expect(result.args).toEqual(['-la']);
    });

    it('should prioritize output redirection over input redirection when both are present', () => {
      const result = parseCommand('command < input > output');
      expect(result.redirectOutput).toEqual({
        type: '>',
        filename: 'output',
      });
      expect(result.redirectInput).toBeUndefined();
    });
  });

  describe('Pipe command parsing', () => {
    it('should parse simple pipe command', () => {
      const result = parseChainedCommand('ls | grep test');
      expect('commands' in result).toBe(true);

      if ('commands' in result) {
        expect(result.commands).toHaveLength(2);
        expect(result.operators).toEqual(['|']);
        expect(result.commands[0].command).toBe('ls');
        expect(result.commands[1].command).toBe('grep');
        expect(result.commands[1].args).toEqual(['test']);
      }
    });

    it('should parse multiple pipe commands', () => {
      const result = parseChainedCommand('cat file.txt | grep pattern | sort');
      expect('commands' in result).toBe(true);

      if ('commands' in result) {
        expect(result.commands).toHaveLength(3);
        expect(result.operators).toEqual(['|', '|']);
        expect(result.commands[0].command).toBe('cat');
        expect(result.commands[0].args).toEqual(['file.txt']);
        expect(result.commands[1].command).toBe('grep');
        expect(result.commands[1].args).toEqual(['pattern']);
        expect(result.commands[2].command).toBe('sort');
      }
    });

    it('should parse pipe command with flags', () => {
      const result = parseChainedCommand('ls -la | grep -i test | head -5');
      expect('commands' in result).toBe(true);

      if ('commands' in result) {
        expect(result.commands).toHaveLength(3);
        expect(result.commands[0].args).toEqual(['-la']);
        expect(result.commands[1].args).toEqual(['-i', 'test']);
        expect(result.commands[2].args).toEqual(['-5']);
      }
    });

    it('should not allow mixing pipes with other operators', () => {
      expect(() => parseChainedCommand('ls | grep test && echo done')).toThrow('Cannot mix pipe operators (|) with other chaining operators (&&, ||, ;)');
    });

    it('should distinguish between pipe (|) and OR (||) operators', () => {
      const pipeResult = parseChainedCommand('ls | grep test');
      const orResult = parseChainedCommand('ls nonexistent || echo failed');

      expect('commands' in pipeResult).toBe(true);
      expect('commands' in orResult).toBe(true);

      if ('commands' in pipeResult && 'commands' in orResult) {
        expect(pipeResult.operators).toEqual(['|']);
        expect(orResult.operators).toEqual(['||']);
      }
    });

    it('should handle quoted arguments in pipes', () => {
      const result = parseChainedCommand('echo "hello world" | grep "hello"');
      expect('commands' in result).toBe(true);

      if ('commands' in result) {
        expect(result.commands[0].args).toEqual(['hello world']);
        expect(result.commands[1].args).toEqual(['hello']);
      }
    });

    it('should validate command length in pipes', () => {
      const longCommand = 'a'.repeat(1001);
      expect(() => parseChainedCommand(`${longCommand} | grep test`)).toThrow('Command too long (max 1000 characters)');
    });
  });
});
