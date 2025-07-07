import type { FileSystemNode } from '~/routes/terminal/types/filesystem';

/**
 * Editor modes for the text editor.
 * INSERT mode allows typing text, NORMAL mode allows executing commands.
 */
export type EditorMode = 'INSERT' | 'NORMAL';

/**
 * Cursor position in the editor.
 */
export interface CursorPosition {
  line: number;
  column: number;
}

/**
 * Text editor state interface.
 * Contains all the necessary state for the vim-inspired text editor.
 */
export interface TextEditorState {
  filename: string;
  originalContent: string;
  content: string;
  lines: string[];
  cursorPosition: CursorPosition;
  mode: EditorMode;
  isModified: boolean;
  showLineNumbers: boolean;
  statusMessage: string;
  scrollOffset: number;
  maxVisibleLines: number;
  searchTerm?: string;
  isVisible: boolean;
}

/**
 * Command execution result for editor commands.
 */
export interface EditorCommandResult {
  success: boolean;
  message?: string;
  shouldClose?: boolean;
  newState?: Partial<TextEditorState>;
}

/**
 * Creates a new text editor state with default values.
 *
 * @param filename - The name of the file being edited
 * @param content - The initial content of the file
 * @returns New TextEditorState instance
 */
export function createTextEditorState(filename: string, content: string = ''): TextEditorState {
  const lines = content.split('\n');

  return {
    filename,
    originalContent: content,
    content,
    lines,
    cursorPosition: { line: 0, column: 0 },
    mode: 'NORMAL',
    isModified: false,
    showLineNumbers: true,
    statusMessage: `Editing ${filename} - NORMAL mode`,
    scrollOffset: 0,
    maxVisibleLines: 20,
    isVisible: true,
  };
}

/**
 * Updates the editor state with new content.
 * This function handles content changes and updates related state.
 *
 * @param state - Current editor state
 * @param newContent - New content to set
 * @returns Updated editor state
 */
export function updateEditorContent(state: TextEditorState, newContent: string): TextEditorState {
  const lines = newContent.split('\n');
  const isModified = newContent !== state.originalContent;

  return {
    ...state,
    content: newContent,
    lines,
    isModified,
    statusMessage: isModified ? `${state.filename} [Modified] - ${state.mode} mode` : `${state.filename} - ${state.mode} mode`,
  };
}

/**
 * Moves the cursor to a new position, ensuring it stays within bounds.
 *
 * @param state - Current editor state
 * @param newPosition - New cursor position
 * @returns Updated editor state
 */
export function moveCursor(state: TextEditorState, newPosition: Partial<CursorPosition>): TextEditorState {
  const maxLine = Math.max(0, state.lines.length - 1);
  const line = Math.max(0, Math.min(newPosition.line ?? state.cursorPosition.line, maxLine));
  const maxColumn = Math.max(0, state.lines[line]?.length ?? 0);
  const column = Math.max(0, Math.min(newPosition.column ?? state.cursorPosition.column, maxColumn));

  const cursorPosition = { line, column };

  // Adjust scroll offset if cursor goes out of view
  let scrollOffset = state.scrollOffset;
  if (line < scrollOffset) {
    scrollOffset = line;
  } else if (line >= scrollOffset + state.maxVisibleLines) {
    scrollOffset = line - state.maxVisibleLines + 1;
  }

  return {
    ...state,
    cursorPosition,
    scrollOffset,
  };
}

/**
 * Switches the editor mode between INSERT and NORMAL.
 *
 * @param state - Current editor state
 * @param mode - New editor mode
 * @returns Updated editor state
 */
export function switchMode(state: TextEditorState, mode: EditorMode): TextEditorState {
  const statusMessage = state.isModified ? `${state.filename} [Modified] - ${mode} mode` : `${state.filename} - ${mode} mode`;

  return {
    ...state,
    mode,
    statusMessage,
  };
}

/**
 * Inserts text at the current cursor position.
 *
 * @param state - Current editor state
 * @param text - Text to insert
 * @returns Updated editor state
 */
export function insertTextAtCursor(state: TextEditorState, text: string): TextEditorState {
  const { line, column } = state.cursorPosition;
  const currentLine = state.lines[line] || '';
  const before = currentLine.substring(0, column);
  const after = currentLine.substring(column);

  const newLines = [...state.lines];
  newLines[line] = before + text + after;

  const newContent = newLines.join('\n');
  const newCursorPosition = { line, column: column + text.length };

  return moveCursor(updateEditorContent(state, newContent), newCursorPosition);
}

/**
 * Deletes text at the current cursor position.
 *
 * @param state - Current editor state
 * @param direction - Direction to delete ('backward' or 'forward')
 * @returns Updated editor state
 */
export function deleteTextAtCursor(state: TextEditorState, direction: 'backward' | 'forward' = 'backward'): TextEditorState {
  const { line, column } = state.cursorPosition;
  const currentLine = state.lines[line] || '';

  if (direction === 'backward') {
    if (column > 0) {
      // Delete character before cursor
      const before = currentLine.substring(0, column - 1);
      const after = currentLine.substring(column);
      const newLines = [...state.lines];
      newLines[line] = before + after;

      const newContent = newLines.join('\n');
      const newCursorPosition = { line, column: column - 1 };

      return moveCursor(updateEditorContent(state, newContent), newCursorPosition);
    } else if (line > 0) {
      // Join with previous line
      const prevLine = state.lines[line - 1] || '';
      const newLines = [...state.lines];
      newLines[line - 1] = prevLine + currentLine;
      newLines.splice(line, 1);

      const newContent = newLines.join('\n');
      const newCursorPosition = { line: line - 1, column: prevLine.length };

      return moveCursor(updateEditorContent(state, newContent), newCursorPosition);
    }
  } else {
    if (column < currentLine.length) {
      // Delete character after cursor
      const before = currentLine.substring(0, column);
      const after = currentLine.substring(column + 1);
      const newLines = [...state.lines];
      newLines[line] = before + after;

      const newContent = newLines.join('\n');

      return updateEditorContent(state, newContent);
    } else if (line < state.lines.length - 1) {
      // Join with next line
      const nextLine = state.lines[line + 1] || '';
      const newLines = [...state.lines];
      newLines[line] = currentLine + nextLine;
      newLines.splice(line + 1, 1);

      const newContent = newLines.join('\n');

      return updateEditorContent(state, newContent);
    }
  }

  return state;
}

/**
 * Inserts a new line at the current cursor position.
 *
 * @param state - Current editor state
 * @returns Updated editor state
 */
export function insertNewLine(state: TextEditorState): TextEditorState {
  const { line, column } = state.cursorPosition;
  const currentLine = state.lines[line] || '';
  const before = currentLine.substring(0, column);
  const after = currentLine.substring(column);

  const newLines = [...state.lines];
  newLines[line] = before;
  newLines.splice(line + 1, 0, after);

  const newContent = newLines.join('\n');
  const newCursorPosition = { line: line + 1, column: 0 };

  return moveCursor(updateEditorContent(state, newContent), newCursorPosition);
}

/**
 * Inserts a new empty line below the current line (for 'o' command).
 *
 * @param state - Current editor state
 * @returns Updated editor state
 */
export function insertNewLineBelow(state: TextEditorState): TextEditorState {
  const { line } = state.cursorPosition;

  const newLines = [...state.lines];
  newLines.splice(line + 1, 0, '');

  const newContent = newLines.join('\n');
  const newCursorPosition = { line: line + 1, column: 0 };

  return moveCursor(updateEditorContent(state, newContent), newCursorPosition);
}

/**
 * Inserts a new empty line above the current line (for 'O' command).
 *
 * @param state - Current editor state
 * @returns Updated editor state
 */
export function insertNewLineAbove(state: TextEditorState): TextEditorState {
  const { line } = state.cursorPosition;

  const newLines = [...state.lines];
  newLines.splice(line, 0, '');

  const newContent = newLines.join('\n');
  const newCursorPosition = { line: line, column: 0 };

  return moveCursor(updateEditorContent(state, newContent), newCursorPosition);
}

/**
 * Executes a command in NORMAL mode.
 *
 * @param state - Current editor state
 * @param command - Command to execute
 * @returns EditorCommandResult with the result and any state changes
 */
export function executeEditorCommand(state: TextEditorState, command: string): EditorCommandResult {
  const cmd = command.trim().toLowerCase();

  switch (cmd) {
    case 'w':
    case 'write':
      return {
        success: true,
        message: `"${state.filename}" written`,
        newState: {
          originalContent: state.content,
          isModified: false,
          statusMessage: `${state.filename} - ${state.mode} mode`,
        },
      };

    case 'q':
    case 'quit':
      if (state.isModified) {
        return {
          success: false,
          message: 'No write since last change (use :q! to force quit)',
        };
      }
      return {
        success: true,
        message: 'Quit',
        shouldClose: true,
      };

    case 'q!':
    case 'quit!':
      return {
        success: true,
        message: 'Quit without saving',
        shouldClose: true,
      };

    case 'wq':
    case 'wq!':
    case 'x':
      return {
        success: true,
        message: `"${state.filename}" written and quit`,
        shouldClose: true,
        newState: {
          originalContent: state.content,
          isModified: false,
        },
      };

    case 'help':
    case 'h':
      return {
        success: true,
        message: 'Commands: :w (write), :q (quit), :wq (write & quit), :q! (force quit)',
      };

    default:
      if (cmd.startsWith('w ')) {
        // Write to specific filename
        const filename = cmd.substring(2).trim();
        return {
          success: true,
          message: `"${filename}" written`,
          newState: {
            filename,
            originalContent: state.content,
            isModified: false,
            statusMessage: `${filename} - ${state.mode} mode`,
          },
        };
      }

      return {
        success: false,
        message: `Unknown command: ${command}`,
      };
  }
}

/**
 * Handles keyboard input for the text editor.
 *
 * @param state - Current editor state
 * @param event - Keyboard event
 * @returns Updated editor state or command result
 */
export function handleKeyboardInput(state: TextEditorState, event: KeyboardEvent): { state: TextEditorState; commandResult?: EditorCommandResult } {
  if (state.mode === 'INSERT') {
    return handleInsertModeInput(state, event);
  } else {
    return handleNormalModeInput(state, event);
  }
}

/**
 * Handles keyboard input in INSERT mode.
 *
 * @param state - Current editor state
 * @param event - Keyboard event
 * @returns Updated editor state
 */
function handleInsertModeInput(state: TextEditorState, event: KeyboardEvent): { state: TextEditorState; commandResult?: EditorCommandResult } {
  switch (event.key) {
    case 'Escape':
      return { state: switchMode(state, 'NORMAL') };

    case 'Enter':
      return { state: insertNewLine(state) };

    case 'Backspace':
      return { state: deleteTextAtCursor(state, 'backward') };

    case 'Delete':
      return { state: deleteTextAtCursor(state, 'forward') };

    case 'ArrowUp':
      return { state: moveCursor(state, { line: state.cursorPosition.line - 1 }) };

    case 'ArrowDown':
      return { state: moveCursor(state, { line: state.cursorPosition.line + 1 }) };

    case 'ArrowLeft':
      return { state: moveCursor(state, { column: state.cursorPosition.column - 1 }) };

    case 'ArrowRight':
      return { state: moveCursor(state, { column: state.cursorPosition.column + 1 }) };

    case 'Home':
      return { state: moveCursor(state, { column: 0 }) };

    case 'End':
      const currentLine = state.lines[state.cursorPosition.line] || '';
      return { state: moveCursor(state, { column: currentLine.length }) };

    case 'PageUp':
      return { state: moveCursor(state, { line: Math.max(0, state.cursorPosition.line - state.maxVisibleLines) }) };

    case 'PageDown':
      return { state: moveCursor(state, { line: Math.min(state.lines.length - 1, state.cursorPosition.line + state.maxVisibleLines) }) };

    case 'Tab':
      return { state: insertTextAtCursor(state, '  ') }; // Insert 2 spaces for tab

    default:
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        return { state: insertTextAtCursor(state, event.key) };
      }
      break;
  }

  return { state };
}

/**
 * Handles keyboard input in NORMAL mode.
 *
 * @param state - Current editor state
 * @param event - Keyboard event
 * @returns Updated editor state and possible command result
 */
function handleNormalModeInput(state: TextEditorState, event: KeyboardEvent): { state: TextEditorState; commandResult?: EditorCommandResult } {
  switch (event.key) {
    case 'i':
      return { state: switchMode(state, 'INSERT') };

    case 'a':
      return {
        state: moveCursor(switchMode(state, 'INSERT'), { column: state.cursorPosition.column + 1 }),
      };

    case 'o':
      const newState = insertNewLineBelow(state);
      return { state: switchMode(newState, 'INSERT') };

    case 'A':
      const currentLineForA = state.lines[state.cursorPosition.line] || '';
      return {
        state: moveCursor(switchMode(state, 'INSERT'), { column: currentLineForA.length }),
      };

    case 'I':
      return {
        state: moveCursor(switchMode(state, 'INSERT'), { column: 0 }),
      };

    case 'O':
      const newStateAbove = insertNewLineAbove(state);
      return { state: switchMode(newStateAbove, 'INSERT') };

    case 'h':
      return { state: moveCursor(state, { column: state.cursorPosition.column - 1 }) };

    case 'j':
      return { state: moveCursor(state, { line: state.cursorPosition.line + 1 }) };

    case 'k':
      return { state: moveCursor(state, { line: state.cursorPosition.line - 1 }) };

    case 'l':
      return { state: moveCursor(state, { column: state.cursorPosition.column + 1 }) };

    case '0':
      return { state: moveCursor(state, { column: 0 }) };

    case '$':
      const currentLine = state.lines[state.cursorPosition.line] || '';
      return { state: moveCursor(state, { column: currentLine.length }) };

    case 'G':
      return { state: moveCursor(state, { line: state.lines.length - 1 }) };

    case 'x':
      return { state: deleteTextAtCursor(state, 'forward') };

    case 'X':
      return { state: deleteTextAtCursor(state, 'backward') };

    case ':':
      // This would typically open a command input, but for simplicity,
      // we'll handle common commands directly
      return { state };

    default:
      // For unhandled keys in normal mode, do nothing
      return { state };
  }
}

/**
 * Gets the visible lines for the editor based on scroll offset.
 *
 * @param state - Current editor state
 * @returns Array of visible lines with their line numbers
 */
export function getVisibleLines(state: TextEditorState): Array<{ lineNumber: number; content: string }> {
  const startLine = state.scrollOffset;
  const endLine = Math.min(startLine + state.maxVisibleLines, state.lines.length);

  return state.lines.slice(startLine, endLine).map((content, index) => ({
    lineNumber: startLine + index + 1,
    content,
  }));
}

/**
 * Formats the status line for the editor.
 *
 * @param state - Current editor state
 * @returns Formatted status line string
 */
export function formatStatusLine(state: TextEditorState): string {
  const { line, column } = state.cursorPosition;
  const totalLines = state.lines.length;
  const modifiedIndicator = state.isModified ? ' [Modified]' : '';

  return `${state.filename}${modifiedIndicator} - ${state.mode} mode - Line ${line + 1}/${totalLines}, Column ${column + 1}`;
}

/**
 * Checks if the editor has unsaved changes.
 *
 * @param state - Current editor state
 * @returns boolean indicating if there are unsaved changes
 */
export function hasUnsavedChanges(state: TextEditorState): boolean {
  return state.isModified;
}
