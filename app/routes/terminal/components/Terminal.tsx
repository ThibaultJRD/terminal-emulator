import { useCallback, useEffect, useRef, useState } from 'react';

import { TextEditor } from '~/routes/terminal/components/TextEditor';
import { useFilesystemPersistence } from '~/routes/terminal/hooks/useFilesystemPersistence';
import type { OutputSegment, TerminalState } from '~/routes/terminal/types/filesystem';
import { applyCompletion, applyCompletionNoSpace, getAutocompletions } from '~/routes/terminal/utils/autocompletion';
import { createFile } from '~/routes/terminal/utils/filesystem';
import { formatPath, formatPathWithTilde } from '~/routes/terminal/utils/filesystem';
import { type FilesystemMode, initializeFilesystem, saveFilesystemState } from '~/routes/terminal/utils/persistence';
import {
  analyzeSpecialCommand,
  createOutputLine,
  executeCommandSafely,
  handleFilesystemReset,
  handleFilesystemSaveAfterCommand,
  handleTextEditorOpen,
  initializeTerminalState,
  navigateHistory,
  updateTerminalStateAfterCommand,
} from '~/routes/terminal/utils/terminalHandlers';
import { type TextEditorState } from '~/routes/terminal/utils/textEditor';

interface OutputLine {
  type: 'command' | 'output' | 'error';
  content: string | OutputSegment[];
  timestamp: string;
}

interface TerminalProps {
  mode?: 'default' | 'portfolio' | 'tutorial';
}

export function Terminal({ mode = 'default' }: TerminalProps) {
  const filesystemMode: FilesystemMode = mode === 'portfolio' ? 'portfolio' : mode === 'tutorial' ? 'tutorial' : 'default';

  const [terminalState, setTerminalState] = useState<TerminalState>(() => {
    // Initialize filesystem with persistence support
    const { filesystem, mode: initializedMode, currentPath } = initializeFilesystem(filesystemMode);

    const filesystemState = {
      root: filesystem,
      currentPath: currentPath,
    };

    // Initialize terminal state (history is loaded from file on demand)
    return initializeTerminalState(filesystemState, filesystemMode);
  });

  const [currentFilesystemMode, setCurrentFilesystemMode] = useState<FilesystemMode>(() => {
    // Use the mode from initialized filesystem (in case it was loaded from storage)
    const { mode: initializedMode } = initializeFilesystem(filesystemMode);
    return initializedMode;
  });
  const [textEditorState, setTextEditorState] = useState<TextEditorState | null>(null);
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);

  // Local state for history navigation (reset when command is executed)
  const [historyIndex, setHistoryIndex] = useState(-1);

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
          timestamp: new Date().toISOString(),
        },
        {
          type: 'output',
          content: 'Senior Frontend and Mobile Developer | React | React Native | TypeScript | Web 3.0',
          timestamp: new Date().toISOString(),
        },
        {
          type: 'output',
          content: 'Explore my projects and experience with Unix commands. Type "help" to get started.',
          timestamp: new Date().toISOString(),
        },
      ];
    }

    if (mode === 'tutorial') {
      return [
        {
          type: 'output',
          content: [
            { text: '🎓 ', type: 'normal' },
            { text: 'Welcome to the Interactive Terminal Tutorial!', type: 'header-1' },
          ],
          timestamp: new Date().toISOString(),
        },
        {
          type: 'output',
          content: [
            { text: 'Learn Unix commands step by step | ', type: 'header-2' },
            { text: 'ls', type: 'inline-code' },
            { text: ', ', type: 'normal' },
            { text: 'cd', type: 'inline-code' },
            { text: ', ', type: 'normal' },
            { text: 'vi', type: 'inline-code' },
            { text: ', pipes, variables...', type: 'header-2' },
          ],
          timestamp: new Date().toISOString(),
        },
        {
          type: 'output',
          content: [
            { text: '✨ ', type: 'normal' },
            { text: 'Start your learning journey: ', type: 'bold' },
            { text: 'cd lessons/01-basics && cat README.md', type: 'inline-code' },
          ],
          timestamp: new Date().toISOString(),
        },
        {
          type: 'output',
          content: [
            { text: '📊 Track your progress: ', type: 'bold' },
            { text: 'progress', type: 'inline-code' },
            { text: ' | General help: ', type: 'normal' },
            { text: 'help', type: 'inline-code' },
          ],
          timestamp: new Date().toISOString(),
        },
      ];
    }

    return [
      {
        type: 'output',
        content: 'Welcome to Terminal Emulator v1.0',
        timestamp: new Date().toISOString(),
      },
      {
        type: 'output',
        content: 'Type "help" for available commands.',
        timestamp: new Date().toISOString(),
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
      const result = executeCommandSafely(
        input,
        terminalState.filesystem,
        terminalState.aliasManager,
        terminalState.lastExitCode,
        terminalState.environmentManager,
      );

      // Handle command execution error
      if (!result.success) {
        const errorContent = result.error || 'Command failed';
        setOutputLines((prev) => [...prev, createOutputLine('error', errorContent)]);
        setTerminalState((prev) => updateTerminalStateAfterCommand(prev, input, result.exitCode));
        return;
      }

      // Analyze for special commands
      const specialCommand = analyzeSpecialCommand(result);

      switch (specialCommand.type) {
        case 'clear':
          setOutputLines([]);
          setTerminalState((prev) => updateTerminalStateAfterCommand(prev, input, result.exitCode));
          return;

        case 'reset_filesystem': {
          // Use the current filesystem mode since both modes now have the same structure
          const { newTerminalState, outputLine } = handleFilesystemReset(filesystemMode, terminalState, input);
          setTerminalState(newTerminalState);
          setCurrentFilesystemMode(filesystemMode);
          setOutputLines((prev) => [...prev, outputLine]);
          return;
        }

        case 'open_editor': {
          const { filename, content } = specialCommand.data as { filename: string; content: string };
          const { newTerminalState, editorState } = handleTextEditorOpen(filename, content, terminalState, input);
          // Update terminal state and add command to history
          setTerminalState((prev) => updateTerminalStateAfterCommand(newTerminalState, input));
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
      setTerminalState((prev) => updateTerminalStateAfterCommand(prev, input, result.exitCode));

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
        setHistoryIndex(-1); // Reset history navigation
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const { newInput, newIndex } = navigateHistory(terminalState.filesystem, 'up', historyIndex);

        if (newIndex !== -1) {
          setTerminalState((prev) => ({
            ...prev,
            currentInput: newInput,
          }));
          setHistoryIndex(newIndex);
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const { newInput, newIndex } = navigateHistory(terminalState.filesystem, 'down', historyIndex);

        setTerminalState((prev) => ({
          ...prev,
          currentInput: newInput,
        }));
        setHistoryIndex(newIndex);
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
              ? applyCompletionNoSpace(completionState.originalInput, selectedCompletion, terminalState.aliasManager)
              : applyCompletion(completionState.originalInput, selectedCompletion, terminalState.aliasManager);

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
              ? applyCompletionNoSpace(completionState.originalInput, selectedCompletion, terminalState.aliasManager)
              : applyCompletion(completionState.originalInput, selectedCompletion, terminalState.aliasManager);

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
          const result = getAutocompletions(terminalState.currentInput, terminalState.filesystem, terminalState.aliasManager, terminalState.environmentManager);

          if (result.completions.length === 0) {
            return;
          }

          if (result.completions.length === 1) {
            // Single completion, apply it directly
            const newInput = applyCompletion(terminalState.currentInput, result.completions[0], terminalState.aliasManager);
            setTerminalState((prev) => ({
              ...prev,
              currentInput: newInput,
            }));
            setHistoryIndex(-1);
          } else if (result.commonPrefix && result.commonPrefix.length > terminalState.currentInput.split(/\s+/).pop()?.length!) {
            // Multiple completions with common prefix that extends current input
            const newInput = applyCompletion(terminalState.currentInput, result.commonPrefix, terminalState.aliasManager);
            setTerminalState((prev) => ({
              ...prev,
              currentInput: newInput,
            }));
            setHistoryIndex(-1);
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
    [terminalState.currentInput, terminalState.filesystem, historyIndex, handleCommand, completionState],
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
      }));
      setHistoryIndex(-1);
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
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        setOutputLines((prev) => [
          ...prev,
          {
            type: 'error',
            content: `Failed to save "${filename}"`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    },
    [terminalState.filesystem, currentFilesystemMode],
  );

  const handleTextEditorClose = useCallback((saved: boolean) => {
    setIsTextEditorOpen(false);
    setTextEditorState(null);

    // Reset history navigation
    setHistoryIndex(-1);

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
            className = 'text-ctp-sapphire underline hover:text-ctp-sky transition-colors cursor-pointer';
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

        // Special handling for links to make them clickable
        if (segment.type === 'link' && segment.url) {
          return (
            <a key={segIndex} href={segment.url} target="_blank" rel="noopener noreferrer" className={className}>
              {segment.text}
            </a>
          );
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

  const generatePromptText = (path: string[], currentMode: 'default' | 'portfolio' | 'tutorial'): string => {
    const user = currentMode === 'portfolio' ? 'ThibaultJRD' : currentMode === 'tutorial' ? 'student' : 'user';
    return `${user}@terminal:${formatPath(path)} ❯ `;
  };

  const generatePromptSegments = (path: string[], currentMode: 'default' | 'portfolio' | 'tutorial'): OutputSegment[] => {
    const user = currentMode === 'portfolio' ? 'ThibaultJRD' : currentMode === 'tutorial' ? 'student' : 'user';
    const formattedPath = formatPathWithTilde(path);
    return [
      { type: 'user' as const, text: user },
      { type: 'separator' as const, text: '@' },
      { type: 'host' as const, text: 'terminal' },
      { type: 'separator' as const, text: ':' },
      { type: 'path' as const, text: formattedPath },
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
    user: mode === 'portfolio' ? 'ThibaultJRD' : mode === 'tutorial' ? 'student' : 'user',
    host: 'terminal',
    path: formatPathWithTilde(terminalState.filesystem.currentPath),
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
