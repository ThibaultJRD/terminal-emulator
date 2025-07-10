import { describe, expect, it } from 'vitest';

import { unicodeSafeAtob, unicodeSafeBtoa } from '~/routes/terminal/utils/unicodeBase64';

describe('unicodeBase64', () => {
  describe('unicodeSafeBtoa', () => {
    it('should encode ASCII strings correctly', () => {
      expect(unicodeSafeBtoa('Hello World')).toBe('SGVsbG8gV29ybGQ=');
      expect(unicodeSafeBtoa('test')).toBe('dGVzdA==');
      expect(unicodeSafeBtoa('')).toBe('');
    });

    it('should encode Unicode strings correctly', () => {
      expect(unicodeSafeBtoa('Héllo')).toBe('SMOpbGxv');
      expect(unicodeSafeBtoa('测试')).toBe('5rWL6K+V');
      expect(unicodeSafeBtoa('привет')).toBe('0L/RgNC40LLQtdGC');
    });

    it('should encode emoji correctly', () => {
      expect(unicodeSafeBtoa('😀')).toBe('8J+YgA==');
      expect(unicodeSafeBtoa('🌟')).toBe('8J+Mnw==');
      expect(unicodeSafeBtoa('Hello 👋 World')).toBe('SGVsbG8g8J+RiyBXb3JsZA==');
    });

    it('should handle complex Unicode combinations', () => {
      expect(unicodeSafeBtoa('🧑‍💻')).toBe('8J+nkeKAjfCfkrs=');
      expect(unicodeSafeBtoa('🏳️‍🌈')).toBe('8J+Ps++4j+KAjfCfjIg=');
    });

    it('should handle special characters', () => {
      expect(unicodeSafeBtoa('line1\nline2')).toBe('bGluZTEKbGluZTI=');
      expect(unicodeSafeBtoa('tab\there')).toBe('dGFiCWhlcmU=');
      expect(unicodeSafeBtoa('quote"test')).toBe('cXVvdGUidGVzdA==');
    });

    it('should handle large strings', () => {
      const longString = 'a'.repeat(1000);
      const encoded = unicodeSafeBtoa(longString);
      expect(encoded).toBeDefined();
      expect(encoded.length).toBeGreaterThan(0);
    });
  });

  describe('unicodeSafeAtob', () => {
    it('should decode ASCII strings correctly', () => {
      expect(unicodeSafeAtob('SGVsbG8gV29ybGQ=')).toBe('Hello World');
      expect(unicodeSafeAtob('dGVzdA==')).toBe('test');
      expect(unicodeSafeAtob('')).toBe('');
    });

    it('should decode Unicode strings correctly', () => {
      expect(unicodeSafeAtob('SMOpbGxv')).toBe('Héllo');
      expect(unicodeSafeAtob('5rWL6K+V')).toBe('测试');
      expect(unicodeSafeAtob('0L/RgNC40LLQtdGC')).toBe('привет');
    });

    it('should decode emoji correctly', () => {
      expect(unicodeSafeAtob('8J+YgA==')).toBe('😀');
      expect(unicodeSafeAtob('8J+Mnw==')).toBe('🌟');
      expect(unicodeSafeAtob('SGVsbG8g8J+RiyBXb3JsZA==')).toBe('Hello 👋 World');
    });

    it('should handle complex Unicode combinations', () => {
      expect(unicodeSafeAtob('8J+nkeKAjfCfkrs=')).toBe('🧑‍💻');
      expect(unicodeSafeAtob('8J+Ps++4j+KAjfCfjIg=')).toBe('🏳️‍🌈');
    });

    it('should handle special characters', () => {
      expect(unicodeSafeAtob('bGluZTEKbGluZTI=')).toBe('line1\nline2');
      expect(unicodeSafeAtob('dGFiCWhlcmU=')).toBe('tab\there');
      expect(unicodeSafeAtob('cXVvdGUidGVzdA==')).toBe('quote"test');
    });

    it('should handle large strings', () => {
      const longString = 'a'.repeat(1000);
      const encoded = unicodeSafeBtoa(longString);
      const decoded = unicodeSafeAtob(encoded);
      expect(decoded).toBe(longString);
    });
  });

  describe('round-trip encoding/decoding', () => {
    it('should maintain data integrity for ASCII', () => {
      const testStrings = ['Hello World', 'test123', 'Special chars: !@#$%^&*()', 'Multiple\nlines\nwith\ttabs'];

      testStrings.forEach((str) => {
        const encoded = unicodeSafeBtoa(str);
        const decoded = unicodeSafeAtob(encoded);
        expect(decoded).toBe(str);
      });
    });

    it('should maintain data integrity for Unicode', () => {
      const testStrings = ['Héllo Wörld', '测试中文', 'العربية', 'русский язык', 'Ελληνικά', 'हिन्दी', '日本語', '한국어'];

      testStrings.forEach((str) => {
        const encoded = unicodeSafeBtoa(str);
        const decoded = unicodeSafeAtob(encoded);
        expect(decoded).toBe(str);
      });
    });

    it('should maintain data integrity for emoji', () => {
      const testStrings = ['😀😃😄😁😆😅😂🤣', '🌟⭐✨💫🌠', '🧑‍💻👩‍💻👨‍💻', '🏳️‍🌈🏴‍☠️', '👨‍👩‍👧‍👦👨‍👨‍👦👩‍👩‍👧'];

      testStrings.forEach((str) => {
        const encoded = unicodeSafeBtoa(str);
        const decoded = unicodeSafeAtob(encoded);
        expect(decoded).toBe(str);
      });
    });

    it('should handle mixed content', () => {
      const mixedStrings = [
        'Hello 🌍 World',
        'Code: console.log("Hello 👋");',
        'Mixed: ASCII + Üñíçødé + 🎉',
        'File: /path/to/file 📁 with spaces',
        'Command: git commit -m "Fix bug 🐛"',
      ];

      mixedStrings.forEach((str) => {
        const encoded = unicodeSafeBtoa(str);
        const decoded = unicodeSafeAtob(encoded);
        expect(decoded).toBe(str);
      });
    });
  });

  describe('error handling', () => {
    it('should handle invalid Base64 input gracefully', () => {
      expect(() => unicodeSafeAtob('invalid base64')).toThrow();
      expect(() => unicodeSafeAtob('SGVsbG8=')).not.toThrow();
    });

    it('should handle malformed Base64 strings', () => {
      expect(() => unicodeSafeAtob('SGVsbG8!!!')).toThrow(); // Invalid characters
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(unicodeSafeBtoa('')).toBe('');
      expect(unicodeSafeAtob('')).toBe('');
    });

    it('should handle single characters', () => {
      expect(unicodeSafeAtob(unicodeSafeBtoa('a'))).toBe('a');
      expect(unicodeSafeAtob(unicodeSafeBtoa('🎉'))).toBe('🎉');
      expect(unicodeSafeAtob(unicodeSafeBtoa('ñ'))).toBe('ñ');
    });

    it('should handle whitespace-only strings', () => {
      expect(unicodeSafeAtob(unicodeSafeBtoa(' '))).toBe(' ');
      expect(unicodeSafeAtob(unicodeSafeBtoa('   '))).toBe('   ');
      expect(unicodeSafeAtob(unicodeSafeBtoa('\t\n\r'))).toBe('\t\n\r');
    });
  });
});
