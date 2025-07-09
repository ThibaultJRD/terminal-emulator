import { describe, expect, it } from 'vitest';

import { expandTilde, formatPathWithTilde, getHomeDirectory } from '~/routes/terminal/utils/filesystem';

describe('Tilde Expansion', () => {
  describe('getHomeDirectory', () => {
    it('should return /home/user for default mode', () => {
      const homeDir = getHomeDirectory('default');
      expect(homeDir).toEqual(['home', 'user']);
    });

    it('should return /about for portfolio mode', () => {
      const homeDir = getHomeDirectory('portfolio');
      expect(homeDir).toEqual(['about']);
    });

    it('should default to default mode', () => {
      const homeDir = getHomeDirectory();
      expect(homeDir).toEqual(['home', 'user']);
    });
  });

  describe('expandTilde', () => {
    it('should expand ~ to home directory in default mode', () => {
      const expanded = expandTilde('~', 'default');
      expect(expanded).toBe('/home/user');
    });

    it('should expand ~ to home directory in portfolio mode', () => {
      const expanded = expandTilde('~', 'portfolio');
      expect(expanded).toBe('/about');
    });

    it('should expand ~/documents to home/documents in default mode', () => {
      const expanded = expandTilde('~/documents', 'default');
      expect(expanded).toBe('/home/user/documents');
    });

    it('should expand ~/projects to about/projects in portfolio mode', () => {
      const expanded = expandTilde('~/projects', 'portfolio');
      expect(expanded).toBe('/about/projects');
    });

    it('should not expand paths that do not start with ~', () => {
      const expanded = expandTilde('/some/path', 'default');
      expect(expanded).toBe('/some/path');
    });

    it('should not expand paths with ~ in the middle', () => {
      const expanded = expandTilde('/some/~path', 'default');
      expect(expanded).toBe('/some/~path');
    });

    it('should handle nested paths with ~/', () => {
      const expanded = expandTilde('~/documents/projects/app', 'default');
      expect(expanded).toBe('/home/user/documents/projects/app');
    });

    it('should default to default mode when no mode specified', () => {
      const expanded = expandTilde('~');
      expect(expanded).toBe('/home/user');
    });
  });

  describe('formatPathWithTilde', () => {
    it('should format home directory as ~ in default mode', () => {
      const formatted = formatPathWithTilde(['home', 'user'], 'default');
      expect(formatted).toBe('~');
    });

    it('should format home directory as ~ in portfolio mode', () => {
      const formatted = formatPathWithTilde(['about'], 'portfolio');
      expect(formatted).toBe('~');
    });

    it('should format subdirectory of home with tilde in default mode', () => {
      const formatted = formatPathWithTilde(['home', 'user', 'documents'], 'default');
      expect(formatted).toBe('~/documents');
    });

    it('should format subdirectory of home with tilde in portfolio mode', () => {
      const formatted = formatPathWithTilde(['about', 'projects'], 'portfolio');
      expect(formatted).toBe('~/projects');
    });

    it('should format deep nested paths with tilde', () => {
      const formatted = formatPathWithTilde(['home', 'user', 'documents', 'projects', 'app'], 'default');
      expect(formatted).toBe('~/documents/projects/app');
    });

    it('should not use tilde for paths outside home directory', () => {
      const formatted = formatPathWithTilde(['etc', 'config'], 'default');
      expect(formatted).toBe('/etc/config');
    });

    it('should not use tilde for root directory', () => {
      const formatted = formatPathWithTilde([], 'default');
      expect(formatted).toBe('/');
    });

    it('should handle partial home directory paths correctly', () => {
      const formatted = formatPathWithTilde(['home'], 'default');
      expect(formatted).toBe('/home');
    });

    it('should default to default mode when no mode specified', () => {
      const formatted = formatPathWithTilde(['home', 'user']);
      expect(formatted).toBe('~');
    });
  });
});
