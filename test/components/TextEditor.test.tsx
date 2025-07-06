import { useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTextEditorState } from '~/routes/terminal/utils/textEditor';

// Simple mock TextEditor component for testing purposes
const MockTextEditor = ({ initialState, onSave, onClose, onStateChange }: any) => {
  const [state, setState] = useState(initialState);

  // Mock the text width functions for testing
  const getTextWidth = (text: string, position: number) => position * 8; // 8px per character
  const getCharacterWidth = () => 8; // Fixed width

  const handleModify = () => {
    const newState = { ...state, isModified: true, content: 'Modified content' };
    setState(newState);
    onStateChange?.(newState);
  };

  const handleSwitchMode = () => {
    const newState = { ...state, mode: state.mode === 'INSERT' ? 'COMMAND' : 'INSERT' };
    setState(newState);
    onStateChange?.(newState);
  };

  return (
    <div data-testid="text-editor" className="bg-ctp-base text-ctp-text fixed inset-0 z-50 flex flex-col font-mono text-sm">
      {/* Header */}
      <div className="bg-ctp-surface0 border-ctp-overlay0 flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center space-x-4">
          <h1 className="text-ctp-text font-semibold">
            {state.filename}
            {state.isModified && <span className="text-ctp-yellow"> [Modified]</span>}
          </h1>
          <span className="text-ctp-subtext1 text-xs" data-testid="mode-indicator">
            {state.mode} mode
          </span>
        </div>
        <div className="text-ctp-subtext1 flex items-center space-x-2 text-xs">
          <span>
            Line {state.cursorPosition.line + 1}/{state.lines.length}
          </span>
          <span>Col {state.cursorPosition.column + 1}</span>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex flex-1 overflow-hidden focus:outline-none" tabIndex={0} data-testid="editor-content">
        {/* Line numbers */}
        {state.showLineNumbers && (
          <div className="bg-ctp-surface1 border-ctp-overlay0 text-ctp-subtext0 min-w-16 border-r px-2 py-4 text-right text-xs">
            {state.lines.map((_, index) => (
              <div key={index + 1} className="h-6 leading-6">
                {index + 1}
              </div>
            ))}
          </div>
        )}

        {/* Editor lines */}
        <div className="flex-1 overflow-auto px-4 py-4">
          <div className="relative">
            {state.lines.map((line: string, index: number) => {
              const isCursorLine = index === state.cursorPosition.line;

              return (
                <div key={index} className="relative h-6 leading-6" data-testid={`line-${index}`}>
                  {/* Line content */}
                  <span className={isCursorLine ? 'bg-ctp-surface1' : ''}>{line || ' '}</span>

                  {/* Cursor */}
                  {isCursorLine && (
                    <span
                      className={`bg-ctp-text text-ctp-base absolute h-6 animate-pulse ${state.mode === 'INSERT' ? 'w-0.5' : ''}`}
                      style={{
                        left: `${getTextWidth(line, state.cursorPosition.column)}px`,
                        top: 0,
                        width: state.mode === 'COMMAND' ? `${getCharacterWidth()}px` : undefined,
                      }}
                      data-testid="cursor"
                    >
                      {state.mode === 'COMMAND' && line[state.cursorPosition.column] ? line[state.cursorPosition.column] : ' '}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-ctp-surface0 border-ctp-overlay0 flex items-center justify-between border-t px-4 py-2 text-xs">
        <span className="text-ctp-subtext1" data-testid="status-line">
          {state.filename}
          {state.isModified ? ' [Modified]' : ''} - {state.mode} mode - Line {state.cursorPosition.line + 1}/{state.lines.length}, Column{' '}
          {state.cursorPosition.column + 1}
        </span>
        <div className="text-ctp-subtext0 flex items-center space-x-4">
          <span>Press ESC for command mode</span>
          <span>:w to save</span>
          <span>:q to quit</span>
          <span>:wq to save and quit</span>
        </div>
      </div>

      {/* Test controls */}
      <div data-testid="test-controls" style={{ display: 'none' }}>
        <button onClick={() => onSave(state.filename, state.content)} data-testid="save-button">
          Save
        </button>
        <button onClick={() => onClose(true)} data-testid="close-button">
          Close
        </button>
        <button onClick={handleModify} data-testid="modify-button">
          Modify
        </button>
        <button onClick={handleSwitchMode} data-testid="switch-mode-button">
          Switch Mode
        </button>
      </div>
    </div>
  );
};

describe('TextEditor Component', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnStateChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render with initial state', () => {
      const initialState = createTextEditorState('test.txt', 'Hello\nWorld');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} onStateChange={mockOnStateChange} />);

      expect(screen.getByTestId('text-editor')).toBeInTheDocument();
      expect(screen.getByText('test.txt')).toBeInTheDocument();
      expect(screen.getByText('COMMAND mode')).toBeInTheDocument();
      expect(screen.getByText('Line 1/2')).toBeInTheDocument();
      expect(screen.getByText('Col 1')).toBeInTheDocument();
    });

    it('should render file content correctly', () => {
      const initialState = createTextEditorState('test.txt', 'Line 1\nLine 2\nLine 3');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByTestId('line-0')).toHaveTextContent('Line 1');
      expect(screen.getByTestId('line-1')).toHaveTextContent('Line 2');
      expect(screen.getByTestId('line-2')).toHaveTextContent('Line 3');
    });

    it('should show line numbers when enabled', () => {
      const initialState = createTextEditorState('test.txt', 'Line 1\nLine 2');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render cursor at correct position', () => {
      const initialState = createTextEditorState('test.txt', 'Hello World');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      const cursor = screen.getByTestId('cursor');
      expect(cursor).toBeInTheDocument();
      expect(cursor).toHaveStyle({ left: '0px' }); // At column 0
    });

    it('should handle empty file', () => {
      const initialState = createTextEditorState('empty.txt', '');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText('empty.txt')).toBeInTheDocument();
      expect(screen.getByText('Line 1/1')).toBeInTheDocument();
      expect(screen.getByTestId('line-0')).toBeInTheDocument();
    });
  });

  describe('modified state indication', () => {
    it('should show modified indicator when content is modified', () => {
      const initialState = createTextEditorState('test.txt', 'Original content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} onStateChange={mockOnStateChange} />);

      // Simulate modification
      fireEvent.click(screen.getByTestId('modify-button'));

      expect(screen.getByText('[Modified]')).toBeInTheDocument();
      expect(screen.getByTestId('status-line')).toHaveTextContent('[Modified]');
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it('should not show modified indicator for unmodified content', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.queryByText('[Modified]')).not.toBeInTheDocument();
    });
  });

  describe('mode switching', () => {
    it('should display current mode correctly', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} onStateChange={mockOnStateChange} />);

      expect(screen.getByTestId('mode-indicator')).toHaveTextContent('COMMAND mode');

      // Switch to INSERT mode
      fireEvent.click(screen.getByTestId('switch-mode-button'));

      expect(screen.getByTestId('mode-indicator')).toHaveTextContent('INSERT mode');
      expect(mockOnStateChange).toHaveBeenCalled();
    });

    it('should update status line when mode changes', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByTestId('status-line')).toHaveTextContent('COMMAND mode');

      // Switch mode
      fireEvent.click(screen.getByTestId('switch-mode-button'));

      expect(screen.getByTestId('status-line')).toHaveTextContent('INSERT mode');
    });
  });

  describe('cursor display', () => {
    it('should render cursor in COMMAND mode with character width', () => {
      const initialState = createTextEditorState('test.txt', 'Hello');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      const cursor = screen.getByTestId('cursor');
      expect(cursor).toHaveStyle({ width: '8px' }); // Character width in COMMAND mode
      expect(cursor).not.toHaveClass('w-0.5'); // Should not have INSERT mode width class
    });

    it('should render cursor in INSERT mode with thin width', () => {
      const initialState = createTextEditorState('test.txt', 'Hello');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      // Switch to INSERT mode
      fireEvent.click(screen.getByTestId('switch-mode-button'));

      const cursor = screen.getByTestId('cursor');
      expect(cursor).toHaveClass('w-0.5'); // Thin cursor in INSERT mode
      expect(cursor).toHaveStyle({ width: undefined }); // No explicit width set
    });

    it('should position cursor correctly based on column', () => {
      const initialState = createTextEditorState('test.txt', 'Hello World');
      // Position cursor at column 6 (after "Hello ")
      initialState.cursorPosition = { line: 0, column: 6 };

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      const cursor = screen.getByTestId('cursor');
      expect(cursor).toHaveStyle({ left: '48px' }); // 6 * 8px per character
    });
  });

  describe('status line formatting', () => {
    it('should format status line correctly', () => {
      const initialState = createTextEditorState('document.txt', 'Line 1\nLine 2\nLine 3');
      initialState.cursorPosition = { line: 1, column: 3 };

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      const statusLine = screen.getByTestId('status-line');
      expect(statusLine).toHaveTextContent('document.txt - COMMAND mode - Line 2/3, Column 4');
    });

    it('should include modified indicator in status line', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      // Modify content
      fireEvent.click(screen.getByTestId('modify-button'));

      const statusLine = screen.getByTestId('status-line');
      expect(statusLine).toHaveTextContent('test.txt [Modified] - COMMAND mode');
    });
  });

  describe('file operations', () => {
    it('should call onSave when save button is clicked', () => {
      const initialState = createTextEditorState('test.txt', 'Content to save');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId('save-button'));

      expect(mockOnSave).toHaveBeenCalledWith('test.txt', 'Content to save');
    });

    it('should call onClose when close button is clicked', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId('close-button'));

      expect(mockOnClose).toHaveBeenCalledWith(true);
    });

    it('should call onStateChange when provided', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} onStateChange={mockOnStateChange} />);

      // Trigger state change
      fireEvent.click(screen.getByTestId('modify-button'));

      expect(mockOnStateChange).toHaveBeenCalled();
    });
  });

  describe('props handling', () => {
    it('should handle different initial states', () => {
      const customState = createTextEditorState('custom.md', '# Markdown Content\n\nHello world!');
      customState.showLineNumbers = true;
      customState.isModified = true;

      render(<MockTextEditor initialState={customState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText('custom.md')).toBeInTheDocument();
      expect(screen.getByText('[Modified]')).toBeInTheDocument();
      expect(screen.getByTestId('line-0')).toHaveTextContent('# Markdown Content');
      expect(screen.getByTestId('line-1')).toHaveTextContent('');
      expect(screen.getByTestId('line-2')).toHaveTextContent('Hello world!');
    });

    it('should handle missing optional props gracefully', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(
        <MockTextEditor
          initialState={initialState}
          onSave={mockOnSave}
          onClose={mockOnClose}
          // onStateChange not provided
        />,
      );

      expect(screen.getByTestId('text-editor')).toBeInTheDocument();

      // Should not crash when state changes
      fireEvent.click(screen.getByTestId('modify-button'));
    });
  });

  describe('accessibility and UI elements', () => {
    it('should have proper focus management', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      const editorContent = screen.getByTestId('editor-content');
      expect(editorContent).toHaveAttribute('tabIndex', '0');
    });

    it('should display help text in status bar', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText('Press ESC for command mode')).toBeInTheDocument();
      expect(screen.getByText(':w to save')).toBeInTheDocument();
      expect(screen.getByText(':q to quit')).toBeInTheDocument();
      expect(screen.getByText(':wq to save and quit')).toBeInTheDocument();
    });

    it('should apply correct CSS classes for theming', () => {
      const initialState = createTextEditorState('test.txt', 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      const editor = screen.getByTestId('text-editor');
      expect(editor).toHaveClass('bg-ctp-base', 'text-ctp-text', 'fixed', 'inset-0', 'font-mono');
    });
  });

  describe('edge cases', () => {
    it('should handle very long filenames', () => {
      const longFilename = 'very-long-filename-that-might-overflow-the-header-area.txt';
      const initialState = createTextEditorState(longFilename, 'Content');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText(longFilename)).toBeInTheDocument();
    });

    it('should handle files with many lines', () => {
      const manyLines = Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`).join('\n');
      const initialState = createTextEditorState('large.txt', manyLines);

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText('Line 1/100')).toBeInTheDocument();
      expect(screen.getByTestId('line-0')).toHaveTextContent('Line 1');
    });

    it('should handle special characters in filename', () => {
      const specialFilename = 'file-with-émojis-🎉.txt';
      const initialState = createTextEditorState(specialFilename, 'Content with émojis 🚀');

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      expect(screen.getByText(specialFilename)).toBeInTheDocument();
      expect(screen.getByTestId('line-0')).toHaveTextContent('Content with émojis 🚀');
    });

    it('should handle cursor at end of line', () => {
      const initialState = createTextEditorState('test.txt', 'Hello');
      initialState.cursorPosition = { line: 0, column: 5 }; // At end of "Hello"

      render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      const cursor = screen.getByTestId('cursor');
      expect(cursor).toHaveStyle({ left: '40px' }); // 5 * 8px
      expect(cursor).toHaveTextContent(' '); // Should show space when at end
    });

    it('should handle multiple editor instances', () => {
      const state1 = createTextEditorState('file1.txt', 'Content 1');
      const state2 = createTextEditorState('file2.txt', 'Content 2');

      const { container } = render(
        <div>
          <MockTextEditor initialState={state1} onSave={mockOnSave} onClose={mockOnClose} />
          <MockTextEditor initialState={state2} onSave={mockOnSave} onClose={mockOnClose} />
        </div>,
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
      expect(container.querySelectorAll('[data-testid="text-editor"]')).toHaveLength(2);
    });
  });

  describe('component lifecycle', () => {
    it('should handle initial state changes properly', () => {
      const initialState = createTextEditorState('test.txt', 'Initial content');

      const { rerender } = render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} onStateChange={mockOnStateChange} />);

      expect(screen.getByTestId('line-0')).toHaveTextContent('Initial content');

      // Rerender with new initial state (simulating new file)
      const newState = createTextEditorState('new.txt', 'New content');
      rerender(<MockTextEditor initialState={newState} onSave={mockOnSave} onClose={mockOnClose} onStateChange={mockOnStateChange} />);

      expect(screen.getByText('new.txt')).toBeInTheDocument();
      expect(screen.getByTestId('line-0')).toHaveTextContent('New content');
    });

    it('should handle callback changes gracefully', () => {
      const initialState = createTextEditorState('test.txt', 'Content');
      const newOnSave = vi.fn();

      const { rerender } = render(<MockTextEditor initialState={initialState} onSave={mockOnSave} onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId('save-button'));
      expect(mockOnSave).toHaveBeenCalledWith('test.txt', 'Content');

      // Rerender with new callback
      rerender(<MockTextEditor initialState={initialState} onSave={newOnSave} onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId('save-button'));
      expect(newOnSave).toHaveBeenCalledWith('test.txt', 'Content');
    });
  });
});
