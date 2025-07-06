import { beforeEach, describe, expect, it } from 'vitest';

import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { executeCommand } from '~/routes/terminal/utils/commands';
import { createDefaultFilesystem } from '~/routes/terminal/utils/defaultFilesystems';
import { createFile } from '~/routes/terminal/utils/filesystem';
import { createTextEditorState, insertTextAtCursor, switchMode } from '~/routes/terminal/utils/textEditor';

describe('Unicode and Emoji Support', () => {
  let filesystem: FileSystemState;

  beforeEach(() => {
    filesystem = {
      root: createDefaultFilesystem(),
      currentPath: ['home', 'user'],
    };
  });

  describe('file operations with unicode content', () => {
    it('should handle files with accented characters', () => {
      createFile(filesystem, ['home', 'user'], 'français.txt', 'Bonjour! Ça va? École, café, résumé.');

      const catResult = executeCommand('cat français.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('Bonjour! Ça va? École, café, résumé.');
    });

    it('should handle files with various unicode characters', () => {
      const unicodeContent = 'Greek: αβγδε\nCyrillic: абвгд\nCJK: 你好世界\nArabic: مرحبا\nSymbols: ∀∃∈∉∧∨';
      createFile(filesystem, ['home', 'user'], 'unicode.txt', unicodeContent);

      const catResult = executeCommand('cat unicode.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(unicodeContent);
    });

    it('should handle filenames with unicode characters', () => {
      createFile(filesystem, ['home', 'user'], '测试文件.txt', 'Chinese filename test');
      createFile(filesystem, ['home', 'user'], 'файл.txt', 'Russian filename test');
      createFile(filesystem, ['home', 'user'], 'αρχείο.txt', 'Greek filename test');

      const lsResult = executeCommand('ls', filesystem);
      expect(lsResult.success).toBe(true);

      // Check that unicode filenames appear in listing
      const output = Array.isArray(lsResult.output) ? lsResult.output.map((seg) => seg.text).join('') : lsResult.output;
      expect(output).toContain('测试文件.txt');
      expect(output).toContain('файл.txt');
      expect(output).toContain('αρχείο.txt');
    });

    it('should handle special symbols and mathematical characters', () => {
      const mathContent = '∑(i=1 to n) i = n(n+1)/2\n∫ f(x)dx = F(x) + C\n√2 ≈ 1.414\n∞ > 1000000';
      createFile(filesystem, ['home', 'user'], 'math.txt', mathContent);

      const catResult = executeCommand('cat math.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(mathContent);

      const wcResult = executeCommand('wc math.txt', filesystem);
      expect(wcResult.success).toBe(true);
      expect(wcResult.output).toContain('math.txt');
    });

    it('should handle combining characters correctly', () => {
      // Unicode combining characters (base + combining diacritical marks)
      const combiningContent = 'e\u0301'; // é composed of e + combining acute accent
      createFile(filesystem, ['home', 'user'], 'combining.txt', combiningContent);

      const catResult = executeCommand('cat combining.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(combiningContent);
    });
  });

  describe('emoji handling', () => {
    it('should handle files with emoji content', () => {
      const emojiContent = 'Hello 👋 World 🌍!\nCoding is fun 💻✨\nReact ⚛️ + TypeScript 📘 = 💪';
      createFile(filesystem, ['home', 'user'], 'emojis.txt', emojiContent);

      const catResult = executeCommand('cat emojis.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(emojiContent);
    });

    it('should handle emoji filenames', () => {
      createFile(filesystem, ['home', 'user'], '📝notes.txt', 'Notes file');
      createFile(filesystem, ['home', 'user'], '🚀project.md', 'Project documentation');
      createFile(filesystem, ['home', 'user'], '🎉celebration.txt', 'Party time!');

      const lsResult = executeCommand('ls', filesystem);
      expect(lsResult.success).toBe(true);

      const output = Array.isArray(lsResult.output) ? lsResult.output.map((seg) => seg.text).join('') : lsResult.output;
      expect(output).toContain('📝notes.txt');
      expect(output).toContain('🚀project.md');
      expect(output).toContain('🎉celebration.txt');
    });

    it('should handle complex emoji sequences', () => {
      // Emoji with skin tone modifiers and ZWJ sequences
      const complexEmojis = '👨‍💻 👩‍🎨 👨🏽‍🔬 👩🏻‍🚀 🏴‍☠️ 👨‍👩‍👧‍👦';
      createFile(filesystem, ['home', 'user'], 'complex-emojis.txt', complexEmojis);

      const catResult = executeCommand('cat complex-emojis.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(complexEmojis);
    });

    it('should handle flag emojis', () => {
      const flagContent = '🇺🇸 🇫🇷 🇩🇪 🇯🇵 🇨🇳 🇧🇷 🇮🇳 🇷🇺 🇰🇷 🇮🇹';
      createFile(filesystem, ['home', 'user'], 'flags.txt', flagContent);

      const catResult = executeCommand('cat flags.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(flagContent);
    });
  });

  describe('text editor unicode support', () => {
    it('should handle unicode characters in text editor', () => {
      let editorState = createTextEditorState('unicode-editor.txt', 'Initial: café');

      // Switch to INSERT mode and add unicode text
      editorState = switchMode(editorState, 'INSERT');
      editorState.cursorPosition = { line: 0, column: editorState.lines[0].length };
      editorState = insertTextAtCursor(editorState, '\nGreek: αβγδε\nMath: ∀x∈ℝ, x² ≥ 0');

      expect(editorState.content).toBe('Initial: café\nGreek: αβγδε\nMath: ∀x∈ℝ, x² ≥ 0');
      expect(editorState.lines).toHaveLength(3);
      expect(editorState.lines[1]).toBe('Greek: αβγδε');
      expect(editorState.lines[2]).toBe('Math: ∀x∈ℝ, x² ≥ 0');
    });

    it('should handle emoji insertion in text editor', () => {
      let editorState = createTextEditorState('emoji-editor.txt', '');

      editorState = switchMode(editorState, 'INSERT');
      editorState = insertTextAtCursor(editorState, 'Coding 💻 is fun! 🎉\nReact ⚛️ + TS 📘');

      expect(editorState.content).toBe('Coding 💻 is fun! 🎉\nReact ⚛️ + TS 📘');
      expect(editorState.lines[0]).toContain('💻');
      expect(editorState.lines[0]).toContain('🎉');
      expect(editorState.lines[1]).toContain('⚛️');
      expect(editorState.lines[1]).toContain('📘');
    });

    it('should handle cursor movement through unicode text', () => {
      let editorState = createTextEditorState('unicode-cursor.txt', 'Hello 世界! 🌍');

      // The cursor should move correctly through unicode characters
      expect(editorState.lines[0].length).toBeGreaterThan(10); // Unicode chars may have different lengths

      // Move cursor to end of line
      editorState.cursorPosition = { line: 0, column: editorState.lines[0].length };
      editorState = switchMode(editorState, 'INSERT');
      editorState = insertTextAtCursor(editorState, ' 🚀');

      expect(editorState.content).toBe('Hello 世界! 🌍 🚀');
    });

    it('should handle mixed unicode and ASCII text editing', () => {
      let editorState = createTextEditorState('mixed.txt', 'ASCII text');

      editorState = switchMode(editorState, 'INSERT');
      editorState.cursorPosition = { line: 0, column: 5 }; // After "ASCII"
      editorState = insertTextAtCursor(editorState, ' + Unicode 文字 + 🔤');

      expect(editorState.content).toBe('ASCII + Unicode 文字 + 🔤 text');
    });
  });

  describe('command parsing with unicode', () => {
    it('should parse commands with unicode arguments', () => {
      createFile(filesystem, ['home', 'user'], 'ελληνικά.txt', 'Greek content');

      const result = executeCommand('cat ελληνικά.txt', filesystem);
      expect(result.success).toBe(true);
      expect(result.output).toBe('Greek content');
    });

    it('should handle mkdir with unicode directory names', () => {
      const mkdirResult = executeCommand('mkdir 中文目录', filesystem);
      expect(mkdirResult.success).toBe(true);

      const lsResult = executeCommand('ls', filesystem);
      const output = Array.isArray(lsResult.output) ? lsResult.output.map((seg) => seg.text).join('') : lsResult.output;
      expect(output).toContain('中文目录');
    });

    it('should handle touch with emoji filenames', () => {
      const touchResult = executeCommand('touch 📝note.txt', filesystem);
      expect(touchResult.success).toBe(true);

      const catResult = executeCommand('cat 📝note.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('');
    });

    it('should handle echo with unicode content', () => {
      const echoResult = executeCommand('echo "Hello 世界 🌍"', filesystem);
      expect(echoResult.success).toBe(true);
      expect(echoResult.output).toBe('Hello 世界 🌍');
    });
  });

  describe('redirection with unicode content', () => {
    it('should handle redirecting unicode content to files', () => {
      const echoResult = executeCommand('echo "Unicode: 你好 🌍" > unicode-output.txt', filesystem);
      expect(echoResult.success).toBe(true);

      const catResult = executeCommand('cat unicode-output.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('Unicode: 你好 🌍');
    });

    it('should handle appending unicode content', () => {
      executeCommand('echo "Line 1: 🚀" > append-test.txt', filesystem);
      const appendResult = executeCommand('echo "Line 2: 🌟" >> append-test.txt', filesystem);
      expect(appendResult.success).toBe(true);

      const catResult = executeCommand('cat append-test.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe('Line 1: 🚀Line 2: 🌟');
    });

    it('should handle reading unicode content from files', () => {
      createFile(filesystem, ['home', 'user'], 'unicode-input.txt', 'Content: 测试 🔤');

      const wcResult = executeCommand('wc < unicode-input.txt', filesystem);
      expect(wcResult.success).toBe(true);
    });
  });

  describe('markdown rendering with unicode', () => {
    it('should render markdown with unicode content', () => {
      const markdownContent = `# Unicode Title 📚
      
This is a paragraph with unicode: 你好世界 🌍

## Features ⭐
- Support for 中文 characters
- Emoji rendering 🎉
- Math symbols: ∀x∈ℝ

### Code Example 💻
\`\`\`javascript
const greeting = "Hello 世界!";
console.log(greeting + " 🚀");
\`\`\`

> Blockquote with emojis 💬 and unicode αβγ`;

      createFile(filesystem, ['home', 'user'], 'unicode.md', markdownContent);

      const catResult = executeCommand('cat unicode.md', filesystem);
      expect(catResult.success).toBe(true);

      // Should return rendered markdown (OutputSegment array)
      expect(Array.isArray(catResult.output)).toBe(true);
      if (Array.isArray(catResult.output)) {
        const fullText = catResult.output.map((seg) => seg.text).join('');
        expect(fullText).toContain('你好世界');
        expect(fullText).toContain('🌍');
        expect(fullText).toContain('⭐');
        expect(fullText).toContain('αβγ');
      }
    });
  });

  describe('edge cases and performance', () => {
    it('should handle very long unicode strings', () => {
      const longUnicodeString = '🎉'.repeat(1000) + '你好'.repeat(500) + '∀∃∈'.repeat(333);
      createFile(filesystem, ['home', 'user'], 'long-unicode.txt', longUnicodeString);

      const catResult = executeCommand('cat long-unicode.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(longUnicodeString);
    });

    it('should handle mixed line endings with unicode', () => {
      const mixedContent = 'Line 1: 🌟\r\nLine 2: 你好\nLine 3: αβγ\r\nLine 4: ∀∃';
      createFile(filesystem, ['home', 'user'], 'mixed-endings.txt', mixedContent);

      const catResult = executeCommand('cat mixed-endings.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(mixedContent);
    });

    it('should handle empty unicode strings and null characters', () => {
      const edgeContent = '\u0000\u0001\u0002' + '正常文字' + '\uFEFF'; // BOM + normal text + null chars
      createFile(filesystem, ['home', 'user'], 'edge-unicode.txt', edgeContent);

      const catResult = executeCommand('cat edge-unicode.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(edgeContent);
    });

    it('should handle surrogate pairs correctly', () => {
      // High/low surrogate pairs for characters outside BMP
      const surrogateContent = '𝕳𝖊𝖑𝖑𝖔 𝖂𝖔𝖗𝖑𝖉!'; // Mathematical bold fraktur
      createFile(filesystem, ['home', 'user'], 'surrogates.txt', surrogateContent);

      const catResult = executeCommand('cat surrogates.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(surrogateContent);
    });

    it('should handle right-to-left text correctly', () => {
      const rtlContent = 'English left-to-right text\nעברית מימין לשמאל\nالعربية من اليمين إلى اليسار\nBack to English';
      createFile(filesystem, ['home', 'user'], 'rtl.txt', rtlContent);

      const catResult = executeCommand('cat rtl.txt', filesystem);
      expect(catResult.success).toBe(true);
      expect(catResult.output).toBe(rtlContent);
    });
  });

  describe('autocompletion with unicode', () => {
    beforeEach(() => {
      // Create test files with unicode names
      createFile(filesystem, ['home', 'user'], '测试文件.txt', 'Chinese file');
      createFile(filesystem, ['home', 'user'], 'файл.txt', 'Russian file');
      createFile(filesystem, ['home', 'user'], '🚀rocket.md', 'Emoji file');
    });

    it('should list unicode filenames in tab completion context', () => {
      // This test verifies that unicode filenames exist and can be found
      const lsResult = executeCommand('ls', filesystem);
      expect(lsResult.success).toBe(true);

      const output = Array.isArray(lsResult.output) ? lsResult.output.map((seg) => seg.text).join('') : lsResult.output;

      expect(output).toContain('测试文件.txt');
      expect(output).toContain('файл.txt');
      expect(output).toContain('🚀rocket.md');
    });

    it('should handle cat command with unicode filenames', () => {
      const catChinese = executeCommand('cat 测试文件.txt', filesystem);
      expect(catChinese.success).toBe(true);
      expect(catChinese.output).toBe('Chinese file');

      const catRussian = executeCommand('cat файл.txt', filesystem);
      expect(catRussian.success).toBe(true);
      expect(catRussian.output).toBe('Russian file');

      const catEmoji = executeCommand('cat 🚀rocket.md', filesystem);
      expect(catEmoji.success).toBe(true);
      // Markdown files return array format, regular files return string
      if (Array.isArray(catEmoji.output)) {
        const text = catEmoji.output.map((seg) => seg.text).join('');
        expect(text).toBe('Emoji file');
      } else {
        expect(catEmoji.output).toBe('Emoji file');
      }
    });
  });
});
