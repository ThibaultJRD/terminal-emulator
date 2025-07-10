import { describe, expect, it } from 'vitest';

import { renderMarkdown } from '~/routes/terminal/utils/markdown';

describe('markdown', () => {
  describe('renderMarkdown', () => {
    it('should render plain text', () => {
      const result = renderMarkdown('Hello world');
      expect(result).toEqual([{ text: 'Hello world', type: 'normal' }]);
    });

    it('should render multiple lines', () => {
      const result = renderMarkdown('Line 1\nLine 2\nLine 3');
      expect(result).toEqual([
        { text: 'Line 1', type: 'normal' },
        { text: '\n', type: 'normal' },
        { text: 'Line 2', type: 'normal' },
        { text: '\n', type: 'normal' },
        { text: 'Line 3', type: 'normal' },
      ]);
    });

    it('should render empty lines', () => {
      const result = renderMarkdown('Line 1\n\nLine 3');
      expect(result).toEqual([
        { text: 'Line 1', type: 'normal' },
        { text: '\n', type: 'normal' },
        { text: '', type: 'normal' },
        { text: '\n', type: 'normal' },
        { text: 'Line 3', type: 'normal' },
      ]);
    });

    describe('headers', () => {
      it('should render h1 headers', () => {
        const result = renderMarkdown('# Main Title');
        expect(result).toEqual([
          { text: '# ', type: 'header-symbol' },
          { text: 'Main Title', type: 'header-1' },
        ]);
      });

      it('should render h2 headers', () => {
        const result = renderMarkdown('## Section Title');
        expect(result).toEqual([
          { text: '## ', type: 'header-symbol' },
          { text: 'Section Title', type: 'header-2' },
        ]);
      });

      it('should render h3 headers', () => {
        const result = renderMarkdown('### Subsection Title');
        expect(result).toEqual([
          { text: '### ', type: 'header-symbol' },
          { text: 'Subsection Title', type: 'header-3' },
        ]);
      });

      it('should not render invalid headers', () => {
        const result = renderMarkdown('#Not a header');
        expect(result).toEqual([{ text: '#Not a header', type: 'normal' }]);
      });
    });

    describe('code blocks', () => {
      it('should render code blocks', () => {
        const result = renderMarkdown('```\ncode here\n```');
        expect(result).toEqual([
          { text: '┌── code ──', type: 'code-block-border' },
          { text: '\n', type: 'normal' },
          { text: '│ ', type: 'code-block-border' },
          { text: 'code here', type: 'code-block' },
          { text: '\n', type: 'normal' },
          { text: '└────────────────', type: 'code-block-border' },
        ]);
      });

      it('should render code blocks with language', () => {
        const result = renderMarkdown('```javascript\nconsole.log("hello");\n```');
        expect(result).toEqual([
          { text: '┌── javascript ──', type: 'code-block-border' },
          { text: '\n', type: 'normal' },
          { text: '│ ', type: 'code-block-border' },
          { text: 'console.log("hello");', type: 'code-block' },
          { text: '\n', type: 'normal' },
          { text: '└────────────────', type: 'code-block-border' },
        ]);
      });

      it('should handle multiple code blocks', () => {
        const result = renderMarkdown('```\ncode1\n```\n\n```\ncode2\n```');
        expect(result).toEqual([
          { text: '┌── code ──', type: 'code-block-border' },
          { text: '\n', type: 'normal' },
          { text: '│ ', type: 'code-block-border' },
          { text: 'code1', type: 'code-block' },
          { text: '\n', type: 'normal' },
          { text: '└────────────────', type: 'code-block-border' },
          { text: '\n', type: 'normal' },
          { text: '', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: '┌── code ──', type: 'code-block-border' },
          { text: '\n', type: 'normal' },
          { text: '│ ', type: 'code-block-border' },
          { text: 'code2', type: 'code-block' },
          { text: '\n', type: 'normal' },
          { text: '└────────────────', type: 'code-block-border' },
        ]);
      });

      it('should handle unclosed code blocks', () => {
        const result = renderMarkdown('```\ncode here\nmore code');
        expect(result).toEqual([
          { text: '┌── code ──', type: 'code-block-border' },
          { text: '\n', type: 'normal' },
          { text: '│ ', type: 'code-block-border' },
          { text: 'code here', type: 'code-block' },
          { text: '\n', type: 'normal' },
          { text: '│ ', type: 'code-block-border' },
          { text: 'more code', type: 'code-block' },
        ]);
      });
    });

    describe('horizontal rules', () => {
      it('should render horizontal rules', () => {
        const result = renderMarkdown('---');
        expect(result).toEqual([{ text: '─'.repeat(50), type: 'hr' }]);
      });

      it('should not render invalid horizontal rules', () => {
        const result = renderMarkdown('-- -');
        expect(result).toEqual([{ text: '-- -', type: 'normal' }]);
      });
    });

    describe('blockquotes', () => {
      it('should render blockquotes', () => {
        const result = renderMarkdown('> This is a quote');
        expect(result).toEqual([
          { text: '▌ ', type: 'blockquote-symbol' },
          { text: 'This is a quote', type: 'blockquote' },
        ]);
      });

      it('should handle empty blockquotes', () => {
        const result = renderMarkdown('> ');
        expect(result).toEqual([
          { text: '▌ ', type: 'blockquote-symbol' },
          { text: '', type: 'blockquote' },
        ]);
      });
    });

    describe('lists', () => {
      it('should render bullet lists', () => {
        const result = renderMarkdown('- Item 1\n- Item 2');
        expect(result).toEqual([
          { text: '• ', type: 'list-bullet' },
          { text: 'Item 1', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: '• ', type: 'list-bullet' },
          { text: 'Item 2', type: 'normal' },
        ]);
      });

      it('should render numbered lists', () => {
        const result = renderMarkdown('1. First item\n2. Second item');
        expect(result).toEqual([
          { text: '1. ', type: 'list-number' },
          { text: 'First item', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: '2. ', type: 'list-number' },
          { text: 'Second item', type: 'normal' },
        ]);
      });

      it('should handle lists with inline formatting', () => {
        const result = renderMarkdown('- **Bold** item\n- *Italic* item');
        expect(result).toEqual([
          { text: '• ', type: 'list-bullet' },
          { text: 'Bold', type: 'bold' },
          { text: ' item', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: '• ', type: 'list-bullet' },
          { text: 'Italic', type: 'italic' },
          { text: ' item', type: 'normal' },
        ]);
      });
    });

    describe('inline formatting', () => {
      it('should render bold text', () => {
        const result = renderMarkdown('This is **bold** text');
        expect(result).toEqual([
          { text: 'This is ', type: 'normal' },
          { text: 'bold', type: 'bold' },
          { text: ' text', type: 'normal' },
        ]);
      });

      it('should render italic text', () => {
        const result = renderMarkdown('This is *italic* text');
        expect(result).toEqual([
          { text: 'This is ', type: 'normal' },
          { text: 'italic', type: 'italic' },
          { text: ' text', type: 'normal' },
        ]);
      });

      it('should render inline code', () => {
        const result = renderMarkdown('Use `console.log()` for debugging');
        expect(result).toEqual([
          { text: 'Use ', type: 'normal' },
          { text: 'console.log()', type: 'inline-code' },
          { text: ' for debugging', type: 'normal' },
        ]);
      });

      it('should render multiple inline formats', () => {
        const result = renderMarkdown('**Bold** and *italic* and `code`');
        expect(result).toEqual([
          { text: 'Bold', type: 'bold' },
          { text: ' and ', type: 'normal' },
          { text: 'italic', type: 'italic' },
          { text: ' and ', type: 'normal' },
          { text: 'code', type: 'inline-code' },
        ]);
      });

      it('should handle empty inline formats', () => {
        const result = renderMarkdown('**  ** and *  * and `  `');
        expect(result).toEqual([
          { text: '  ', type: 'bold' },
          { text: ' and ', type: 'normal' },
          { text: '  ', type: 'italic' },
          { text: ' and ', type: 'normal' },
          { text: '  ', type: 'inline-code' },
        ]);
      });
    });

    describe('links', () => {
      it('should render safe HTTP links', () => {
        const result = renderMarkdown('[Example](http://example.com)');
        expect(result).toEqual([{ text: 'Example', type: 'link', url: 'http://example.com' }]);
      });

      it('should render safe HTTPS links', () => {
        const result = renderMarkdown('[Secure Example](https://example.com)');
        expect(result).toEqual([{ text: 'Secure Example', type: 'link', url: 'https://example.com' }]);
      });

      it('should render mailto links', () => {
        const result = renderMarkdown('[Email](mailto:test@example.com)');
        expect(result).toEqual([{ text: 'Email', type: 'link', url: 'mailto:test@example.com' }]);
      });

      it('should render relative links as safe', () => {
        const result = renderMarkdown('[Relative](/path/to/page)');
        expect(result).toEqual([{ text: 'Relative', type: 'link', url: '/path/to/page' }]);
      });

      it('should block javascript: URLs', () => {
        const result = renderMarkdown('[Malicious](javascript:alert("xss"))');
        expect(result).toEqual([
          { text: '[Malicious](javascript:alert("xss")', type: 'normal' },
          { text: ')', type: 'normal' },
        ]);
      });

      it('should block data: URLs', () => {
        const result = renderMarkdown('[Data URL](data:text/html,<script>alert("xss")</script>)');
        expect(result).toEqual([
          { text: '[Data URL](data:text/html,<script>alert("xss")', type: 'normal' },
          { text: '</script>)', type: 'normal' },
        ]);
      });

      it('should block vbscript: URLs', () => {
        const result = renderMarkdown('[VBScript](vbscript:MsgBox("xss"))');
        expect(result).toEqual([
          { text: '[VBScript](vbscript:MsgBox("xss")', type: 'normal' },
          { text: ')', type: 'normal' },
        ]);
      });

      it('should block file: URLs', () => {
        const result = renderMarkdown('[File](file:///etc/passwd)');
        expect(result).toEqual([{ text: '[File](file:///etc/passwd)', type: 'normal' }]);
      });

      it('should handle malformed URLs gracefully', () => {
        const result = renderMarkdown('[Invalid](not-a-url)');
        expect(result).toEqual([{ text: 'Invalid', type: 'link', url: 'not-a-url' }]);
      });

      it('should handle empty URLs', () => {
        const result = renderMarkdown('[Empty]()');
        expect(result).toEqual([{ text: 'Empty', type: 'link', url: '' }]);
      });
    });

    describe('complex combinations', () => {
      it('should handle mixed markdown content', () => {
        const content = `# Title
        
This is **bold** and *italic* text with \`code\`.

- List item 1
- List item 2

> A blockquote with [link](https://example.com)

\`\`\`javascript
console.log("Hello");
\`\`\`

---`;

        const result = renderMarkdown(content);
        expect(result).toContainEqual({ text: '# ', type: 'header-symbol' });
        expect(result).toContainEqual({ text: 'Title', type: 'header-1' });
        expect(result).toContainEqual({ text: 'bold', type: 'bold' });
        expect(result).toContainEqual({ text: 'italic', type: 'italic' });
        expect(result).toContainEqual({ text: 'code', type: 'inline-code' });
        expect(result).toContainEqual({ text: '• ', type: 'list-bullet' });
        expect(result).toContainEqual({ text: '▌ ', type: 'blockquote-symbol' });
        // Just check that it doesn't crash
        expect(result).toBeDefined();
        expect(result).toContainEqual({ text: '┌── javascript ──', type: 'code-block-border' });
        expect(result).toContainEqual({ text: '─'.repeat(50), type: 'hr' });
      });

      it('should handle nested formatting priority', () => {
        const result = renderMarkdown('**Bold with *italic* inside**');
        expect(result).toEqual([{ text: 'Bold with *italic* inside', type: 'bold' }]);
      });

      it('should handle special characters in content', () => {
        const result = renderMarkdown('Text with & < > " \' characters');
        expect(result).toEqual([{ text: 'Text with & < > " \' characters', type: 'normal' }]);
      });
    });

    describe('edge cases', () => {
      it('should handle empty content', () => {
        const result = renderMarkdown('');
        expect(result).toEqual([{ text: '', type: 'normal' }]);
      });

      it('should handle whitespace-only content', () => {
        const result = renderMarkdown('   \n   \n   ');
        expect(result).toEqual([
          { text: '', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: '', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: '', type: 'normal' },
        ]);
      });

      it('should handle malformed markdown gracefully', () => {
        const result = renderMarkdown('**unclosed bold\n*unclosed italic\n`unclosed code');
        expect(result).toEqual([
          { text: '', type: 'italic' },
          { text: 'unclosed bold', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: '*unclosed italic', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: '`unclosed code', type: 'normal' },
        ]);
      });

      it('should handle Unicode characters', () => {
        const result = renderMarkdown('# 测试 🌟\n\nText with émojis: 😀 🚀');
        expect(result).toEqual([
          { text: '# ', type: 'header-symbol' },
          { text: '测试 🌟', type: 'header-1' },
          { text: '\n', type: 'normal' },
          { text: '', type: 'normal' },
          { text: '\n', type: 'normal' },
          { text: 'Text with émojis: 😀 🚀', type: 'normal' },
        ]);
      });
    });
  });
});
