import { describe, expect, it } from 'vitest';

import type { EditorMode, TextEditorState } from '~/routes/terminal/utils/textEditor';
import {
  createTextEditorState,
  deleteTextAtCursor,
  executeEditorCommand,
  formatStatusLine,
  getVisibleLines,
  handleKeyboardInput,
  hasUnsavedChanges,
  insertNewLine,
  insertNewLineAbove,
  insertNewLineBelow,
  insertTextAtCursor,
  moveCursor,
  switchMode,
  updateEditorContent,
} from '~/routes/terminal/utils/textEditor';

describe('textEditor utilities', () => {
  describe('createTextEditorState', () => {
    it('should create initial state with default values', () => {
      const state = createTextEditorState('test.txt', 'Hello\nWorld');

      expect(state.filename).toBe('test.txt');
      expect(state.originalContent).toBe('Hello\nWorld');
      expect(state.content).toBe('Hello\nWorld');
      expect(state.lines).toEqual(['Hello', 'World']);
      expect(state.cursorPosition).toEqual({ line: 0, column: 0 });
      expect(state.mode).toBe('NORMAL'); // Should default to NORMAL mode
      expect(state.isModified).toBe(false);
      expect(state.showLineNumbers).toBe(true);
      expect(state.statusMessage).toBe('Editing test.txt - NORMAL mode');
      expect(state.scrollOffset).toBe(0);
      expect(state.maxVisibleLines).toBe(20);
      expect(state.isVisible).toBe(true);
    });

    it('should handle empty content', () => {
      const state = createTextEditorState('empty.txt');

      expect(state.content).toBe('');
      expect(state.lines).toEqual(['']);
      expect(state.isModified).toBe(false);
    });

    it('should handle content with multiple line breaks', () => {
      const state = createTextEditorState('test.txt', 'Line1\n\nLine3\n');

      expect(state.lines).toEqual(['Line1', '', 'Line3', '']);
    });
  });

  describe('updateEditorContent', () => {
    it('should update content and mark as modified', () => {
      const initialState = createTextEditorState('test.txt', 'Original');
      const newState = updateEditorContent(initialState, 'Modified');

      expect(newState.content).toBe('Modified');
      expect(newState.lines).toEqual(['Modified']);
      expect(newState.isModified).toBe(true);
      expect(newState.statusMessage).toBe('test.txt [Modified] - NORMAL mode');
    });

    it('should not mark as modified if content is same as original', () => {
      const initialState = createTextEditorState('test.txt', 'Original');
      const newState = updateEditorContent(initialState, 'Original');

      expect(newState.isModified).toBe(false);
      expect(newState.statusMessage).toBe('test.txt - NORMAL mode');
    });
  });

  describe('moveCursor', () => {
    it('should move cursor within bounds', () => {
      const state = createTextEditorState('test.txt', 'Hello\nWorld');
      const newState = moveCursor(state, { line: 1, column: 3 });

      expect(newState.cursorPosition).toEqual({ line: 1, column: 3 });
    });

    it('should clamp cursor to line bounds', () => {
      const state = createTextEditorState('test.txt', 'Hello\nWorld');
      const newState = moveCursor(state, { line: 1, column: 10 });

      expect(newState.cursorPosition).toEqual({ line: 1, column: 5 }); // "World" has 5 characters
    });

    it('should clamp cursor to file bounds', () => {
      const state = createTextEditorState('test.txt', 'Hello\nWorld');
      const newState = moveCursor(state, { line: 5, column: 0 });

      expect(newState.cursorPosition).toEqual({ line: 1, column: 0 }); // Only 2 lines (0,1)
    });

    it('should handle negative values', () => {
      const state = createTextEditorState('test.txt', 'Hello\nWorld');
      const newState = moveCursor(state, { line: -1, column: -1 });

      expect(newState.cursorPosition).toEqual({ line: 0, column: 0 });
    });

    it('should adjust scroll offset when cursor moves out of view', () => {
      const state = createTextEditorState('test.txt', 'Line1\n'.repeat(30));
      state.maxVisibleLines = 10;

      const newState = moveCursor(state, { line: 25 });

      expect(newState.scrollOffset).toBe(16); // 25 - 10 + 1
    });
  });

  describe('switchMode', () => {
    it('should switch between modes', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const insertState = switchMode(state, 'INSERT');

      expect(insertState.mode).toBe('INSERT');
      expect(insertState.statusMessage).toBe('test.txt - INSERT mode');

      const normalState = switchMode(insertState, 'NORMAL');
      expect(normalState.mode).toBe('NORMAL');
      expect(normalState.statusMessage).toBe('test.txt - NORMAL mode');
    });

    it('should include modified indicator in status', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const modifiedState = { ...state, isModified: true };
      const newState = switchMode(modifiedState, 'INSERT');

      expect(newState.statusMessage).toBe('test.txt [Modified] - INSERT mode');
    });
  });

  describe('insertTextAtCursor', () => {
    it('should insert text at cursor position', () => {
      const state = createTextEditorState('test.txt', 'Hello World');
      const cursorState = moveCursor(state, { column: 6 });
      const newState = insertTextAtCursor(cursorState, 'Beautiful ');

      expect(newState.content).toBe('Hello Beautiful World');
      expect(newState.cursorPosition.column).toBe(16); // 6 + 10 characters
      expect(newState.isModified).toBe(true);
    });

    it('should insert text at beginning of line', () => {
      const state = createTextEditorState('test.txt', 'World');
      const newState = insertTextAtCursor(state, 'Hello ');

      expect(newState.content).toBe('Hello World');
      expect(newState.cursorPosition.column).toBe(6);
    });

    it('should insert text at end of line', () => {
      const state = createTextEditorState('test.txt', 'Hello');
      const cursorState = moveCursor(state, { column: 5 });
      const newState = insertTextAtCursor(cursorState, ' World');

      expect(newState.content).toBe('Hello World');
      expect(newState.cursorPosition.column).toBe(11);
    });

    it('should handle multiline insertion', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2');
      const cursorState = moveCursor(state, { line: 1, column: 2 });
      const newState = insertTextAtCursor(cursorState, 'XXX');

      expect(newState.content).toBe('Line1\nLiXXXne2');
      expect(newState.cursorPosition).toEqual({ line: 1, column: 5 });
    });
  });

  describe('deleteTextAtCursor', () => {
    it('should delete character backward (backspace)', () => {
      const state = createTextEditorState('test.txt', 'Hello World');
      const cursorState = moveCursor(state, { column: 6 });
      const newState = deleteTextAtCursor(cursorState, 'backward');

      expect(newState.content).toBe('HelloWorld');
      expect(newState.cursorPosition.column).toBe(5);
      expect(newState.isModified).toBe(true);
    });

    it('should delete character forward (delete key)', () => {
      const state = createTextEditorState('test.txt', 'Hello World');
      const cursorState = moveCursor(state, { column: 5 });
      const newState = deleteTextAtCursor(cursorState, 'forward');

      expect(newState.content).toBe('HelloWorld');
      expect(newState.cursorPosition.column).toBe(5);
    });

    it('should join lines when deleting at beginning of line', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2');
      const cursorState = moveCursor(state, { line: 1, column: 0 });
      const newState = deleteTextAtCursor(cursorState, 'backward');

      expect(newState.content).toBe('Line1Line2');
      expect(newState.cursorPosition).toEqual({ line: 0, column: 5 });
    });

    it('should join lines when deleting at end of line', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2');
      const cursorState = moveCursor(state, { line: 0, column: 5 });
      const newState = deleteTextAtCursor(cursorState, 'forward');

      expect(newState.content).toBe('Line1Line2');
      expect(newState.cursorPosition).toEqual({ line: 0, column: 5 });
    });

    it('should not delete when at boundaries', () => {
      const state = createTextEditorState('test.txt', 'Hello');

      // Try to delete backward at beginning
      const backwardState = deleteTextAtCursor(state, 'backward');
      expect(backwardState.content).toBe('Hello');

      // Try to delete forward at end
      const cursorAtEnd = moveCursor(state, { column: 5 });
      const forwardState = deleteTextAtCursor(cursorAtEnd, 'forward');
      expect(forwardState.content).toBe('Hello');
    });
  });

  describe('insertNewLine', () => {
    it('should insert new line at cursor position', () => {
      const state = createTextEditorState('test.txt', 'Hello World');
      const cursorState = moveCursor(state, { column: 6 });
      const newState = insertNewLine(cursorState);

      expect(newState.content).toBe('Hello \nWorld');
      expect(newState.lines).toEqual(['Hello ', 'World']);
      expect(newState.cursorPosition).toEqual({ line: 1, column: 0 });
    });

    it('should insert new line at beginning of line', () => {
      const state = createTextEditorState('test.txt', 'Hello');
      const newState = insertNewLine(state);

      expect(newState.content).toBe('\nHello');
      expect(newState.lines).toEqual(['', 'Hello']);
      expect(newState.cursorPosition).toEqual({ line: 1, column: 0 });
    });

    it('should insert new line at end of line', () => {
      const state = createTextEditorState('test.txt', 'Hello');
      const cursorState = moveCursor(state, { column: 5 });
      const newState = insertNewLine(cursorState);

      expect(newState.content).toBe('Hello\n');
      expect(newState.lines).toEqual(['Hello', '']);
      expect(newState.cursorPosition).toEqual({ line: 1, column: 0 });
    });
  });

  describe('insertNewLineBelow', () => {
    it('should insert empty line below current line', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2\nLine3');
      const cursorState = moveCursor(state, { line: 1, column: 2 });
      const newState = insertNewLineBelow(cursorState);

      expect(newState.content).toBe('Line1\nLine2\n\nLine3');
      expect(newState.lines).toEqual(['Line1', 'Line2', '', 'Line3']);
      expect(newState.cursorPosition).toEqual({ line: 2, column: 0 });
    });

    it('should work at last line', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2');
      const cursorState = moveCursor(state, { line: 1 });
      const newState = insertNewLineBelow(cursorState);

      expect(newState.content).toBe('Line1\nLine2\n');
      expect(newState.lines).toEqual(['Line1', 'Line2', '']);
      expect(newState.cursorPosition).toEqual({ line: 2, column: 0 });
    });
  });

  describe('insertNewLineAbove', () => {
    it('should insert empty line above current line', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2\nLine3');
      const cursorState = moveCursor(state, { line: 1, column: 2 });
      const newState = insertNewLineAbove(cursorState);

      expect(newState.content).toBe('Line1\n\nLine2\nLine3');
      expect(newState.lines).toEqual(['Line1', '', 'Line2', 'Line3']);
      expect(newState.cursorPosition).toEqual({ line: 1, column: 0 });
    });

    it('should work at first line', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2');
      const cursorState = moveCursor(state, { line: 0 });
      const newState = insertNewLineAbove(cursorState);

      expect(newState.content).toBe('\nLine1\nLine2');
      expect(newState.lines).toEqual(['', 'Line1', 'Line2']);
      expect(newState.cursorPosition).toEqual({ line: 0, column: 0 });
    });
  });

  describe('executeEditorCommand', () => {
    it('should execute write command', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const modifiedState = { ...state, isModified: true };
      const result = executeEditorCommand(modifiedState, 'w');

      expect(result.success).toBe(true);
      expect(result.message).toBe('"test.txt" written');
      expect(result.newState?.isModified).toBe(false);
      expect(result.newState?.originalContent).toBe('Content');
    });

    it('should execute quit command without changes', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const result = executeEditorCommand(state, 'q');

      expect(result.success).toBe(true);
      expect(result.shouldClose).toBe(true);
      expect(result.message).toBe('Quit');
    });

    it('should prevent quit with unsaved changes', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const modifiedState = { ...state, isModified: true };
      const result = executeEditorCommand(modifiedState, 'q');

      expect(result.success).toBe(false);
      expect(result.shouldClose).toBeUndefined();
      expect(result.message).toBe('No write since last change (use :q! to force quit)');
    });

    it('should execute force quit command', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const modifiedState = { ...state, isModified: true };
      const result = executeEditorCommand(modifiedState, 'q!');

      expect(result.success).toBe(true);
      expect(result.shouldClose).toBe(true);
      expect(result.message).toBe('Quit without saving');
    });

    it('should execute write and quit command', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const result = executeEditorCommand(state, 'wq');

      expect(result.success).toBe(true);
      expect(result.shouldClose).toBe(true);
      expect(result.message).toBe('"test.txt" written and quit');
      expect(result.newState?.isModified).toBe(false);
    });

    it('should execute write to specific filename', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const result = executeEditorCommand(state, 'w newfile.txt');

      expect(result.success).toBe(true);
      expect(result.message).toBe('"newfile.txt" written');
      expect(result.newState?.filename).toBe('newfile.txt');
    });

    it('should show help', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const result = executeEditorCommand(state, 'help');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Commands:');
      expect(result.message).toContain(':w');
      expect(result.message).toContain(':q');
    });

    it('should handle unknown commands', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const result = executeEditorCommand(state, 'unknown');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Unknown command: unknown');
    });

    it('should handle command variations', () => {
      const state = createTextEditorState('test.txt', 'Content');

      // Test alternative spellings
      expect(executeEditorCommand(state, 'quit').success).toBe(true);
      expect(executeEditorCommand(state, 'write').success).toBe(true);
      expect(executeEditorCommand(state, 'x').success).toBe(true);
      expect(executeEditorCommand(state, 'wq!').success).toBe(true);
    });
  });

  describe('handleKeyboardInput', () => {
    const createKeyEvent = (key: string, options: Partial<KeyboardEvent> = {}): KeyboardEvent => {
      return {
        key,
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: () => {},
        ...options,
      } as KeyboardEvent;
    };

    describe('INSERT mode', () => {
      it('should switch to NORMAL mode on Escape', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Content'), 'INSERT');
        const result = handleKeyboardInput(state, createKeyEvent('Escape'));

        expect(result.state.mode).toBe('NORMAL');
      });

      it('should insert new line on Enter', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Hello'), 'INSERT');
        const cursorState = moveCursor(state, { column: 2 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('Enter'));

        expect(result.state.content).toBe('He\nllo');
      });

      it('should delete on Backspace', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Hello'), 'INSERT');
        const cursorState = moveCursor(state, { column: 2 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('Backspace'));

        expect(result.state.content).toBe('Hllo');
        expect(result.state.cursorPosition.column).toBe(1);
      });

      it('should delete on Delete key', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Hello'), 'INSERT');
        const cursorState = moveCursor(state, { column: 2 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('Delete'));

        expect(result.state.content).toBe('Helo');
        expect(result.state.cursorPosition.column).toBe(2);
      });

      it('should move cursor with arrow keys', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Hello\nWorld'), 'INSERT');

        const upResult = handleKeyboardInput(moveCursor(state, { line: 1 }), createKeyEvent('ArrowUp'));
        expect(upResult.state.cursorPosition.line).toBe(0);

        const downResult = handleKeyboardInput(state, createKeyEvent('ArrowDown'));
        expect(downResult.state.cursorPosition.line).toBe(1);

        const leftResult = handleKeyboardInput(moveCursor(state, { column: 2 }), createKeyEvent('ArrowLeft'));
        expect(leftResult.state.cursorPosition.column).toBe(1);

        const rightResult = handleKeyboardInput(state, createKeyEvent('ArrowRight'));
        expect(rightResult.state.cursorPosition.column).toBe(1);
      });

      it('should handle Home and End keys', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Hello'), 'INSERT');
        const cursorState = moveCursor(state, { column: 2 });

        const homeResult = handleKeyboardInput(cursorState, createKeyEvent('Home'));
        expect(homeResult.state.cursorPosition.column).toBe(0);

        const endResult = handleKeyboardInput(state, createKeyEvent('End'));
        expect(endResult.state.cursorPosition.column).toBe(5);
      });

      it('should handle Page Up and Page Down', () => {
        const content = 'Line1\n'.repeat(30);
        const state = switchMode(createTextEditorState('test.txt', content), 'INSERT');
        state.maxVisibleLines = 10;
        const cursorState = moveCursor(state, { line: 15 });

        const pageUpResult = handleKeyboardInput(cursorState, createKeyEvent('PageUp'));
        expect(pageUpResult.state.cursorPosition.line).toBe(5); // 15 - 10

        const pageDownResult = handleKeyboardInput(state, createKeyEvent('PageDown'));
        expect(pageDownResult.state.cursorPosition.line).toBe(10); // 0 + 10
      });

      it('should insert tab as spaces', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Hello'), 'INSERT');
        const result = handleKeyboardInput(state, createKeyEvent('Tab'));

        expect(result.state.content).toBe('  Hello');
        expect(result.state.cursorPosition.column).toBe(2);
      });

      it('should insert regular characters', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Hllo'), 'INSERT');
        const cursorState = moveCursor(state, { column: 1 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('e'));

        expect(result.state.content).toBe('Hello');
        expect(result.state.cursorPosition.column).toBe(2);
      });

      it('should ignore modifier key combinations', () => {
        const state = switchMode(createTextEditorState('test.txt', 'Hello'), 'INSERT');
        const result = handleKeyboardInput(state, createKeyEvent('s', { ctrlKey: true }));

        expect(result.state.content).toBe('Hello'); // No change
      });
    });

    describe('NORMAL mode', () => {
      it('should switch to INSERT mode on i', () => {
        const state = createTextEditorState('test.txt', 'Content');
        const result = handleKeyboardInput(state, createKeyEvent('i'));

        expect(result.state.mode).toBe('INSERT');
      });

      it('should append after cursor on a', () => {
        const state = createTextEditorState('test.txt', 'Hello');
        const cursorState = moveCursor(state, { column: 2 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('a'));

        expect(result.state.mode).toBe('INSERT');
        expect(result.state.cursorPosition.column).toBe(3);
      });

      it('should open new line below on o', () => {
        const state = createTextEditorState('test.txt', 'Line1\nLine2');
        const result = handleKeyboardInput(state, createKeyEvent('o'));

        expect(result.state.mode).toBe('INSERT');
        expect(result.state.content).toBe('Line1\n\nLine2');
        expect(result.state.cursorPosition).toEqual({ line: 1, column: 0 });
      });

      it('should move cursor with hjkl keys', () => {
        const state = createTextEditorState('test.txt', 'Hello\nWorld');
        const cursorState = moveCursor(state, { line: 1, column: 2 });

        const hResult = handleKeyboardInput(cursorState, createKeyEvent('h'));
        expect(hResult.state.cursorPosition.column).toBe(1);

        const jResult = handleKeyboardInput(state, createKeyEvent('j'));
        expect(jResult.state.cursorPosition.line).toBe(1);

        const kResult = handleKeyboardInput(cursorState, createKeyEvent('k'));
        expect(kResult.state.cursorPosition.line).toBe(0);

        const lResult = handleKeyboardInput(state, createKeyEvent('l'));
        expect(lResult.state.cursorPosition.column).toBe(1);
      });

      it('should move to beginning of line on 0', () => {
        const state = createTextEditorState('test.txt', 'Hello');
        const cursorState = moveCursor(state, { column: 3 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('0'));

        expect(result.state.cursorPosition.column).toBe(0);
      });

      it('should move to end of line on $', () => {
        const state = createTextEditorState('test.txt', 'Hello');
        const result = handleKeyboardInput(state, createKeyEvent('$'));

        expect(result.state.cursorPosition.column).toBe(5); // End of line after fix
      });

      it('should move to end of file on G', () => {
        const state = createTextEditorState('test.txt', 'Line1\nLine2\nLine3');
        const result = handleKeyboardInput(state, createKeyEvent('G'));

        expect(result.state.cursorPosition.line).toBe(2);
      });

      it('should delete character forward on x', () => {
        const state = createTextEditorState('test.txt', 'Hello');
        const cursorState = moveCursor(state, { column: 1 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('x'));

        expect(result.state.content).toBe('Hllo');
        expect(result.state.cursorPosition.column).toBe(1);
      });

      it('should delete character backward on X', () => {
        const state = createTextEditorState('test.txt', 'Hello');
        const cursorState = moveCursor(state, { column: 1 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('X'));

        expect(result.state.content).toBe('ello');
        expect(result.state.cursorPosition.column).toBe(0);
      });

      it('should handle colon key for command input', () => {
        const state = createTextEditorState('test.txt', 'Content');
        const result = handleKeyboardInput(state, createKeyEvent(':'));

        // The colon key is handled by the TextEditor component, so state shouldn't change
        expect(result.state).toBe(state);
      });

      it('should ignore unhandled keys', () => {
        const state = createTextEditorState('test.txt', 'Content');
        const result = handleKeyboardInput(state, createKeyEvent('z'));

        expect(result.state).toBe(state);
      });

      it('should handle A key - insert at end of line', () => {
        const state = createTextEditorState('test.txt', 'Hello\nWorld');
        const cursorState = moveCursor(state, { line: 0, column: 2 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('A'));

        expect(result.state.mode).toBe('INSERT');
        expect(result.state.cursorPosition).toEqual({ line: 0, column: 5 });
      });

      it('should handle I key - insert at beginning of line', () => {
        const state = createTextEditorState('test.txt', 'Hello\nWorld');
        const cursorState = moveCursor(state, { line: 0, column: 3 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('I'));

        expect(result.state.mode).toBe('INSERT');
        expect(result.state.cursorPosition).toEqual({ line: 0, column: 0 });
      });

      it('should handle O key - insert line above', () => {
        const state = createTextEditorState('test.txt', 'Hello\nWorld');
        const cursorState = moveCursor(state, { line: 1, column: 2 });
        const result = handleKeyboardInput(cursorState, createKeyEvent('O'));

        expect(result.state.mode).toBe('INSERT');
        expect(result.state.content).toBe('Hello\n\nWorld');
        expect(result.state.cursorPosition).toEqual({ line: 1, column: 0 });
      });
    });
  });

  describe('getVisibleLines', () => {
    it('should return visible lines within viewport', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2\nLine3\nLine4\nLine5');
      state.maxVisibleLines = 3;
      state.scrollOffset = 1;

      const visibleLines = getVisibleLines(state);

      expect(visibleLines).toEqual([
        { lineNumber: 2, content: 'Line2' },
        { lineNumber: 3, content: 'Line3' },
        { lineNumber: 4, content: 'Line4' },
      ]);
    });

    it('should handle viewport larger than content', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2');
      state.maxVisibleLines = 10;

      const visibleLines = getVisibleLines(state);

      expect(visibleLines).toEqual([
        { lineNumber: 1, content: 'Line1' },
        { lineNumber: 2, content: 'Line2' },
      ]);
    });

    it('should handle scroll offset at end of file', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2\nLine3');
      state.maxVisibleLines = 2;
      state.scrollOffset = 2;

      const visibleLines = getVisibleLines(state);

      expect(visibleLines).toEqual([{ lineNumber: 3, content: 'Line3' }]);
    });
  });

  describe('formatStatusLine', () => {
    it('should format status line without modifications', () => {
      const state = createTextEditorState('test.txt', 'Line1\nLine2');
      const cursorState = moveCursor(state, { line: 1, column: 3 });
      const status = formatStatusLine(cursorState);

      expect(status).toBe('test.txt - NORMAL mode - Line 2/2, Column 4');
    });

    it('should format status line with modifications', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const modifiedState = { ...state, isModified: true };
      const status = formatStatusLine(modifiedState);

      expect(status).toBe('test.txt [Modified] - NORMAL mode - Line 1/1, Column 1');
    });

    it('should handle empty file', () => {
      const state = createTextEditorState('empty.txt', '');
      const status = formatStatusLine(state);

      expect(status).toBe('empty.txt - NORMAL mode - Line 1/1, Column 1');
    });
  });

  describe('hasUnsavedChanges', () => {
    it('should return true for modified state', () => {
      const state = createTextEditorState('test.txt', 'Content');
      const modifiedState = { ...state, isModified: true };

      expect(hasUnsavedChanges(modifiedState)).toBe(true);
    });

    it('should return false for unmodified state', () => {
      const state = createTextEditorState('test.txt', 'Content');

      expect(hasUnsavedChanges(state)).toBe(false);
    });
  });

  describe('edge cases and comprehensive scenarios', () => {
    it('should handle unicode and emoji characters', () => {
      const state = createTextEditorState('emoji.txt', 'Hello 🐱 World');
      const cursorState = moveCursor(state, { column: 8 }); // After the cat emoji
      const newState = insertTextAtCursor(cursorState, '🎉');

      expect(newState.content).toBe('Hello 🐱🎉 World');
      expect(newState.cursorPosition.column).toBe(10); // After both emojis
    });

    it('should handle very long lines', () => {
      const longLine = 'A'.repeat(1000);
      const state = createTextEditorState('long.txt', longLine);
      const cursorState = moveCursor(state, { column: 500 });
      const newState = insertTextAtCursor(cursorState, 'X');

      expect(newState.content.length).toBe(1001);
      expect(newState.cursorPosition.column).toBe(501);
    });

    it('should handle many lines', () => {
      const manyLines = Array.from({ length: 1000 }, (_, i) => `Line ${i + 1}`).join('\n');
      const state = createTextEditorState('many.txt', manyLines);
      const cursorState = moveCursor(state, { line: 500 });

      expect(cursorState.cursorPosition.line).toBe(500);
      expect(state.lines.length).toBe(1000);
    });

    it('should handle empty lines in content', () => {
      const state = createTextEditorState('test.txt', 'Line1\n\n\nLine4');
      expect(state.lines).toEqual(['Line1', '', '', 'Line4']);

      const cursorState = moveCursor(state, { line: 1 });
      const newState = insertTextAtCursor(cursorState, 'Content');
      expect(newState.content).toBe('Line1\nContent\n\nLine4');
    });

    it('should handle complex editing workflow', () => {
      let state = createTextEditorState('workflow.txt', 'Initial content');

      // Switch to INSERT mode and add text
      state = switchMode(state, 'INSERT');
      state = moveCursor(state, { column: 7 });
      state = insertTextAtCursor(state, ' modified');

      // Switch back to NORMAL mode and move around
      state = switchMode(state, 'NORMAL');
      state = moveCursor(state, { column: 0 });

      // Add new line and switch to INSERT
      const result = handleKeyboardInput(state, { key: 'o' } as KeyboardEvent);
      state = result.state;
      state = insertTextAtCursor(state, 'New line added');

      expect(state.content).toBe('Initial modified content\nNew line added');
      expect(state.mode).toBe('INSERT');
      expect(state.isModified).toBe(true);
    });
  });
});
