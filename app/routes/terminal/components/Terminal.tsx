import { useCallback, useEffect, useRef, useState } from 'react';

import type { OutputSegment, TerminalState } from '~/routes/terminal/types/filesystem';
import { applyCompletion, getAutocompletions } from '~/routes/terminal/utils/autocompletion';
import { executeCommand } from '~/routes/terminal/utils/commands';
import { createDefaultFileSystem } from '~/routes/terminal/utils/filesystem';
import { formatPath } from '~/routes/terminal/utils/filesystem';

interface TerminalOutputLine {
  type: 'command' | 'output' | 'error';
  content: string | OutputSegment[];
  timestamp: Date;
}

export function Terminal() {
  const [terminalState, setTerminalState] = useState<TerminalState>(() => ({
    history: [],
    historyIndex: -1,
    currentInput: '',
    output: [],
    filesystem: createDefaultFileSystem(),
  }));

  const [outputLines, setOutputLines] = useState<TerminalOutputLine[]>([
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
  ]);

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

  const handleCommand = useCallback(
    (input: string) => {
      if (!input.trim()) return;

      const newOutputLines = [...outputLines];
      const prompt = `${formatPath(terminalState.filesystem.currentPath)} $ `;

      newOutputLines.push({
        type: 'command',
        content: prompt + input,
        timestamp: new Date(),
      });

      const result = executeCommand(input, terminalState.filesystem);

      if (result.output === 'CLEAR') {
        setOutputLines([]);
        setTerminalState((prev) => ({
          ...prev,
          history: [...prev.history, input],
          historyIndex: -1,
          currentInput: '',
        }));
        return;
      }

      if (result.success && result.output) {
        newOutputLines.push({
          type: 'output',
          content: result.output,
          timestamp: new Date(),
        });
      }

      if (!result.success && result.error) {
        newOutputLines.push({
          type: 'error',
          content: result.error,
          timestamp: new Date(),
        });
      }

      setOutputLines(newOutputLines);
      setTerminalState((prev) => ({
        ...prev,
        history: [...prev.history, input],
        historyIndex: -1,
        currentInput: '',
      }));
    },
    [outputLines, terminalState.filesystem],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
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
        const result = getAutocompletions(terminalState.currentInput, terminalState.filesystem);

        if (result.completions.length === 0) {
          return;
        }

        if (result.completions.length === 1) {
          // Single completion, apply it
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
          // Multiple completions, show them
          const newOutputLines = [...outputLines];
          const prompt = `${formatPath(terminalState.filesystem.currentPath)} $ `;

          newOutputLines.push({
            type: 'command',
            content: prompt + terminalState.currentInput,
            timestamp: new Date(),
          });

          const completionList = result.completions.join('  ');
          newOutputLines.push({
            type: 'output',
            content: completionList,
            timestamp: new Date(),
          });

          setOutputLines(newOutputLines);
        }

        return;
      }
    },
    [terminalState.currentInput, terminalState.history, terminalState.historyIndex, handleCommand],
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTerminalState((prev) => ({
      ...prev,
      currentInput: e.target.value,
      historyIndex: -1,
    }));
  }, []);

  const handleTerminalClick = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const renderOutputLine = (line: TerminalOutputLine, index: number) => {
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
          <div key={index} className={`${baseClasses} text-ctp-green`}>
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

  const currentPrompt = `${formatPath(terminalState.filesystem.currentPath)} $ `;

  return (
    <div className="bg-ctp-base flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4" ref={terminalRef} onClick={handleTerminalClick}>
        <div className="space-y-1">
          {outputLines.map(renderOutputLine)}

          <div className="flex items-center font-mono text-sm">
            <span className="text-ctp-green mr-2">{currentPrompt}</span>
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
        </div>
      </div>
    </div>
  );
}
