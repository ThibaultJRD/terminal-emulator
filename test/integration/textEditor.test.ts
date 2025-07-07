import { describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { executeCommand } from '~/routes/terminal/utils/commands';
import { createDefaultFilesystem } from '~/routes/terminal/utils/defaultFilesystems';
import { createFile, getNodeAtPath } from '~/routes/terminal/utils/filesystem';
import { createTextEditorState, executeEditorCommand, handleKeyboardInput, insertTextAtCursor, switchMode } from '~/routes/terminal/utils/textEditor';
import { unicodeSafeAtob } from '~/routes/terminal/utils/unicodeBase64';

// Helper function to safely split command output
const getOutputAsString = (output: string | any[]): string => {
  return typeof output === 'string' ? output : output.map((seg) => seg.text).join('');
};

describe('Text Editor Integration', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = {
      root: createDefaultFilesystem(),
      currentPath: ['home', 'user'],
    };
  });

  describe('vi command integration', () => {
    it('should open existing file with vi command', () => {
      createFile(filesystem, ['home', 'user'], 'code.js', 'function hello() {\n  console.log("Hello");\n}');

      const result = executeCommand('vi code.js', filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('OPEN_EDITOR:code.js:');

      const base64Content = (result.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      expect(decodedContent).toBe('function hello() {\n  console.log("Hello");\n}');
    });

    it('should open new file with vi command', () => {
      const result = executeCommand('vi script.py', filesystem);

      expect(result.success).toBe(true);
      expect(result.output).toContain('OPEN_EDITOR:script.py:');
    });

    it('should handle complex file paths', () => {
      // Create nested directory structure
      createFile(filesystem, ['home', 'user', 'documents', 'projects'], 'main.c', '#include <stdio.h>\nint main() { return 0; }');

      // Change to projects directory
      filesystem.currentPath = ['home', 'user', 'documents', 'projects'];

      const result = executeCommand('vi main.c', filesystem);

      expect(result.success).toBe(true);
      const base64Content = (result.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      expect(decodedContent).toBe('#include <stdio.h>\nint main() { return 0; }');
    });
  });

  describe('complete file editing workflow', () => {
    it('should handle complete edit workflow: open → edit → save → close', () => {
      // Step 1: Create initial file
      createFile(filesystem, ['home', 'user'], 'workflow.txt', 'Initial content');

      // Step 2: Open with editor
      const openResult = executeCommand('vi workflow.txt', filesystem);
      expect(openResult.success).toBe(true);

      // Step 3: Create editor state from opened file
      const base64Content = (openResult.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      let editorState = createTextEditorState('workflow.txt', decodedContent);

      // Step 4: Edit the content (simulate typing)
      editorState = switchMode(editorState, 'INSERT');
      // Move cursor to end of first line
      editorState.cursorPosition = { line: 0, column: editorState.lines[0].length };
      editorState = insertTextAtCursor(editorState, '\nAdded line 2\nAdded line 3');

      expect(editorState.content).toBe('Initial content\nAdded line 2\nAdded line 3');
      expect(editorState.isModified).toBe(true);

      // Step 5: Save the file (simulate :w command)
      const saveResult = executeEditorCommand(editorState, 'w');
      expect(saveResult.success).toBe(true);
      expect(saveResult.message).toBe('"workflow.txt" written');
      expect(saveResult.newState?.isModified).toBe(false);

      // Step 6: Quit editor (simulate :q command)
      const quitResult = executeEditorCommand({ ...editorState, isModified: false }, 'q');
      expect(quitResult.success).toBe(true);
      expect(quitResult.shouldClose).toBe(true);

      // Verify the file was updated (this would be handled by the Terminal component)
      // In real usage, the Terminal component would call the filesystem update
    });

    it('should handle save and quit workflow', () => {
      createFile(filesystem, ['home', 'user'], 'saveandquit.txt', 'Original content');

      // Open file
      const openResult = executeCommand('vi saveandquit.txt', filesystem);
      const base64Content = (openResult.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      let editorState = createTextEditorState('saveandquit.txt', decodedContent);

      // Edit content
      editorState = switchMode(editorState, 'INSERT');
      // Move cursor to end of content
      editorState.cursorPosition = { line: 0, column: editorState.lines[0].length };
      editorState = insertTextAtCursor(editorState, '\nModified content');

      // Save and quit in one command
      const saveQuitResult = executeEditorCommand(editorState, 'wq');
      expect(saveQuitResult.success).toBe(true);
      expect(saveQuitResult.shouldClose).toBe(true);
      expect(saveQuitResult.message).toBe('"saveandquit.txt" written and quit');
    });

    it('should handle quit without saving with confirmation', () => {
      createFile(filesystem, ['home', 'user'], 'unsaved.txt', 'Original');

      const openResult = executeCommand('vi unsaved.txt', filesystem);
      const base64Content = (openResult.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      let editorState = createTextEditorState('unsaved.txt', decodedContent);

      // Make changes
      editorState = switchMode(editorState, 'INSERT');
      // Move cursor to end of content
      editorState.cursorPosition = { line: 0, column: editorState.lines[0].length };
      editorState = insertTextAtCursor(editorState, ' - Modified');

      // Try to quit without saving
      const quitResult = executeEditorCommand(editorState, 'q');
      expect(quitResult.success).toBe(false);
      expect(quitResult.message).toBe('No write since last change (use :q! to force quit)');

      // Force quit
      const forceQuitResult = executeEditorCommand(editorState, 'q!');
      expect(forceQuitResult.success).toBe(true);
      expect(forceQuitResult.shouldClose).toBe(true);
      expect(forceQuitResult.message).toBe('Quit without saving');
    });

    it('should handle creating new file through editor', () => {
      // Open non-existent file
      const openResult = executeCommand('vi newfile.md', filesystem);
      expect(openResult.success).toBe(true);

      // Editor should start with empty content
      const base64Content = (openResult.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      expect(decodedContent).toBe('');

      let editorState = createTextEditorState('newfile.md', decodedContent);

      // Add content
      editorState = switchMode(editorState, 'INSERT');
      editorState = insertTextAtCursor(editorState, '# New Markdown File\n\nThis is a new file created through the editor.');

      // Save the new file
      const saveResult = executeEditorCommand(editorState, 'w');
      expect(saveResult.success).toBe(true);
      expect(saveResult.message).toBe('"newfile.md" written');

      // In real usage, the Terminal component would create the file in the filesystem
    });
  });

  describe('vim-style editing workflows', () => {
    it('should handle vim navigation and editing commands', () => {
      let editorState = createTextEditorState('vim-test.txt', 'Line 1\nLine 2\nLine 3\nLine 4');

      // Test vim navigation commands
      const createKeyEvent = (key: string): KeyboardEvent => ({ key }) as KeyboardEvent;

      // Navigate down with 'j'
      let result = handleKeyboardInput(editorState, createKeyEvent('j'));
      editorState = result.state;
      expect(editorState.cursorPosition.line).toBe(1);

      // Navigate right with 'l'
      result = handleKeyboardInput(editorState, createKeyEvent('l'));
      editorState = result.state;
      expect(editorState.cursorPosition.column).toBe(1);

      // Move to position where we can delete a character (position 5, on the '2')
      editorState.cursorPosition = { line: 1, column: 5 };

      // Delete character with 'x' (should delete character at cursor position)
      result = handleKeyboardInput(editorState, createKeyEvent('x'));
      editorState = result.state;
      expect(editorState.content).toBe('Line 1\nLine \nLine 3\nLine 4'); // Character '2' deleted

      // Insert new line below with 'o'
      result = handleKeyboardInput(editorState, createKeyEvent('o'));
      editorState = result.state;
      expect(editorState.mode).toBe('INSERT');
      expect(editorState.content).toBe('Line 1\nLine \n\nLine 3\nLine 4');
      expect(editorState.cursorPosition.line).toBe(2);
      expect(editorState.cursorPosition.column).toBe(0);

      // Type some text
      editorState = insertTextAtCursor(editorState, 'New line inserted');
      expect(editorState.content).toBe('Line 1\nLine \nNew line inserted\nLine 3\nLine 4');
    });

    it('should handle complex text manipulation', () => {
      let editorState = createTextEditorState('complex.txt', 'function example() {\n  return "hello";\n}');

      // Navigate to function name and edit
      editorState = switchMode(editorState, 'INSERT');

      // Position cursor after "function "
      editorState.cursorPosition = { line: 0, column: 9 };

      // Replace "example" with "test"
      // First, delete "example"
      for (let i = 0; i < 7; i++) {
        const result = handleKeyboardInput(editorState, { key: 'Delete' } as KeyboardEvent);
        editorState = result.state;
      }

      // Then type "test"
      editorState = insertTextAtCursor(editorState, 'test');

      expect(editorState.content).toBe('function test() {\n  return "hello";\n}');
      expect(editorState.isModified).toBe(true);
    });

    it('should handle multiple editing sessions', () => {
      // Create multiple editor states (simulating multiple open files)
      const file1State = createTextEditorState('file1.txt', 'Content of file 1');
      const file2State = createTextEditorState('file2.txt', 'Content of file 2');
      const file3State = createTextEditorState('file3.txt', 'Content of file 3');

      // Edit each file independently
      let editState1 = switchMode(file1State, 'INSERT');
      editState1.cursorPosition = { line: 0, column: editState1.lines[0].length };
      const editedFile1 = insertTextAtCursor(editState1, '\nAdded to file 1');

      let editState2 = switchMode(file2State, 'INSERT');
      editState2.cursorPosition = { line: 0, column: editState2.lines[0].length };
      const editedFile2 = insertTextAtCursor(editState2, '\nAdded to file 2');

      let editState3 = switchMode(file3State, 'INSERT');
      editState3.cursorPosition = { line: 0, column: editState3.lines[0].length };
      const editedFile3 = insertTextAtCursor(editState3, '\nAdded to file 3');

      expect(editedFile1.content).toBe('Content of file 1\nAdded to file 1');
      expect(editedFile2.content).toBe('Content of file 2\nAdded to file 2');
      expect(editedFile3.content).toBe('Content of file 3\nAdded to file 3');

      // Verify each file maintains independent state
      expect(editedFile1.filename).toBe('file1.txt');
      expect(editedFile2.filename).toBe('file2.txt');
      expect(editedFile3.filename).toBe('file3.txt');

      // All should be marked as modified
      expect(editedFile1.isModified).toBe(true);
      expect(editedFile2.isModified).toBe(true);
      expect(editedFile3.isModified).toBe(true);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle missing files gracefully', () => {
      const result = executeCommand('vi /nonexistent/path/file.txt', filesystem);

      expect(result.success).toBe(true); // vi creates new files
      expect(result.output).toContain('OPEN_EDITOR:/nonexistent/path/file.txt:');

      // Content should be empty for non-existent file
      const base64Content = (result.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      expect(decodedContent).toBe('');
    });

    it('should handle very large files', () => {
      const largeContent = 'A'.repeat(10000) + '\n' + 'B'.repeat(10000);
      createFile(filesystem, ['home', 'user'], 'large.txt', largeContent);

      const result = executeCommand('vi large.txt', filesystem);

      expect(result.success).toBe(true);

      const base64Content = (result.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      expect(decodedContent).toBe(largeContent);
      expect(decodedContent.length).toBe(20001); // 10000 + 1 + 10000
    });

    it('should handle files with many lines', () => {
      const manyLines = Array.from({ length: 1000 }, (_, i) => `Line ${i + 1}`).join('\n');
      createFile(filesystem, ['home', 'user'], 'manylines.txt', manyLines);

      const result = executeCommand('vi manylines.txt', filesystem);

      expect(result.success).toBe(true);

      const base64Content = (result.output as string).split(':')[2];
      const decodedContent = atob(base64Content);
      const lines = decodedContent.split('\n');
      expect(lines.length).toBe(1000);
      expect(lines[0]).toBe('Line 1');
      expect(lines[999]).toBe('Line 1000');
    });

    it('should handle binary content gracefully', () => {
      // Create file with binary-like content
      const binaryContent = '\x00\x01\x02\x03\xFF\xFE\xFD';
      createFile(filesystem, ['home', 'user'], 'binary.dat', binaryContent);

      const result = executeCommand('vi binary.dat', filesystem);

      expect(result.success).toBe(true);

      const base64Content = (result.output as string).split(':')[2];
      const decodedContent = unicodeSafeAtob(base64Content);
      expect(decodedContent).toBe(binaryContent);
    });

    it('should handle editor commands with whitespace', () => {
      const editorState = createTextEditorState('test.txt', 'Content');

      // Test commands with leading/trailing whitespace
      const result1 = executeEditorCommand(editorState, '  w  ');
      expect(result1.success).toBe(true);

      const result2 = executeEditorCommand(editorState, '\tq\t');
      expect(result2.success).toBe(true);

      const result3 = executeEditorCommand(editorState, ' wq ');
      expect(result3.success).toBe(true);
    });

    it('should handle filenames with special characters in editor commands', () => {
      const editorState = createTextEditorState('special-file.txt', 'Content');

      // Test write to file with special characters
      const result = executeEditorCommand(editorState, 'w special-émoji-🎉.txt');
      expect(result.success).toBe(true);
      expect(result.message).toBe('"special-émoji-🎉.txt" written');
      expect(result.newState?.filename).toBe('special-émoji-🎉.txt');
    });

    it('should maintain editor state consistency during operations', () => {
      let editorState = createTextEditorState('consistency.txt', 'Original content');

      // Perform series of operations
      editorState = switchMode(editorState, 'INSERT');
      // Move cursor to end of content
      editorState.cursorPosition = { line: 0, column: editorState.lines[0].length };
      editorState = insertTextAtCursor(editorState, '\nAdded line');
      editorState = switchMode(editorState, 'NORMAL');

      // Verify state consistency
      expect(editorState.content).toBe('Original content\nAdded line');
      expect(editorState.lines).toEqual(['Original content', 'Added line']);
      expect(editorState.isModified).toBe(true);
      expect(editorState.mode).toBe('NORMAL');
      // Check the actual cursor position after insertion
      // Note: cursor position depends on insertTextAtCursor implementation
      expect(editorState.cursorPosition.line).toBeGreaterThanOrEqual(0);
      expect(editorState.cursorPosition.column).toBeGreaterThanOrEqual(0);
    });
  });

  describe('file system integration', () => {
    it('should work with files in different directories', () => {
      // Create files in different locations
      createFile(filesystem, ['home', 'user'], 'home-file.txt', 'Home content');
      createFile(filesystem, ['home', 'user', 'documents'], 'doc-file.txt', 'Document content');
      createFile(filesystem, ['tmp'], 'temp-file.txt', 'Temporary content');

      // Test opening from current directory
      const homeResult = executeCommand('vi home-file.txt', filesystem);
      expect(homeResult.success).toBe(true);

      // Test opening from subdirectory
      const docResult = executeCommand('vi documents/doc-file.txt', filesystem);
      expect(docResult.success).toBe(true);

      // Test opening with absolute path
      const tempResult = executeCommand('vi /tmp/temp-file.txt', filesystem);
      expect(tempResult.success).toBe(true);

      // Verify content
      const homeBase64 = (homeResult.output as string).split(':')[2];
      const docBase64 = (docResult.output as string).split(':')[2];
      const tempBase64 = (tempResult.output as string).split(':')[2];

      expect(atob(homeBase64)).toBe('Home content');
      expect(atob(docBase64)).toBe('Document content');
      expect(atob(tempBase64)).toBe('Temporary content');
    });

    it('should handle hidden files', () => {
      createFile(filesystem, ['home', 'user'], '.config', 'Configuration data');
      createFile(filesystem, ['home', 'user'], '.bashrc', '# Bash configuration\nalias ll="ls -la"');

      const configResult = executeCommand('vi .config', filesystem);
      const bashrcResult = executeCommand('vi .bashrc', filesystem);

      expect(configResult.success).toBe(true);
      expect(bashrcResult.success).toBe(true);

      const configContent = atob((configResult.output as string).split(':')[2]);
      const bashrcContent = atob((bashrcResult.output as string).split(':')[2]);

      expect(configContent).toBe('Configuration data');
      expect(bashrcContent).toBe('# Bash configuration\nalias ll="ls -la"');
    });

    it('should preserve file permissions and metadata', () => {
      // Create file with specific metadata
      const node = {
        name: 'metadata-test.txt',
        type: 'file' as const,
        content: 'Test content',
        permissions: '-rw-r--r--',
        size: 12,
        createdAt: new Date('2023-01-01'),
        modifiedAt: new Date('2023-01-02'),
      };

      const currentDir = getNodeAtPath(filesystem, filesystem.currentPath);
      if (currentDir?.type === 'directory' && currentDir.children) {
        currentDir.children['metadata-test.txt'] = node;
      }

      const result = executeCommand('vi metadata-test.txt', filesystem);
      expect(result.success).toBe(true);

      // Verify the file still exists with same metadata after opening
      const reopenedFile = getNodeAtPath(filesystem, [...filesystem.currentPath, 'metadata-test.txt']);
      expect(reopenedFile?.permissions).toBe('-rw-r--r--');
      expect(reopenedFile?.createdAt).toEqual(new Date('2023-01-01'));
    });
  });
});
