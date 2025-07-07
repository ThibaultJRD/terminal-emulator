import { useCallback, useEffect, useRef, useState } from 'react';

import { TextEditor } from '~/routes/terminal/components/TextEditor';
import { useFilesystemPersistence } from '~/routes/terminal/hooks/useFilesystemPersistence';
import type { OutputSegment, TerminalState } from '~/routes/terminal/types/filesystem';
import { applyCompletion, applyCompletionNoSpace, getAutocompletions } from '~/routes/terminal/utils/autocompletion';
import { getFilesystemByMode } from '~/routes/terminal/utils/defaultFilesystems';
import { createDefaultFileSystem, createFile } from '~/routes/terminal/utils/filesystem';
import { formatPath } from '~/routes/terminal/utils/filesystem';
import { type FilesystemMode, initializeFilesystem, saveFilesystemState } from '~/routes/terminal/utils/persistence';
import {
  analyzeSpecialCommand,
  createOutputLine,
  executeCommandSafely,
  handleFilesystemReset,
  handleFilesystemSaveAfterCommand,
  handleTextEditorOpen,
  updateTerminalStateAfterCommand,
} from '~/routes/terminal/utils/terminalHandlers';
import { type TextEditorState } from '~/routes/terminal/utils/textEditor';

interface OutputLine {
  type: 'command' | 'output' | 'error';
  content: string | OutputSegment[];
  timestamp: Date;
}

interface TerminalProps {
  mode?: 'default' | 'portfolio';
}

export function Terminal({ mode = 'default' }: TerminalProps) {
  const filesystemMode: FilesystemMode = mode === 'portfolio' ? 'portfolio' : 'default';

  const [terminalState, setTerminalState] = useState<TerminalState>(() => {
    // Initialize filesystem with persistence support
    const { filesystem, mode: initializedMode, currentPath } = initializeFilesystem(filesystemMode);

    return {
      history: [],
      historyIndex: -1,
      currentInput: '',
      output: [],
      filesystem: {
        root: filesystem,
        currentPath: currentPath,
      },
    };
  });

  const [currentFilesystemMode, setCurrentFilesystemMode] = useState<FilesystemMode>(() => {
    // Use the mode from initialized filesystem (in case it was loaded from storage)
    const { mode: initializedMode } = initializeFilesystem(filesystemMode);
    return initializedMode;
  });
  const [textEditorState, setTextEditorState] = useState<TextEditorState | null>(null);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);

  // Autocompletion state
  const [completionState, setCompletionState] = useState<{
    isActive: boolean;
    completions: string[];
    selectedIndex: number; // -1 means no selection
    originalInput: string;
  }>({
    isActive: false,
    completions: [],
    selectedIndex: -1,
    originalInput: '',
  });

  const [outputLines, setOutputLines] = useState<OutputLine[]>(() => {
    if (mode === 'portfolio') {
      return [
        {
          type: 'output',
          content: "Welcome to Thibault Jaillard's Interactive Portfolio",
          timestamp: new Date(),
        },
        {
          type: 'output',
          content: 'Senior Frontend and Mobile Developer | React | React Native | TypeScript | Web 3.0',
          timestamp: new Date(),
        },
        {
          type: 'output',
          content: 'Explore my projects and experience with Unix commands. Type "help" to get started.',
          timestamp: new Date(),
        },
      ];
    }

    return [
      {
        type: 'output',
        content: 'Welcome to Terminal Emulator v1.0',
        timestamp: new Date(),
      },
      {
        type: 'output',
        content: 'Type "help" for available commands.',
        timestamp: new Date(),
      },
    ];
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [outputLines, scrollToBottom]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Intelligent filesystem persistence
  const filesystemPersistence = useFilesystemPersistence(terminalState.filesystem, currentFilesystemMode, {
    debounceMs: 500,
    maxDebounceMs: 2000,
    enableLogs: false, // Set to true for debugging
  });

  const handleCommand = useCallback(
    (input: string) => {
      // Create structured prompt segments
      const promptSegments = generatePromptSegments(terminalState.filesystem.currentPath, mode);

      // Add command segment if there's input
      const commandSegments = input.trim() ? [...promptSegments, { type: 'command' as const, text: input }] : promptSegments;

      // Add command to output
      setOutputLines((prev) => [...prev, createOutputLine('command', commandSegments)]);

      // If no input, just update terminal state and return
      if (!input.trim()) {
        setTerminalState((prev) => updateTerminalStateAfterCommand(prev, input));
        return;
      }

      // Execute command safely
      const result = executeCommandSafely(input, terminalState.filesystem, filesystemMode);

      // Handle command execution error
      if (!result.success) {
        const errorContent = result.error || 'Command failed';
        setOutputLines((prev) => [...prev, createOutputLine('error', errorContent)]);
        setTerminalState((prev) => updateTerminalStateAfterCommand(prev, input));
        return;
      }

      // Analyze for special commands
      const specialCommand = analyzeSpecialCommand(result);

      switch (specialCommand.type) {
        case 'clear':
          setOutputLines([]);
          setTerminalState((prev) => updateTerminalStateAfterCommand(prev, input));
          return;

        case 'reset_filesystem': {
          const mode = specialCommand.data?.mode as FilesystemMode;
          const { newTerminalState, outputLine } = handleFilesystemReset(mode, terminalState, input);
          setTerminalState(newTerminalState);
          setCurrentFilesystemMode(mode);
          setOutputLines((prev) => [...prev, outputLine]);
          return;
        }

        case 'open_editor': {
          const { filename, content } = specialCommand.data as { filename: string; content: string };
          const { newTerminalState, editorState } = handleTextEditorOpen(filename, content, terminalState, input);
          setTerminalState(newTerminalState);
          setTextEditorState(editorState);
          setIsTextEditorOpen(true);
          return;
        }

        case 'normal':
        default:
          // Handle normal command output
          if (result.output) {
            setOutputLines((prev) => [...prev, createOutputLine('output', result.output)]);
          }
          break;
      }

      // Update terminal state
      setTerminalState((prev) => updateTerminalStateAfterCommand(prev, input));

      // Save filesystem if needed
      handleFilesystemSaveAfterCommand(input, result, filesystemPersistence.saveImmediately);
    },
    [terminalState.filesystem, currentFilesystemMode, filesystemPersistence.saveImmediately],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (completionState.isActive && completionState.selectedIndex !== -1) {
          // In completion mode with selection: apply completion + space, don't execute
          e.preventDefault();
          const selectedCompletion = completionState.completions[completionState.selectedIndex];
          const newInput = applyCompletion(completionState.originalInput, selectedCompletion);

          // Exit completion mode
          setCompletionState({
            isActive: false,
            completions: [],
            selectedIndex: -1,
            originalInput: '',
          });

          setTerminalState((prev) => ({
            ...prev,
            currentInput: newInput,
            historyIndex: -1,
          }));
          return;
        }

        // Normal behavior: execute command
        handleCommand(terminalState.currentInput);
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (terminalState.history.length > 0) {
          const newIndex = terminalState.historyIndex === -1 ? terminalState.history.length - 1 : Math.max(0, terminalState.historyIndex - 1);

          setTerminalState((prev) => ({
            ...prev,
            historyIndex: newIndex,
            currentInput: prev.history[newIndex],
          }));
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (terminalState.historyIndex !== -1) {
          const newIndex = terminalState.historyIndex + 1;

          if (newIndex >= terminalState.history.length) {
            setTerminalState((prev) => ({
              ...prev,
              historyIndex: -1,
              currentInput: '',
            }));
          } else {
            setTerminalState((prev) => ({
              ...prev,
              historyIndex: newIndex,
              currentInput: prev.history[newIndex],
            }));
          }
        }
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();

        if (completionState.isActive) {
          if (completionState.selectedIndex === -1) {
            // First selection: start with first item
            const selectedCompletion = completionState.completions[0];
            const isCmd = isCommandCompletion(completionState.originalInput);
            const newInput = isCmd
              ? applyCompletionNoSpace(completionState.originalInput, selectedCompletion)
              : applyCompletion(completionState.originalInput, selectedCompletion);

            setCompletionState((prev) => ({
              ...prev,
              selectedIndex: 0,
            }));

            setTerminalState((prev) => ({
              ...prev,
              currentInput: newInput,
            }));
          } else {
            // Cycle through completions
            const nextIndex = (completionState.selectedIndex + 1) % completionState.completions.length;
            const selectedCompletion = completionState.completions[nextIndex];
            const isCmd = isCommandCompletion(completionState.originalInput);
            const newInput = isCmd
              ? applyCompletionNoSpace(completionState.originalInput, selectedCompletion)
              : applyCompletion(completionState.originalInput, selectedCompletion);

            setCompletionState((prev) => ({
              ...prev,
              selectedIndex: nextIndex,
            }));

            setTerminalState((prev) => ({
              ...prev,
              currentInput: newInput,
            }));
          }
        } else {
          // Start completion
          const result = getAutocompletions(terminalState.currentInput, terminalState.filesystem);

          if (result.completions.length === 0) {
            return;
          }

          if (result.completions.length === 1) {
            // Single completion, apply it directly
            const newInput = applyCompletion(terminalState.currentInput, result.completions[0]);
            setTerminalState((prev) => ({
              ...prev,
              currentInput: newInput,
              historyIndex: -1,
            }));
          } else if (result.commonPrefix && result.commonPrefix.length > terminalState.currentInput.split(/\s+/).pop()?.length!) {
            // Multiple completions with common prefix
            const newInput = applyCompletion(terminalState.currentInput, result.commonPrefix);
            setTerminalState((prev) => ({
              ...prev,
              currentInput: newInput,
              historyIndex: -1,
            }));
          } else {
            // Multiple completions, show list without selection
            setCompletionState({
              isActive: true,
              completions: result.completions,
              selectedIndex: -1, // No selection initially
              originalInput: terminalState.currentInput,
            });
          }
        }

        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (completionState.isActive) {
          // Exit completion mode and restore original input
          setCompletionState({
            isActive: false,
            completions: [],
            selectedIndex: -1,
            originalInput: '',
          });

          setTerminalState((prev) => ({
            ...prev,
            currentInput: completionState.originalInput,
          }));
        }
        return;
      }
    },
    [terminalState.currentInput, terminalState.history, terminalState.historyIndex, terminalState.filesystem, handleCommand, completionState],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Exit completion mode when user types
      if (completionState.isActive) {
        setCompletionState({
          isActive: false,
          completions: [],
          selectedIndex: -1,
          originalInput: '',
        });
      }

      setTerminalState((prev) => ({
        ...prev,
        currentInput: e.target.value,
        historyIndex: -1,
      }));
    },
    [completionState.isActive],
  );

  const handleTerminalClick = useCallback(() => {
    if (inputRef.current && !isTextEditorOpen) {
      inputRef.current.focus();
    }
  }, [isTextEditorOpen]);

  const handleTextEditorSave = useCallback(
    (filename: string, content: string) => {
      // Save file to filesystem
      const success = createFile(terminalState.filesystem, terminalState.filesystem.currentPath, filename, content);

      if (success) {
        // Immediate save to localStorage after editor modification
        const saveResult = saveFilesystemState(terminalState.filesystem.root, currentFilesystemMode, terminalState.filesystem.currentPath);
        if (!saveResult.success) {
          console.error('Failed to save filesystem after editor modification:', saveResult.error);
        } else {
        }

        setOutputLines((prev) => [
          ...prev,
          {
            type: 'output',
            content: `"${filename}" written`,
            timestamp: new Date(),
          },
        ]);
      } else {
        setOutputLines((prev) => [
          ...prev,
          {
            type: 'error',
            content: `Failed to save "${filename}"`,
            timestamp: new Date(),
          },
        ]);
      }
    },
    [terminalState.filesystem, currentFilesystemMode],
  );

  const handleTextEditorClose = useCallback((saved: boolean) => {
    setIsTextEditorOpen(false);
    setTextEditorState(null);

    // Return focus to terminal input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  }, []);

  const renderOutputLine = (line: OutputLine, index: number) => {
    const baseClasses = 'font-mono text-sm whitespace-pre-wrap';

    const renderContent = (content: string | OutputSegment[]) => {
      if (typeof content === 'string') {
        return content;
      }

      return content.map((segment, segIndex) => {
        let className = '';
        switch (segment.type) {
          case 'directory':
            className = 'text-ctp-blue';
            break;
          case 'file':
            className = 'text-ctp-text';
            break;
          case 'header-1':
            className = 'text-ctp-red font-bold text-lg';
            break;
          case 'header-2':
            className = 'text-ctp-peach font-bold';
            break;
          case 'header-3':
            className = 'text-ctp-yellow font-semibold';
            break;
          case 'header-symbol':
            className = 'text-ctp-mauve';
            break;
          case 'bold':
            className = 'text-ctp-text font-bold';
            break;
          case 'italic':
            className = 'text-ctp-subtext1 italic';
            break;
          case 'inline-code':
            className = 'text-ctp-green bg-ctp-surface0 px-1 rounded';
            break;
          case 'code-block':
            className = 'text-ctp-green';
            break;
          case 'code-block-border':
            className = 'text-ctp-overlay0';
            break;
          case 'link':
            className = 'text-ctp-sapphire underline';
            break;
          case 'blockquote':
            className = 'text-ctp-subtext1 italic';
            break;
          case 'blockquote-symbol':
            className = 'text-ctp-lavender';
            break;
          case 'list-bullet':
            className = 'text-ctp-pink';
            break;
          case 'list-number':
            className = 'text-ctp-pink';
            break;
          case 'hr':
            className = 'text-ctp-overlay1';
            break;
          case 'user':
            className = 'text-ctp-mauve';
            break;
          case 'separator':
            className = 'text-ctp-subtext0';
            break;
          case 'host':
            className = 'text-ctp-blue';
            break;
          case 'path':
            className = 'text-ctp-yellow';
            break;
          case 'prompt-symbol':
            className = 'text-ctp-green';
            break;
          case 'command':
            className = 'text-ctp-text';
            break;
          default:
            className = 'text-ctp-text';
            break;
        }

        return (
          <span key={segIndex} className={className}>
            {segment.text}
          </span>
        );
      });
    };

    switch (line.type) {
      case 'command':
        return (
          <div key={index} className={baseClasses}>
            {renderContent(line.content)}
          </div>
        );
      case 'error':
        return (
          <div key={index} className={`${baseClasses} text-ctp-red`}>
            {renderContent(line.content)}
          </div>
        );
      case 'output':
        return (
          <div key={index} className={`${baseClasses} text-ctp-text`}>
            {renderContent(line.content)}
          </div>
        );
      default:
        return null;
    }
  };

  const generatePromptText = (path: string[], currentMode: 'default' | 'portfolio'): string => {
    const user = currentMode === 'portfolio' ? 'ThibaultJRD' : 'user';
    return `${user}@terminal:${formatPath(path)} ❯ `;
  };

  const generatePromptSegments = (path: string[], currentMode: 'default' | 'portfolio'): OutputSegment[] => {
    const user = currentMode === 'portfolio' ? 'ThibaultJRD' : 'user';
    return [
      { type: 'user' as const, text: user },
      { type: 'separator' as const, text: '@' },
      { type: 'host' as const, text: 'terminal' },
      { type: 'separator' as const, text: ':' },
      { type: 'path' as const, text: formatPath(path) },
      { type: 'prompt-symbol' as const, text: ' ❯ ' },
    ];
  };

  // Helper to check if we're completing a command (not a path)
  const isCommandCompletion = (originalInput: string): boolean => {
    const trimmed = originalInput.trim();
    const parts = trimmed.split(/\s+/);
    return parts.length === 1 && !originalInput.endsWith(' ');
  };

  const currentPrompt = {
    user: mode === 'portfolio' ? 'ThibaultJRD' : 'user',
    host: 'terminal',
    path: formatPath(terminalState.filesystem.currentPath),
    symbol: '❯',
  };

  return (
    <div className="bg-ctp-base relative flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4" ref={terminalRef} onClick={handleTerminalClick}>
        <div className="space-y-1">
          {outputLines.map(renderOutputLine)}

          {!isTextEditorOpen && (
            <div className="flex items-center font-mono text-sm">
              <span className="text-ctp-mauve">{currentPrompt.user}</span>
              <span className="text-ctp-subtext0">@</span>
              <span className="text-ctp-blue">{currentPrompt.host}</span>
              <span className="text-ctp-subtext0">:</span>
              <span className="text-ctp-yellow">{currentPrompt.path}</span>
              <span className="text-ctp-green mr-2 ml-2">{currentPrompt.symbol}</span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={terminalState.currentInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="text-ctp-text caret-ctp-text w-full border-none bg-transparent outline-none"
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          )}

          {/* Completion Menu */}
          {completionState.isActive && completionState.completions.length > 1 && (
            <div className="mt-1 ml-2 text-sm">
              <div className="text-ctp-subtext0 mb-1">
                {completionState.selectedIndex === -1
                  ? `Available options (${completionState.completions.length}):`
                  : `Tab through options (${completionState.selectedIndex + 1}/${completionState.completions.length}):`}
              </div>
              <div className="flex flex-wrap gap-2">
                {completionState.completions.map((completion, index) => (
                  <span
                    key={index}
                    className={`rounded px-2 py-1 ${
                      index === completionState.selectedIndex ? 'bg-ctp-surface1 text-ctp-green border-ctp-green border' : 'bg-ctp-surface0 text-ctp-subtext1'
                    }`}
                  >
                    {completion}
                  </span>
                ))}
              </div>
              <div className="text-ctp-subtext0 mt-1 text-xs">
                {completionState.selectedIndex === -1 ? 'Press Tab to select, Escape to cancel' : 'Press Tab to cycle, Enter to apply, Escape to cancel'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Editor Overlay */}
      {isTextEditorOpen && textEditorState && (
        <TextEditor initialState={textEditorState} onSave={handleTextEditorSave} onClose={handleTextEditorClose} onStateChange={setTextEditorState} />
      )}
    </div>
  );
}
