import type { OutputSegment } from '~/routes/terminal/types/filesystem';

export function renderMarkdown(content: string): OutputSegment[] {
  const lines = content.split('\n');
  const result: OutputSegment[] = [];
  let inCodeBlock = false;
  let codeBlockLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (i > 0) {
      result.push({ text: '\n', type: 'normal' });
    }

    // Code block detection
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLanguage = line.slice(3).trim();
        result.push({ text: `┌── ${codeBlockLanguage || 'code'} ──`, type: 'code-block-border' });
        continue;
      } else {
        inCodeBlock = false;
        result.push({ text: '└────────────────', type: 'code-block-border' });
        continue;
      }
    }

    // Inside code block
    if (inCodeBlock) {
      result.push({ text: '│ ', type: 'code-block-border' });
      result.push({ text: line, type: 'code-block' });
      continue;
    }

    // Headers
    if (line.startsWith('# ')) {
      result.push({ text: '# ', type: 'header-symbol' });
      result.push({ text: line.slice(2), type: 'header-1' });
      continue;
    }

    if (line.startsWith('## ')) {
      result.push({ text: '## ', type: 'header-symbol' });
      result.push({ text: line.slice(3), type: 'header-2' });
      continue;
    }

    if (line.startsWith('### ')) {
      result.push({ text: '### ', type: 'header-symbol' });
      result.push({ text: line.slice(4), type: 'header-3' });
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---') {
      result.push({ text: '─'.repeat(50), type: 'hr' });
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      result.push({ text: '▌ ', type: 'blockquote-symbol' });
      result.push({ text: line.slice(2), type: 'blockquote' });
      continue;
    }

    // Lists
    if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+\.\s)(.*)/);
      if (match) {
        result.push({ text: match[1], type: 'list-number' });
        result.push(...parseInlineMarkdown(match[2]));
      }
      continue;
    }

    if (line.startsWith('- ')) {
      result.push({ text: '• ', type: 'list-bullet' });
      result.push(...parseInlineMarkdown(line.slice(2)));
      continue;
    }

    // Regular paragraph with inline formatting
    if (line.trim()) {
      result.push(...parseInlineMarkdown(line));
    } else {
      // Empty line
      result.push({ text: '', type: 'normal' });
    }
  }

  return result;
}

function parseInlineMarkdown(text: string): OutputSegment[] {
  const result: OutputSegment[] = [];
  let current = text;

  while (current.length > 0) {
    // Bold text **text**
    const boldMatch = current.match(/\*\*(.*?)\*\*/);
    if (boldMatch) {
      const before = current.slice(0, boldMatch.index);
      if (before) result.push({ text: before, type: 'normal' });
      result.push({ text: boldMatch[1], type: 'bold' });
      current = current.slice(boldMatch.index! + boldMatch[0].length);
      continue;
    }

    // Italic text *text*
    const italicMatch = current.match(/\*(.*?)\*/);
    if (italicMatch) {
      const before = current.slice(0, italicMatch.index);
      if (before) result.push({ text: before, type: 'normal' });
      result.push({ text: italicMatch[1], type: 'italic' });
      current = current.slice(italicMatch.index! + italicMatch[0].length);
      continue;
    }

    // Inline code `code`
    const codeMatch = current.match(/`(.*?)`/);
    if (codeMatch) {
      const before = current.slice(0, codeMatch.index);
      if (before) result.push({ text: before, type: 'normal' });
      result.push({ text: codeMatch[1], type: 'inline-code' });
      current = current.slice(codeMatch.index! + codeMatch[0].length);
      continue;
    }

    // Links [text](url)
    const linkMatch = current.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const before = current.slice(0, linkMatch.index);
      if (before) result.push({ text: before, type: 'normal' });
      result.push({ text: linkMatch[1], type: 'link' });
      current = current.slice(linkMatch.index! + linkMatch[0].length);
      continue;
    }

    // No more matches, add the rest as normal text
    result.push({ text: current, type: 'normal' });
    break;
  }

  return result;
}
