import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FileSystemState, TerminalState } from '~/routes/terminal/types/filesystem';
import { AliasManager } from '~/routes/terminal/utils/aliasManager';
import { createDefaultFileSystem, createDirectory, createFile } from '~/routes/terminal/utils/filesystem';
import {
  addToHistory,
  analyzeSpecialCommand,
  createOutputLine,
  executeCommandSafely,
  getHistoryForNavigation,
  handleFilesystemReset,
  handleFilesystemSaveAfterCommand,
  handleTextEditorOpen,
  initializeTerminalState,
  loadHistoryFromFile,
  navigateHistory,
  saveHistoryToFile,
  shouldSaveFilesystemImmediately,
  updateTerminalStateAfterCommand,
} from '~/routes/terminal/utils/terminalHandlers';

describe('terminalHandlers', () => {
  let filesystem: FileSystemState;
  let terminalState: TerminalState;

  beforeEach(() => {
    filesystem = createDefaultFileSystem();
    // Create home/user directory structure
    createDirectory(filesystem, [], 'home');
    createDirectory(filesystem, ['home'], 'user');

    terminalState = {
      currentInput: '',
      output: [],
      filesystem,
      aliasManager: new AliasManager(),
      lastExitCode: 0,
    };
  });

  describe('executeCommandSafely', () => {
    it('should execute valid commands', () => {
      const result = executeCommandSafely('pwd', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('/home/user');
    });

    it('should handle command execution errors', () => {
      const result = executeCommandSafely('invalid-command', filesystem);
      expect(result.success).toBe(false);
      expect(result.error).toContain('command not found');
      expect(result.exitCode).toBe(127);
    });

    it('should handle alias manager', () => {
      const aliasManager = new AliasManager();
      aliasManager.setAlias('ll', 'ls -la');

      const result = executeCommandSafely('ll', filesystem, aliasManager);
      expect(result.success).toBe(true);
    });

    it('should handle lastExitCode parameter', () => {
      const result = executeCommandSafely('pwd', filesystem, undefined, 1);
      expect(result.success).toBe(true);
    });
  });

  describe('analyzeSpecialCommand', () => {
    it('should detect clear command', () => {
      const result = { success: true, output: 'CLEAR', error: '', exitCode: 0 };
      const analyzed = analyzeSpecialCommand(result);
      expect(analyzed).toEqual({ type: 'clear' });
    });

    it('should detect reset filesystem command', () => {
      const result = { success: true, output: 'RESET_FILESYSTEM', error: '', exitCode: 0 };
      const analyzed = analyzeSpecialCommand(result);
      expect(analyzed).toEqual({ type: 'reset_filesystem' });
    });

    it('should detect editor open command', () => {
      const content = 'SGVsbG8gV29ybGQ='; // Base64 encoded "Hello World"
      const result = { success: true, output: `OPEN_EDITOR:test.txt:${content}`, error: '', exitCode: 0 };
      const analyzed = analyzeSpecialCommand(result);
      expect(analyzed).toEqual({
        type: 'open_editor',
        data: { filename: 'test.txt', content: 'Hello World' },
      });
    });

    it('should handle editor open without content', () => {
      const result = { success: true, output: 'OPEN_EDITOR:newfile.txt', error: '', exitCode: 0 };
      const analyzed = analyzeSpecialCommand(result);
      expect(analyzed).toEqual({
        type: 'open_editor',
        data: { filename: 'newfile.txt', content: '' },
      });
    });

    it('should return normal for non-special commands', () => {
      const result = { success: true, output: 'Regular output', error: '', exitCode: 0 };
      const analyzed = analyzeSpecialCommand(result);
      expect(analyzed).toEqual({ type: 'normal' });
    });

    it('should return normal for failed commands', () => {
      const result = { success: false, output: 'CLEAR', error: 'Error', exitCode: 1 };
      const analyzed = analyzeSpecialCommand(result);
      expect(analyzed).toEqual({ type: 'normal' });
    });

    it('should return normal for non-string output', () => {
      const result = { success: true, output: [], error: '', exitCode: 0 };
      const analyzed = analyzeSpecialCommand(result);
      expect(analyzed).toEqual({ type: 'normal' });
    });
  });

  describe('shouldSaveFilesystemImmediately', () => {
    it('should return true for filesystem commands', () => {
      const filesystemCommands = ['touch', 'mkdir', 'rm', 'rmdir', 'nano', 'vi'];
      const result = { success: true, output: '', error: '', exitCode: 0 };

      filesystemCommands.forEach((cmd) => {
        expect(shouldSaveFilesystemImmediately(cmd, result)).toBe(true);
        expect(shouldSaveFilesystemImmediately(`${cmd} file.txt`, result)).toBe(true);
      });
    });

    it('should return true for redirection commands', () => {
      const result = { success: true, output: '', error: '', exitCode: 0 };

      expect(shouldSaveFilesystemImmediately('echo "test" > file.txt', result)).toBe(true);
      expect(shouldSaveFilesystemImmediately('cat file.txt >> output.txt', result)).toBe(true);
    });

    it('should return false for non-filesystem commands', () => {
      const result = { success: true, output: '', error: '', exitCode: 0 };

      expect(shouldSaveFilesystemImmediately('ls', result)).toBe(false);
      expect(shouldSaveFilesystemImmediately('pwd', result)).toBe(false);
      expect(shouldSaveFilesystemImmediately('cd /home', result)).toBe(false);
    });

    it('should return false for failed commands', () => {
      const result = { success: false, output: '', error: 'Error', exitCode: 1 };

      expect(shouldSaveFilesystemImmediately('touch file.txt', result)).toBe(false);
    });
  });

  describe('handleFilesystemSaveAfterCommand', () => {
    it('should trigger save for filesystem commands', async () => {
      const result = { success: true, output: '', error: '', exitCode: 0 };
      const saveImmediately = vi.fn().mockResolvedValue(true);

      const shouldSave = handleFilesystemSaveAfterCommand('touch file.txt', result, saveImmediately);
      expect(shouldSave).toBe(true);
      expect(saveImmediately).toHaveBeenCalled();
    });

    it('should not trigger save for non-filesystem commands', () => {
      const result = { success: true, output: '', error: '', exitCode: 0 };
      const saveImmediately = vi.fn().mockResolvedValue(true);

      const shouldSave = handleFilesystemSaveAfterCommand('ls', result, saveImmediately);
      expect(shouldSave).toBe(false);
      expect(saveImmediately).not.toHaveBeenCalled();
    });

    it('should handle save failures gracefully', async () => {
      const result = { success: true, output: '', error: '', exitCode: 0 };
      const saveImmediately = vi.fn().mockRejectedValue(new Error('Save failed'));

      const shouldSave = handleFilesystemSaveAfterCommand('touch file.txt', result, saveImmediately);
      expect(shouldSave).toBe(true);
      expect(saveImmediately).toHaveBeenCalled();
    });
  });

  describe('createOutputLine', () => {
    it('should create output line with string content', () => {
      const line = createOutputLine('output', 'Test output');
      expect(line).toEqual({
        type: 'output',
        content: 'Test output',
        timestamp: expect.any(String),
      });
    });

    it('should create output line with OutputSegment array', () => {
      const segments = [{ text: 'Test', type: 'normal' as const }];
      const line = createOutputLine('command', segments);
      expect(line).toEqual({
        type: 'command',
        content: segments,
        timestamp: expect.any(String),
      });
    });

    it('should create error output line', () => {
      const line = createOutputLine('error', 'Error message');
      expect(line.type).toBe('error');
      expect(line.content).toBe('Error message');
    });
  });

  describe('history management', () => {
    describe('addToHistory', () => {
      it('should add command to history', () => {
        const history = ['cmd1', 'cmd2'];
        const newHistory = addToHistory(history, 'cmd3');
        expect(newHistory).toEqual(['cmd1', 'cmd2', 'cmd3']);
      });

      it('should not add empty commands', () => {
        const history = ['cmd1'];
        expect(addToHistory(history, '')).toEqual(['cmd1']);
        expect(addToHistory(history, '   ')).toEqual(['cmd1']);
      });

      it('should limit history size', () => {
        const largeHistory = Array.from({ length: 1000 }, (_, i) => `cmd${i}`);
        const newHistory = addToHistory(largeHistory, 'newcmd');
        expect(newHistory.length).toBe(1000);
        expect(newHistory[0]).toBe('cmd1'); // First command removed
        expect(newHistory[999]).toBe('newcmd'); // New command added
      });
    });

    describe('saveHistoryToFile and loadHistoryFromFile', () => {
      it('should save and load history', () => {
        const history = ['cmd1', 'cmd2', 'cmd3'];

        const saved = saveHistoryToFile(filesystem, history);
        expect(saved).toBe(true);

        const loaded = loadHistoryFromFile(filesystem);
        expect(loaded).toEqual(history);
      });

      it('should handle empty history', () => {
        const saved = saveHistoryToFile(filesystem, []);
        expect(saved).toBe(true);

        const loaded = loadHistoryFromFile(filesystem);
        expect(loaded).toEqual([]);
      });

      it('should return empty array when no history file exists', () => {
        const loaded = loadHistoryFromFile(filesystem);
        expect(loaded).toEqual([]);
      });

      it('should handle corrupted history file', () => {
        // Create a corrupted history file
        createFile(filesystem, ['home', 'user'], '.history', 'corrupted\ncontent\n');

        const loaded = loadHistoryFromFile(filesystem);
        expect(loaded).toEqual(['corrupted', 'content']);
      });

      it('should limit loaded history size', () => {
        const largeHistory = Array.from({ length: 1500 }, (_, i) => `cmd${i}`);
        const historyContent = largeHistory.join('\n');
        createFile(filesystem, ['home', 'user'], '.history', historyContent);

        const loaded = loadHistoryFromFile(filesystem);
        expect(loaded.length).toBe(1000);
        expect(loaded[0]).toBe('cmd500'); // First 500 commands trimmed
      });
    });

    describe('getHistoryForNavigation', () => {
      it('should return history for navigation', () => {
        const history = ['cmd1', 'cmd2', 'cmd3'];
        saveHistoryToFile(filesystem, history);

        const navHistory = getHistoryForNavigation(filesystem);
        expect(navHistory).toEqual(history);
      });
    });

    describe('navigateHistory', () => {
      beforeEach(() => {
        const history = ['cmd1', 'cmd2', 'cmd3'];
        saveHistoryToFile(filesystem, history);
      });

      it('should navigate up from end', () => {
        const result = navigateHistory(filesystem, 'up', -1);
        expect(result).toEqual({ newInput: 'cmd3', newIndex: 2 });
      });

      it('should navigate up in history', () => {
        const result = navigateHistory(filesystem, 'up', 2);
        expect(result).toEqual({ newInput: 'cmd2', newIndex: 1 });
      });

      it('should not navigate up past beginning', () => {
        const result = navigateHistory(filesystem, 'up', 0);
        expect(result).toEqual({ newInput: 'cmd1', newIndex: 0 });
      });

      it('should navigate down in history', () => {
        const result = navigateHistory(filesystem, 'down', 0);
        expect(result).toEqual({ newInput: 'cmd2', newIndex: 1 });
      });

      it('should navigate down to empty at end', () => {
        const result = navigateHistory(filesystem, 'down', 2);
        expect(result).toEqual({ newInput: '', newIndex: -1 });
      });

      it('should handle down from empty state', () => {
        const result = navigateHistory(filesystem, 'down', -1);
        expect(result).toEqual({ newInput: '', newIndex: -1 });
      });

      it('should handle empty history', () => {
        const emptyFs = createDefaultFileSystem();
        createDirectory(emptyFs, [], 'home');
        createDirectory(emptyFs, ['home'], 'user');

        const result = navigateHistory(emptyFs, 'up', -1);
        expect(result).toEqual({ newInput: '', newIndex: -1 });
      });
    });
  });

  describe('initializeTerminalState', () => {
    it('should initialize terminal state', () => {
      const state = initializeTerminalState(filesystem);
      expect(state).toEqual({
        currentInput: '',
        output: [],
        filesystem,
        aliasManager: expect.any(AliasManager),
        lastExitCode: 0,
      });
    });

    it('should auto-source .bashrc if it exists', () => {
      createFile(filesystem, ['home', 'user'], '.bashrc', 'alias ll="ls -la"');

      const state = initializeTerminalState(filesystem);
      expect(state.aliasManager.getAlias('ll')).toEqual({ name: 'll', command: 'ls -la', createdAt: expect.any(Date) });
    });

    it('should handle .bashrc errors gracefully', () => {
      createFile(filesystem, ['home', 'user'], '.bashrc', 'invalid syntax');

      const state = initializeTerminalState(filesystem);
      expect(state.aliasManager).toBeDefined();
    });
  });

  describe('updateTerminalStateAfterCommand', () => {
    it('should update terminal state and preserve history', () => {
      const initialHistory = ['cmd1', 'cmd2'];
      saveHistoryToFile(filesystem, initialHistory);

      const newState = updateTerminalStateAfterCommand(terminalState, 'cmd3', 0);

      expect(newState.currentInput).toBe('');
      expect(newState.lastExitCode).toBe(0);
      expect(newState.output).toBe(terminalState.output);

      const savedHistory = loadHistoryFromFile(newState.filesystem);
      expect(savedHistory).toEqual(['cmd1', 'cmd2', 'cmd3']);
    });

    it('should handle filesystem immutability', () => {
      const originalFs = terminalState.filesystem;
      const newState = updateTerminalStateAfterCommand(terminalState, 'test', 1);

      expect(newState.filesystem).not.toBe(originalFs);
      expect(newState.lastExitCode).toBe(1);
    });

    it('should preserve lastExitCode when not provided', () => {
      terminalState.lastExitCode = 42;
      const newState = updateTerminalStateAfterCommand(terminalState, 'test');
      expect(newState.lastExitCode).toBe(42);
    });
  });

  describe('handleFilesystemReset', () => {
    it('should reset filesystem to default mode', () => {
      const result = handleFilesystemReset('default', terminalState, 'reset-fs');

      expect(result.newTerminalState.filesystem).toBeDefined();
      expect(result.newTerminalState.currentInput).toBe('');
      expect(result.newTerminalState.lastExitCode).toBe(0);
      expect(result.outputLine.type).toBe('output');
      expect(result.outputLine.content).toBe('Reset to default default filesystem');
    });

    it('should reset filesystem to portfolio mode', () => {
      const result = handleFilesystemReset('portfolio', terminalState, 'reset-fs');

      expect(result.newTerminalState.filesystem).toBeDefined();
      expect(result.outputLine.content).toBe('Reset to default portfolio filesystem');
    });

    it('should preserve existing history', () => {
      const history = ['cmd1', 'cmd2'];
      saveHistoryToFile(filesystem, history);

      const result = handleFilesystemReset('default', terminalState, 'reset-fs');
      const preservedHistory = loadHistoryFromFile(result.newTerminalState.filesystem);
      expect(preservedHistory).toEqual(history);
    });
  });

  describe('handleTextEditorOpen', () => {
    it('should open text editor with content', () => {
      const result = handleTextEditorOpen('test.txt', 'Hello World', terminalState, 'vi test.txt');

      expect(result.newTerminalState.currentInput).toBe('');
      expect(result.newTerminalState.lastExitCode).toBe(0);
      expect(result.editorState.filename).toBe('test.txt');
      expect(result.editorState.content).toBe('Hello World');
    });

    it('should open text editor with empty content', () => {
      const result = handleTextEditorOpen('newfile.txt', '', terminalState, 'vi newfile.txt');

      expect(result.editorState.filename).toBe('newfile.txt');
      expect(result.editorState.content).toBe('');
    });

    it('should preserve terminal state', () => {
      const result = handleTextEditorOpen('test.txt', 'content', terminalState, 'vi test.txt');

      expect(result.newTerminalState.output).toBe(terminalState.output);
      expect(result.newTerminalState.filesystem).toBe(terminalState.filesystem);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed special commands', () => {
      const result = { success: true, output: 'OPEN_EDITOR:', error: '', exitCode: 0 };
      const analyzed = analyzeSpecialCommand(result);
      expect(analyzed.type).toBe('open_editor');
      expect(analyzed.data).toEqual({ filename: '', content: '' });
    });

    it('should handle invalid Base64 in editor command', () => {
      const result = { success: true, output: 'OPEN_EDITOR:test.txt:invalid-base64', error: '', exitCode: 0 };
      // This may throw - that's expected behavior for invalid Base64
      expect(() => analyzeSpecialCommand(result)).toThrow();
    });

    it('should handle filesystem operations on non-existent directories', () => {
      const invalidFs = createDefaultFileSystem();
      const loaded = loadHistoryFromFile(invalidFs);
      expect(loaded).toEqual([]);
    });
  });
});
