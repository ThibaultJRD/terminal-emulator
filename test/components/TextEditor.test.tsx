import { describe, expect, it, vi } from 'vitest';

describe('TextEditor Component (Unit Tests)', () => {
  it('should be importable', async () => {
    const { TextEditor } = await import('~/routes/terminal/components/TextEditor');
    expect(TextEditor).toBeDefined();
    expect(typeof TextEditor).toBe('function');
  });

  it('should import text editor utilities', async () => {
    const { createTextEditorState } = await import('~/routes/terminal/utils/textEditor');
    expect(createTextEditorState).toBeDefined();
    expect(typeof createTextEditorState).toBe('function');
  });
});
