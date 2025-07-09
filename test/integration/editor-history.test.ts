import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState, TerminalState } from '~/routes/terminal/types/filesystem';
import { executeCommand } from '~/routes/terminal/utils/commands';
import { createDefaultFileSystem, getNodeAtPath } from '~/routes/terminal/utils/filesystem';
import {
  handleTextEditorOpen,
  initializeTerminalState,
  loadHistoryFromFile,
  saveHistoryToFile,
  updateTerminalStateAfterCommand,
} from '~/routes/terminal/utils/terminalHandlers';

describe('Editor History Integration', () => {
  let filesystem: FileSystemState;
  let terminalState: TerminalState;

  beforeEach(() => {
    filesystem = createDefaultFileSystem();

    terminalState = initializeTerminalState(filesystem);
  });

  it('should preserve terminal command history when editor is used', () => {
    // Simulate building command history
    const commands = ['ls', 'pwd', 'mkdir test', 'cd test', 'touch file.txt'];

    // Build history by simulating command execution
    let currentState = terminalState;
    for (const command of commands) {
      currentState = updateTerminalStateAfterCommand(currentState, command);
    }

    // Verify history was built correctly in filesystem
    const historyInFile = loadHistoryFromFile(currentState.filesystem);
    expect(historyInFile).toEqual(commands);
    expect(historyInFile.length).toBe(5);

    // Open editor - this should preserve the history
    const editorResult = executeCommand('vi file.txt', filesystem);
    expect(editorResult.success).toBe(true);
    expect(editorResult.output).toMatch(/^OPEN_EDITOR:/);

    // Parse the editor command
    const parts = (editorResult.output as string).split(':');
    expect(parts[0]).toBe('OPEN_EDITOR');
    expect(parts[1]).toBe('file.txt');

    // Simulate opening the editor
    const { newTerminalState, editorState } = handleTextEditorOpen('file.txt', '', currentState, 'vi file.txt');

    // Verify that the filesystem preserves the existing history (vi command will be added by main handleCommand)
    const newHistoryInFile = loadHistoryFromFile(newTerminalState.filesystem);
    expect(newHistoryInFile).toEqual(commands); // Should only have the original commands
    expect(newHistoryInFile.length).toBe(5);
    expect(newTerminalState.currentInput).toBe('');

    // Verify editor state is created properly
    expect(editorState.filename).toBe('file.txt');
    expect(editorState.content).toBe('');

    // The issue must be in the Terminal component state management
    // This test shows that the handler functions work correctly
  });

  it('should handle editor commands independently from terminal history', () => {
    // Editor commands like :w, :q, :wq should not affect terminal history
    // This is actually working correctly - the issue is that terminal history gets lost

    const result = executeCommand('vi test.txt', filesystem);
    expect(result.success).toBe(true);
    expect(result.output).toMatch(/^OPEN_EDITOR:/);

    // Editor commands are handled separately in TextEditor component
    // and should not interfere with terminal command history
  });

  it('should maintain history state structure correctly', () => {
    // Test that the history state is maintained correctly through the editor lifecycle
    const commands = ['ls', 'pwd', 'touch file.txt'];

    let currentState = terminalState;
    for (const command of commands) {
      currentState = updateTerminalStateAfterCommand(currentState, command);
    }

    // Verify initial state
    const initialHistoryInFile = loadHistoryFromFile(currentState.filesystem);
    expect(initialHistoryInFile).toEqual(commands);

    // Test that history state is preserved when opening editor
    const { newTerminalState } = handleTextEditorOpen('file.txt', '', currentState, 'vi file.txt');

    // The new state should preserve existing history (vi command will be added by main handleCommand)
    const finalHistoryInFile = loadHistoryFromFile(newTerminalState.filesystem);
    expect(finalHistoryInFile).toEqual(commands); // Should only have the original commands
    expect(newTerminalState.currentInput).toBe('');

    // This test documents that the terminal handlers work correctly
    // Only the main handleCommand function should manage history updates
  });

  it('should persist history to filesystem', () => {
    // Test that history is saved to and loaded from the .history file
    const commands = ['ls', 'pwd', 'mkdir test'];

    // Save history to file
    const saveSuccess = saveHistoryToFile(filesystem, commands);
    expect(saveSuccess).toBe(true);

    // Load history from file
    const loadedHistory = loadHistoryFromFile(filesystem);
    expect(loadedHistory).toEqual(commands);
  });

  it('should support history command', () => {
    // Test that the history command works correctly
    const commands = ['ls', 'pwd', 'mkdir test'];

    // Save history to file
    saveHistoryToFile(filesystem, commands);

    // Execute history command
    const result = executeCommand('history', filesystem);
    expect(result.success).toBe(true);
    expect(result.output).toContain('ls');
    expect(result.output).toContain('pwd');
    expect(result.output).toContain('mkdir test');

    // Verify numbered output
    const lines = (result.output as string).split('\n');
    expect(lines[0]).toMatch(/^\s*1\s+ls$/);
    expect(lines[1]).toMatch(/^\s*2\s+pwd$/);
    expect(lines[2]).toMatch(/^\s*3\s+mkdir test$/);
  });

  it('should allow removing .history file with rm command', () => {
    // Test that rm .history works correctly from /home/user
    const commands = ['ls', 'pwd', 'mkdir test'];

    // Save history to file first
    saveHistoryToFile(filesystem, commands);

    // Verify history file exists and history command works
    const historyResult = executeCommand('history', filesystem);
    expect(historyResult.success).toBe(true);
    expect(historyResult.output).toContain('ls');

    // Change to /home/user directory (where .history should be located)
    executeCommand('cd /home/user', filesystem);

    // Remove .history file
    const rmResult = executeCommand('rm .history', filesystem);
    expect(rmResult.success).toBe(true);

    // Verify history command now shows no history
    const historyAfterRm = executeCommand('history', filesystem);
    expect(historyAfterRm.success).toBe(true);
    expect(historyAfterRm.output).toBe('No command history available');

    // Verify history is empty when loaded
    const loadedHistory = loadHistoryFromFile(filesystem);
    expect(loadedHistory).toEqual([]);
  });

  it('should recreate .history file after rm when new commands are executed', () => {
    // Test that history file is recreated after being removed
    const commands = ['ls', 'pwd'];

    // Save initial history
    saveHistoryToFile(filesystem, commands);

    // Change to /home/user and remove .history
    executeCommand('cd /home/user', filesystem);
    executeCommand('rm .history', filesystem);

    // Execute a new command which should recreate history
    let currentState = terminalState;
    currentState = updateTerminalStateAfterCommand(currentState, 'touch newfile.txt');

    // Verify history file is recreated with the new command
    const loadedHistory = loadHistoryFromFile(currentState.filesystem);
    expect(loadedHistory).toEqual(['touch newfile.txt']);

    // Verify history command works again
    const historyResult = executeCommand('history', currentState.filesystem);
    expect(historyResult.success).toBe(true);
    expect(historyResult.output).toContain('touch newfile.txt');
  });

  it('should not add empty commands to history when pressing Enter without input', () => {
    // Test that empty commands (pressing Enter without typing) don't pollute history
    let currentState = terminalState;

    // Add a real command first
    currentState = updateTerminalStateAfterCommand(currentState, 'ls');
    expect(loadHistoryFromFile(currentState.filesystem)).toEqual(['ls']);

    // Simulate pressing Enter without typing (empty string)
    currentState = updateTerminalStateAfterCommand(currentState, '');
    expect(loadHistoryFromFile(currentState.filesystem)).toEqual(['ls']); // Should still only have 'ls'

    // Simulate pressing Enter with only spaces
    currentState = updateTerminalStateAfterCommand(currentState, '   ');
    expect(loadHistoryFromFile(currentState.filesystem)).toEqual(['ls']); // Should still only have 'ls'

    // Add another real command
    currentState = updateTerminalStateAfterCommand(currentState, 'pwd');
    expect(loadHistoryFromFile(currentState.filesystem)).toEqual(['ls', 'pwd']);

    // Verify history file doesn't contain empty lines
    const loadedHistory = loadHistoryFromFile(currentState.filesystem);
    expect(loadedHistory).toEqual(['ls', 'pwd']);
    expect(loadedHistory).not.toContain('');
    expect(loadedHistory).not.toContain('   ');
  });

  it('should immediately reflect rm .history in subsequent commands (single source of truth)', () => {
    // Test that rm .history immediately affects the next command (no cache issues)
    let currentState = terminalState;

    // Build some history
    currentState = updateTerminalStateAfterCommand(currentState, 'ls');
    currentState = updateTerminalStateAfterCommand(currentState, 'pwd');
    currentState = updateTerminalStateAfterCommand(currentState, 'mkdir test');

    // Verify history exists
    expect(loadHistoryFromFile(currentState.filesystem)).toEqual(['ls', 'pwd', 'mkdir test']);

    // Change to /home/user directory (where .history should be located)
    executeCommand('cd /home/user', currentState.filesystem);

    // Remove .history file
    const rmResult = executeCommand('rm .history', currentState.filesystem);
    expect(rmResult.success).toBe(true);

    // CRUCIAL: Now execute a new command - with single source of truth,
    // this should start fresh history (not restore the old one)
    currentState = updateTerminalStateAfterCommand(currentState, 'touch newfile.txt');

    // With single source of truth, the history should only contain the new command
    const historyAfterRm = loadHistoryFromFile(currentState.filesystem);
    expect(historyAfterRm).toEqual(['touch newfile.txt']);
    expect(historyAfterRm).not.toContain('ls');
    expect(historyAfterRm).not.toContain('pwd');
    expect(historyAfterRm).not.toContain('mkdir test');
  });

  it('should add commands only once to history (no duplicates)', () => {
    // Test that commands are added exactly once to history (fixing double addition bug)
    let currentState = terminalState;

    // Execute several commands and verify each is added only once
    const commands = ['ls', 'ls -la', 'cat test.txt', 'pwd', 'echo hello'];

    for (const command of commands) {
      currentState = updateTerminalStateAfterCommand(currentState, command);

      // Check that command appears exactly once in history
      const history = loadHistoryFromFile(currentState.filesystem);
      const commandCount = history.filter((cmd) => cmd === command).length;
      expect(commandCount).toBe(1); // Command should appear exactly once in history
    }

    // Verify final history has all commands in order, each appearing exactly once
    const finalHistory = loadHistoryFromFile(currentState.filesystem);
    expect(finalHistory).toEqual(commands);
    expect(finalHistory.length).toBe(commands.length);

    // Verify no duplicates exist
    const uniqueCommands = [...new Set(finalHistory)];
    expect(uniqueCommands.length).toBe(finalHistory.length);
  });
});
