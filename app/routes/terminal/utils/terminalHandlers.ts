import type { CommandResult, FileSystemNode, FileSystemState, OutputSegment, TerminalState } from '~/routes/terminal/types/filesystem';
import { AliasManager } from '~/routes/terminal/utils/aliasManager';
import { parseCommand } from '~/routes/terminal/utils/commandParser';
import { executeCommand } from '~/routes/terminal/utils/commands';
import { type EnvironmentManager, createEnvironmentManager } from '~/routes/terminal/utils/environmentManager';
// FilesystemMode removed as both modes now use the same structure
import { createFile, getNodeAtPath } from '~/routes/terminal/utils/filesystem';
import type { FilesystemMode } from '~/routes/terminal/utils/persistence';
import { resetToDefaultFilesystem, saveFilesystemState } from '~/routes/terminal/utils/persistence';
import { ShellParser } from '~/routes/terminal/utils/shellParser';
import { createTextEditorState } from '~/routes/terminal/utils/textEditor';

import { unicodeSafeAtob } from './unicodeBase64';

export interface TerminalOutputLine {
  type: 'command' | 'output' | 'error';
  content: string | OutputSegment[];
  timestamp: string;
}

// Use the existing TerminalState type from filesystem.ts
export type { TerminalState } from '~/routes/terminal/types/filesystem';

export interface SpecialCommandResult {
  type: 'clear' | 'reset_filesystem' | 'open_editor' | 'normal';
  data?: Record<string, unknown>;
}

/**
 * Executes a command and returns the result with error handling
 */
export function executeCommandSafely(
  input: string,
  filesystem: FileSystemState,
  aliasManager?: import('~/routes/terminal/utils/aliasManager').AliasManager,
  lastExitCode?: number,
  environmentManager?: EnvironmentManager,
): CommandResult {
  try {
    return executeCommand(input, filesystem, aliasManager, lastExitCode, environmentManager);
  } catch (error) {
    console.error('Error executing command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      output: '',
      error: `Error: ${errorMessage}`,
      exitCode: 1,
    };
  }
}

/**
 * Analyzes command result output to determine if it's a special command
 */
export function analyzeSpecialCommand(result: CommandResult): SpecialCommandResult {
  if (!result.success || typeof result.output !== 'string') {
    return { type: 'normal' };
  }

  const output = result.output;

  if (output === 'CLEAR') {
    return { type: 'clear' };
  }

  if (output === 'RESET_FILESYSTEM') {
    return { type: 'reset_filesystem' };
  }

  if (output.startsWith('OPEN_EDITOR:')) {
    const parts = output.split(':');
    const filename = parts[1];
    const content = parts[2] ? unicodeSafeAtob(parts[2]) : ''; // Unicode-safe Base64 decode
    return { type: 'open_editor', data: { filename, content } };
  }

  return { type: 'normal' };
}

/**
 * Checks if a command requires immediate filesystem save
 */
export function shouldSaveFilesystemImmediately(input: string, result: CommandResult): boolean {
  if (!result.success) return false;

  const filesystemCommands = ['touch', 'mkdir', 'rm', 'rmdir', 'nano', 'vi'];
  const commandName = input.trim().split(/\s+/)[0];
  const parsed = parseCommand(input);
  const hasOutputRedirection = parsed.redirectOutput !== undefined;

  return filesystemCommands.includes(commandName) || hasOutputRedirection;
}

/**
 * Handles filesystem saving after command execution
 * Now returns a boolean to indicate if immediate save was triggered
 */
export function handleFilesystemSaveAfterCommand(input: string, result: CommandResult, saveImmediately: () => Promise<boolean>): boolean {
  if (!shouldSaveFilesystemImmediately(input, result)) {
    return false;
  }

  // Trigger immediate save for filesystem-modifying commands
  saveImmediately()
    .then((success) => {
      if (success) {
        const parsed = parseCommand(input);
        const commandName = input.trim().split(/\s+/)[0];
        const hasOutputRedirection = parsed.redirectOutput !== undefined;

        const reason = hasOutputRedirection
          ? `redirection (${commandName} ${parsed.redirectOutput?.type} ${parsed.redirectOutput?.filename})`
          : `filesystem command (${commandName})`;

        if (process.env.NODE_ENV === 'development') {
          console.debug(`Filesystem saved immediately: ${reason}`);
        }
      }
    })
    .catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to immediately save filesystem after command:', error);
      }
      // In production, we might want to show a user-friendly message
      // or retry the save operation
    });

  return true;
}

/**
 * Creates a new output line for the terminal
 */
export function createOutputLine(type: TerminalOutputLine['type'], content: string | OutputSegment[]): TerminalOutputLine {
  return {
    type,
    content,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Maximum number of commands to keep in history
 */
const MAX_HISTORY_SIZE = 1000;

/**
 * Name of the history file in the filesystem
 * This stores the main terminal command history (ls, cd, vi, etc.)
 * Similar to .bash_history in Unix systems
 */
const HISTORY_FILE_NAME = '.history';

/**
 * Gets the path for the history file.
 * Both filesystem modes now use the same structure with /home/user/.history
 */
function getHistoryFilePath(filesystem: FileSystemState): string[] {
  return ['home', 'user'];
}

/**
 * Loads command history from the .history file in the filesystem
 */
export function loadHistoryFromFile(filesystem: FileSystemState): string[] {
  // Get the appropriate directory for the history file
  const historyPath = getHistoryFilePath(filesystem);
  const historyDir = getNodeAtPath(filesystem, historyPath);

  if (!historyDir || historyDir.type !== 'directory' || !historyDir.children) {
    return [];
  }

  const historyFile = historyDir.children[HISTORY_FILE_NAME];

  if (!historyFile || historyFile.type !== 'file' || !historyFile.content) {
    return [];
  }

  try {
    // Parse history from file - each line is a command
    const commands = historyFile.content.split('\n').filter((line) => line.trim() !== '');
    return commands.slice(-MAX_HISTORY_SIZE); // Limit to max size
  } catch (error) {
    console.error('Error loading history from file:', error);
    return [];
  }
}

/**
 * Saves command history to the .history file in the filesystem
 */
export function saveHistoryToFile(filesystem: FileSystemState, history: string[]): boolean {
  try {
    const historyContent = history.join('\n');
    // Get the appropriate directory for the history file
    const historyPath = getHistoryFilePath(filesystem);
    const success = createFile(filesystem, historyPath, HISTORY_FILE_NAME, historyContent);

    if (success && process.env.NODE_ENV === 'development') {
      console.debug(`History saved to ${historyPath.length > 0 ? historyPath.join('/') + '/' : ''}.history file`);
    }

    return success;
  } catch (error) {
    console.error('Error saving history to file:', error);
    return false;
  }
}

/**
 * Adds a command to history with size limiting and file persistence
 * Empty commands are not added to history (Unix-like behavior)
 */
export function addToHistory(history: string[], command: string): string[] {
  // Don't add empty commands to history (Unix-like behavior)
  if (!command.trim()) {
    return history;
  }

  const newHistory = [...history, command];

  // Limit history size to prevent memory issues
  if (newHistory.length > MAX_HISTORY_SIZE) {
    return newHistory.slice(-MAX_HISTORY_SIZE);
  }

  return newHistory;
}

/**
 * Initializes terminal state (history is loaded from file on demand)
 */
export function initializeTerminalState(filesystem: FileSystemState, mode: FilesystemMode = 'default'): TerminalState {
  // Initialize alias manager and environment manager
  const aliasManager = new AliasManager();
  const environmentManager = createEnvironmentManager(filesystem, mode);

  // Try to auto-source .bashrc if it exists
  const bashrcPath = ['home', 'user', '.bashrc'];
  const bashrcFile = getNodeAtPath(filesystem, bashrcPath);

  if (bashrcFile && bashrcFile.type === 'file' && bashrcFile.content) {
    try {
      const parseResult = ShellParser.parse(bashrcFile.content);
      const executeResult = ShellParser.execute(parseResult, aliasManager, environmentManager);

      // Log any errors but don't fail initialization
      if (!executeResult.success) {
        console.warn('Failed to source .bashrc:', executeResult.errors);
      } else {
        // Save environment variables after successful .bashrc sourcing
        environmentManager.saveToStorage(mode);
      }
    } catch (error) {
      console.warn('Error sourcing .bashrc:', error);
    }
  }

  return {
    currentInput: '',
    output: [],
    filesystem,
    aliasManager,
    environmentManager,
    lastExitCode: 0,
  };
}

/**
 * Gets history for navigation purposes
 */
export function getHistoryForNavigation(filesystem: FileSystemState): string[] {
  return loadHistoryFromFile(filesystem);
}

/**
 * Navigates through command history
 */
export function navigateHistory(filesystem: FileSystemState, direction: 'up' | 'down', currentIndex: number): { newInput: string; newIndex: number } {
  const history = loadHistoryFromFile(filesystem);

  if (history.length === 0) {
    return { newInput: '', newIndex: -1 };
  }

  let newIndex: number;

  if (direction === 'up') {
    newIndex = currentIndex === -1 ? history.length - 1 : Math.max(0, currentIndex - 1);
  } else {
    // direction === 'down'
    if (currentIndex === -1) {
      return { newInput: '', newIndex: -1 };
    }
    newIndex = currentIndex + 1;
    if (newIndex >= history.length) {
      return { newInput: '', newIndex: -1 };
    }
  }

  return {
    newInput: history[newIndex],
    newIndex,
  };
}

/**
 * Updates terminal state after command execution with persistent history
 * History is stored only in the filesystem (single source of truth)
 */
export function updateTerminalStateAfterCommand(prevState: TerminalState, input: string, exitCode?: number): TerminalState {
  // Load current history from filesystem, add new command, save back
  const currentHistory = loadHistoryFromFile(prevState.filesystem);
  const newHistory = addToHistory(currentHistory, input);

  // Create a copy of the filesystem to avoid mutating the original state
  const newFilesystem = {
    root: { ...prevState.filesystem.root },
    currentPath: [...prevState.filesystem.currentPath],
  };

  // Deep copy the filesystem structure to avoid mutations
  function deepCopyNode(node: FileSystemNode): FileSystemNode {
    if (node.type === 'file') {
      return { ...node };
    } else if (node.type === 'directory' && node.children) {
      return {
        ...node,
        children: Object.fromEntries(Object.entries(node.children).map(([key, child]) => [key, deepCopyNode(child)])),
      };
    }
    return { ...node };
  }

  newFilesystem.root = deepCopyNode(prevState.filesystem.root);

  // Save history to the new filesystem copy
  saveHistoryToFile(newFilesystem, newHistory);

  // Update PWD in environment manager
  const updatedEnvironmentManager = prevState.environmentManager;
  updatedEnvironmentManager.updatePWD(newFilesystem.currentPath);

  return {
    ...prevState,
    filesystem: newFilesystem,
    environmentManager: updatedEnvironmentManager,
    currentInput: '',
    output: prevState.output, // Preserve existing output
    lastExitCode: exitCode ?? prevState.lastExitCode,
  };
}

/**
 * Handles filesystem reset special command
 */
export function handleFilesystemReset(
  mode: string,
  terminalState: TerminalState,
  input: string,
): {
  newTerminalState: TerminalState;
  outputLine: TerminalOutputLine;
} {
  const resetResult = resetToDefaultFilesystem(mode as 'default' | 'portfolio');

  const newFilesystem = {
    root: resetResult.filesystem,
    currentPath: resetResult.currentPath,
  };

  // Don't update history here - let the main handleCommand function handle it
  // But we need to preserve any existing history in the new filesystem
  const currentHistory = loadHistoryFromFile(terminalState.filesystem);
  saveHistoryToFile(newFilesystem, currentHistory);

  // Reset environment manager with new filesystem
  const newEnvironmentManager = createEnvironmentManager(newFilesystem, mode as FilesystemMode);

  const newTerminalState = {
    ...terminalState,
    filesystem: newFilesystem,
    environmentManager: newEnvironmentManager,
    currentInput: '',
    output: terminalState.output, // Preserve existing output
    lastExitCode: 0, // Reset command always succeeds
  };

  const outputLine = createOutputLine('output', `Reset to default ${mode} filesystem`);

  return { newTerminalState, outputLine };
}

/**
 * Handles text editor opening special command
 */
export function handleTextEditorOpen(
  filename: string,
  content: string,
  terminalState: TerminalState,
  input: string,
): {
  newTerminalState: TerminalState;
  editorState: ReturnType<typeof createTextEditorState>;
} {
  const editorState = createTextEditorState(filename, content);

  // Don't update history here - let the main handleCommand function handle it
  const newTerminalState = {
    ...terminalState,
    currentInput: '',
    output: terminalState.output, // Preserve existing output
    lastExitCode: 0, // vi command always succeeds to open
  };

  return { newTerminalState, editorState };
}
