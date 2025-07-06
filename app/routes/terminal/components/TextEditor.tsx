import { useEffect, useRef, useState } from 'react';

import type { EditorCommandResult, TextEditorState } from '~/routes/terminal/utils/textEditor';
import { executeEditorCommand, formatStatusLine, getVisibleLines, handleKeyboardInput, hasUnsavedChanges } from '~/routes/terminal/utils/textEditor';

interface TextEditorProps {
  initialState: TextEditorState;
  onSave: (filename: string, content: string) => void;
  onClose: (saved: boolean) => void;
  onStateChange?: (state: TextEditorState) => void;
}

/**
 * Calculate the actual display width of text up to the cursor position.
 * This handles emojis, unicode characters, and tabs correctly.
 */
function getTextWidth(text: string, position: number): number {
  if (position === 0) return 0;

  // Create a temporary span element to measure text width
  const span = document.createElement('span');
  span.style.font = '0.875rem ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'pre';

  // Get the text up to the cursor position, handling tabs
  const textToCursor = text.substring(0, position).replace(/\t/g, '  ');
  span.textContent = textToCursor;

  document.body.appendChild(span);
  const width = span.offsetWidth;
  document.body.removeChild(span);

  return width;
}

/**
 * Calculate the width of a single character at the given position.
 * This handles emojis, unicode characters, and tabs correctly for cursor display.
 */
function getCharacterWidth(text: string, position: number): number {
  if (position >= text.length) return 8; // Default width for empty space

  const character = text[position];
  if (character === '\t') return 16; // Tab width (2 spaces * 8px)

  // Create a temporary span element to measure character width
  const span = document.createElement('span');
  span.style.font = '0.875rem ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'pre';

  span.textContent = character;

  document.body.appendChild(span);
  const width = span.offsetWidth;
  document.body.removeChild(span);

  return width;
}

export function TextEditor({ initialState, onSave, onClose, onStateChange }: TextEditorProps) {
  const [state, setState] = useState<TextEditorState>(initialState);
  const [commandInput, setCommandInput] = useState('');
  const [isCommandInputVisible, setIsCommandInputVisible] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [commandHistoryIndex, setCommandHistoryIndex] = useState(-1);
  const [isStatusMessageError, setIsStatusMessageError] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Focus the editor when it mounts
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Calculate and update viewport size based on available height
  useEffect(() => {
    const calculateViewportSize = () => {
      const windowHeight = window.innerHeight;

      // Calculate fixed heights
      const headerHeight = 50; // Header with py-2
      const statusBarHeight = 50; // Status bar with py-2
      const commandInputHeight = isCommandInputVisible ? 50 : 0; // Command input if visible
      const helpOverlayHeight = 0; // Help overlay is absolute, doesn't affect layout
      const paddingHeight = 32; // py-4 padding in editor content (16px top + 16px bottom)

      // Calculate available height for editor lines
      const availableHeight = windowHeight - headerHeight - statusBarHeight - commandInputHeight - paddingHeight;

      // Each line is 24px (h-6), calculate number of visible lines
      const lineHeight = 24;
      const maxVisibleLines = Math.floor(availableHeight / lineHeight);

      // Ensure minimum of 10 lines and maximum reasonable limit
      const clampedMaxVisibleLines = Math.max(10, Math.min(maxVisibleLines, 100));

      // Update state if the calculated value is different
      if (clampedMaxVisibleLines !== state.maxVisibleLines) {
        setState((prevState) => ({
          ...prevState,
          maxVisibleLines: clampedMaxVisibleLines,
        }));
      }
    };

    // Calculate on mount and window resize
    calculateViewportSize();
    window.addEventListener('resize', calculateViewportSize);

    return () => {
      window.removeEventListener('resize', calculateViewportSize);
    };
  }, [isCommandInputVisible, state.maxVisibleLines]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle events if command input is visible
      if (isCommandInputVisible) {
        return;
      }

      // Handle special key combinations
      if (event.ctrlKey && event.key === 'c') {
        event.preventDefault();
        if (hasUnsavedChanges(state)) {
          // Show confirmation dialog or warning
          const shouldQuit = window.confirm('File has unsaved changes. Are you sure you want to quit?');
          if (shouldQuit) {
            onClose(false);
          }
        } else {
          onClose(false);
        }
        return;
      }

      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        onSave(state.filename, state.content);
        setState((prevState) => ({
          ...prevState,
          originalContent: prevState.content,
          isModified: false,
        }));
        return;
      }

      // Handle colon in command mode to open command input
      if (state.mode === 'COMMAND' && event.key === ':') {
        event.preventDefault();
        setIsCommandInputVisible(true);
        setCommandInput('');
        setTimeout(() => {
          commandInputRef.current?.focus();
        }, 0);
        return;
      }

      // Handle regular editor input
      const result = handleKeyboardInput(state, event);

      if (result.state !== state) {
        setState(result.state);
      }

      if (result.commandResult) {
        handleCommandResult(result.commandResult);
      }

      // Prevent default behavior for handled keys
      if (result.state !== state || result.commandResult) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state, isCommandInputVisible, onSave, onClose]);

  const handleCommandResult = (result: EditorCommandResult) => {
    if (result.success) {
      if (result.shouldClose) {
        if (result.newState) {
          // Save before closing if command was :wq
          onSave(result.newState.filename || state.filename, state.content);
        }
        onClose(true);
      } else if (result.newState) {
        setState((prevState) => ({ ...prevState, ...result.newState }));
      }
    }

    // Show message temporarily (both success and error messages)
    if (result.message) {
      setState((prevState) => ({
        ...prevState,
        statusMessage: result.message || '',
      }));

      // Set error state for styling
      setIsStatusMessageError(!result.success);

      // Reset to normal status after 5 seconds for errors, 3 seconds for success
      const timeout = result.success ? 3000 : 5000;
      setTimeout(() => {
        setState((prevState) => ({
          ...prevState,
          statusMessage: formatStatusLine(prevState),
        }));
        setIsStatusMessageError(false);
      }, timeout);
    }
  };

  const handleCommandInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const command = commandInput.trim();

      if (command) {
        // Add to history
        setCommandHistory((prev) => [...prev, command]);
        setCommandHistoryIndex(-1);

        // Execute command
        const result = executeEditorCommand(state, command);
        handleCommandResult(result);
      }

      setIsCommandInputVisible(false);
      setCommandInput('');

      // Return focus to editor
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsCommandInputVisible(false);
      setCommandInput('');

      // Return focus to editor
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = commandHistoryIndex === -1 ? commandHistory.length - 1 : Math.max(0, commandHistoryIndex - 1);
        setCommandHistoryIndex(newIndex);
        setCommandInput(commandHistory[newIndex]);
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (commandHistoryIndex >= 0) {
        const newIndex = commandHistoryIndex + 1;
        if (newIndex >= commandHistory.length) {
          setCommandHistoryIndex(-1);
          setCommandInput('');
        } else {
          setCommandHistoryIndex(newIndex);
          setCommandInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const visibleLines = getVisibleLines(state);
  const statusLine = formatStatusLine(state);

  return (
    <div className="bg-ctp-base text-ctp-text fixed inset-0 z-50 flex flex-col font-mono text-sm">
      {/* Header */}
      <div className="bg-ctp-surface0 border-ctp-overlay0 flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center space-x-4">
          <h1 className="text-ctp-text font-semibold">
            {state.filename}
            {state.isModified && <span className="text-ctp-yellow"> [Modified]</span>}
          </h1>
          <span className="text-ctp-subtext1 text-xs">{state.mode} mode</span>
        </div>
        <div className="text-ctp-subtext1 flex items-center space-x-2 text-xs">
          <span>
            Line {state.cursorPosition.line + 1}/{state.lines.length}
          </span>
          <span>Col {state.cursorPosition.column + 1}</span>
        </div>
      </div>

      {/* Editor content */}
      <div ref={editorRef} className="flex flex-1 overflow-hidden focus:outline-none" tabIndex={0}>
        {/* Line numbers */}
        {state.showLineNumbers && (
          <div className="bg-ctp-surface1 border-ctp-overlay0 text-ctp-subtext0 min-w-16 border-r px-2 py-4 text-right text-xs">
            {visibleLines.map((line) => (
              <div key={line.lineNumber} className="h-6 leading-6">
                {line.lineNumber}
              </div>
            ))}
          </div>
        )}

        {/* Editor lines */}
        <div className="flex-1 overflow-auto px-4 py-4">
          <div className="relative">
            {visibleLines.map((line, index) => {
              const actualLineIndex = state.scrollOffset + index;
              const isCursorLine = actualLineIndex === state.cursorPosition.line;

              return (
                <div key={line.lineNumber} className="relative h-6 leading-6">
                  {/* Line content */}
                  <span className={isCursorLine ? 'bg-ctp-surface1' : ''}>{line.content || ' '}</span>

                  {/* Cursor */}
                  {isCursorLine && (
                    <span
                      className={`bg-ctp-text text-ctp-base absolute h-6 animate-pulse ${state.mode === 'INSERT' ? 'w-0.5' : ''}`}
                      style={{
                        left: `${getTextWidth(line.content, state.cursorPosition.column)}px`,
                        top: 0,
                        width: state.mode === 'COMMAND' ? `${getCharacterWidth(line.content, state.cursorPosition.column)}px` : undefined,
                      }}
                    >
                      {state.mode === 'COMMAND' && line.content[state.cursorPosition.column] ? line.content[state.cursorPosition.column] : ' '}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Command input */}
      {isCommandInputVisible && (
        <div className="bg-ctp-surface0 border-ctp-overlay0 flex items-center border-t px-4 py-2">
          <span className="text-ctp-subtext1 mr-2">:</span>
          <input
            ref={commandInputRef}
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleCommandInputKeyDown}
            className="text-ctp-text flex-1 bg-transparent focus:outline-none"
            placeholder="Enter command..."
            autoComplete="off"
          />
        </div>
      )}

      {/* Status bar */}
      <div className="bg-ctp-surface0 border-ctp-overlay0 flex items-center justify-between border-t px-4 py-2 text-xs">
        <span className={isStatusMessageError ? 'text-ctp-red font-semibold' : 'text-ctp-subtext1'}>{statusLine}</span>
        <div className="text-ctp-subtext0 flex items-center space-x-4">
          <span>Press ESC for command mode</span>
          <span>:w to save</span>
          <span>:q to quit</span>
          <span>:wq to save and quit</span>
        </div>
      </div>

      {/* Help overlay for command mode */}
      {state.mode === 'COMMAND' && (
        <div className="bg-ctp-surface1 border-ctp-overlay0 text-ctp-subtext1 absolute top-20 right-4 max-w-md rounded-lg border p-4 text-xs">
          <h3 className="text-ctp-text mb-2 font-semibold">Command Mode</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-ctp-green">i</div>
              <div>Insert mode</div>
            </div>
            <div>
              <div className="text-ctp-green">a</div>
              <div>Append after cursor</div>
            </div>
            <div>
              <div className="text-ctp-green">o</div>
              <div>Open new line</div>
            </div>
            <div>
              <div className="text-ctp-green">h/j/k/l</div>
              <div>Navigate</div>
            </div>
            <div>
              <div className="text-ctp-green">x</div>
              <div>Delete character</div>
            </div>
            <div>
              <div className="text-ctp-green">0/$</div>
              <div>Start/end of line</div>
            </div>
            <div>
              <div className="text-ctp-green">G</div>
              <div>Go to end</div>
            </div>
            <div>
              <div className="text-ctp-green">:</div>
              <div>Enter command</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
