import { describe, expect, it } from 'vitest';

import { expandTilde, formatPathWithTilde, getHomeDirectory } from '~/routes/terminal/utils/filesystem';

describe('Tilde Expansion', () => {
  describe('getHomeDirectory', () => {
    it('should return /home/user for default mode', () => {
      const homeDir = getHomeDirectory();
      expect(homeDir).toEqual(['home', 'user']);
    });

    it('should return /home/user for portfolio mode (unified structure)', () => {
      const homeDir = getHomeDirectory();
      expect(homeDir).toEqual(['home', 'user']);
    });

    it('should default to default mode', () => {
      const homeDir = getHomeDirectory();
      expect(homeDir).toEqual(['home', 'user']);
    });
  });

  describe('expandTilde', () => {
    it('should expand ~ to home directory in default mode', () => {
      const expanded = expandTilde('~');
      expect(expanded).toBe('/home/user');
    });

    it('should expand ~ to home directory in portfolio mode (unified structure)', () => {
      const expanded = expandTilde('~');
      expect(expanded).toBe('/home/user');
    });

    it('should expand ~/documents to home/documents in default mode', () => {
      const expanded = expandTilde('~/documents');
      expect(expanded).toBe('/home/user/documents');
    });

    it('should expand ~/projects to home/user/projects in portfolio mode (unified structure)', () => {
      const expanded = expandTilde('~/projects');
      expect(expanded).toBe('/home/user/projects');
    });

    it('should not expand paths that do not start with ~', () => {
      const expanded = expandTilde('/some/path');
      expect(expanded).toBe('/some/path');
    });

    it('should not expand paths with ~ in the middle', () => {
      const expanded = expandTilde('/some/~path');
      expect(expanded).toBe('/some/~path');
    });

    it('should handle nested paths with ~/', () => {
      const expanded = expandTilde('~/documents/projects/app');
      expect(expanded).toBe('/home/user/documents/projects/app');
    });

    it('should default to default mode when no mode specified', () => {
      const expanded = expandTilde('~');
      expect(expanded).toBe('/home/user');
    });
  });

  describe('formatPathWithTilde', () => {
    it('should format home directory as ~ in default mode', () => {
      const formatted = formatPathWithTilde(['home', 'user']);
      expect(formatted).toBe('~');
    });

    it('should format home directory as ~ in portfolio mode (unified structure)', () => {
      const formatted = formatPathWithTilde(['home', 'user']);
      expect(formatted).toBe('~');
    });

    it('should format subdirectory of home with tilde in default mode', () => {
      const formatted = formatPathWithTilde(['home', 'user', 'documents']);
      expect(formatted).toBe('~/documents');
    });

    it('should format subdirectory of home with tilde in portfolio mode (unified structure)', () => {
      const formatted = formatPathWithTilde(['home', 'user', 'projects']);
      expect(formatted).toBe('~/projects');
    });

    it('should format deep nested paths with tilde', () => {
      const formatted = formatPathWithTilde(['home', 'user', 'documents', 'projects', 'app']);
      expect(formatted).toBe('~/documents/projects/app');
    });

    it('should not use tilde for paths outside home directory', () => {
      const formatted = formatPathWithTilde(['etc', 'config']);
      expect(formatted).toBe('/etc/config');
    });

    it('should not use tilde for root directory', () => {
      const formatted = formatPathWithTilde([]);
      expect(formatted).toBe('/');
    });

    it('should handle partial home directory paths correctly', () => {
      const formatted = formatPathWithTilde(['home']);
      expect(formatted).toBe('/home');
    });

    it('should default to default mode when no mode specified', () => {
      const formatted = formatPathWithTilde(['home', 'user']);
      expect(formatted).toBe('~');
    });
  });
});
