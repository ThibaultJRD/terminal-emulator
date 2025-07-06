import type { CommandResult, FileSystemState, TerminalState } from '~/routes/terminal/types/filesystem';
import { parseCommand } from '~/routes/terminal/utils/commandParser';
import { executeCommand } from '~/routes/terminal/utils/commands';
import type { FilesystemMode } from '~/routes/terminal/utils/defaultFilesystems';
import { resetToDefaultFilesystem, saveFilesystemState } from '~/routes/terminal/utils/persistence';
import { createTextEditorState } from '~/routes/terminal/utils/textEditor';

export interface TerminalOutputLine {
  type: 'command' | 'output' | 'error';
  content: string | import('~/routes/terminal/types/filesystem').OutputSegment[];
  timestamp: Date;
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
export function executeCommandSafely(input: string, filesystem: FileSystemState): CommandResult {
  try {
    return executeCommand(input, filesystem);
  } catch (error) {
    console.error('Error executing command:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      output: '',
      error: `Error: ${errorMessage}`,
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

  if (output.startsWith('RESET_FILESYSTEM:')) {
    const mode = output.split(':')[1] as FilesystemMode;
    return { type: 'reset_filesystem', data: { mode } };
  }

  if (output.startsWith('OPEN_EDITOR:')) {
    const parts = output.split(':');
    const filename = parts[1];
    const content = parts[2] ? atob(parts[2]) : ''; // Base64 decode
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

        console.debug(`Filesystem saved immediately: ${reason}`);
      }
    })
    .catch((error) => {
      console.error('Failed to immediately save filesystem after command:', error);
    });

  return true;
}

/**
 * Creates a new output line for the terminal
 */
export function createOutputLine(
  type: TerminalOutputLine['type'],
  content: string | import('~/routes/terminal/types/filesystem').OutputSegment[],
): TerminalOutputLine {
  return {
    type,
    content,
    timestamp: new Date(),
  };
}

/**
 * Maximum number of commands to keep in history
 */
const MAX_HISTORY_SIZE = 1000;

/**
 * Adds a command to history with size limiting
 */
export function addToHistory(history: string[], command: string): string[] {
  const newHistory = [...history, command];

  // Limit history size to prevent memory issues
  if (newHistory.length > MAX_HISTORY_SIZE) {
    return newHistory.slice(-MAX_HISTORY_SIZE);
  }

  return newHistory;
}

/**
 * Updates terminal state after command execution
 */
export function updateTerminalStateAfterCommand(prevState: TerminalState, input: string): TerminalState {
  return {
    ...prevState,
    history: addToHistory(prevState.history, input),
    historyIndex: -1,
    currentInput: '',
    output: prevState.output, // Preserve existing output
  };
}

/**
 * Handles filesystem reset special command
 */
export function handleFilesystemReset(
  mode: FilesystemMode,
  terminalState: TerminalState,
  input: string,
): {
  newTerminalState: TerminalState;
  outputLine: TerminalOutputLine;
} {
  const resetResult = resetToDefaultFilesystem(mode);

  const newTerminalState = {
    ...terminalState,
    filesystem: {
      root: resetResult.filesystem,
      currentPath: resetResult.currentPath,
    },
    history: addToHistory(terminalState.history, input),
    historyIndex: -1,
    currentInput: '',
    output: terminalState.output, // Preserve existing output
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

  const newTerminalState = updateTerminalStateAfterCommand(terminalState, input);

  return { newTerminalState, editorState };
}
