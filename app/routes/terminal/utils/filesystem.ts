import type { FileSystemNode, FileSystemState } from '~/routes/terminal/types/filesystem';
import { type FilesystemMode, getDefaultFilesystem, getFilesystemByMode } from '~/routes/terminal/utils/defaultFilesystems';
import { initializeFilesystem } from '~/routes/terminal/utils/persistence';

// Security constants
const MAX_PATH_DEPTH = 20;
const MAX_SEGMENT_LENGTH = 255;
const FORBIDDEN_CHARS = /[\x00-\x1f\x7f<>:"|?*]/;
const RESERVED_NAMES = new Set([
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9',
]);

/**
 * Validates a path segment for security
 * @param segment - The path segment to validate
 * @returns boolean indicating if the segment is valid
 */
function isValidPathSegment(segment: string): boolean {
  if (!segment || segment.length === 0) return false;
  if (segment.length > MAX_SEGMENT_LENGTH) return false;
  if (FORBIDDEN_CHARS.test(segment)) return false;
  if (RESERVED_NAMES.has(segment.toUpperCase())) return false;
  if (segment.startsWith(' ') || segment.endsWith(' ')) return false;
  if (segment.startsWith('.') && segment.length > 1 && segment !== '.' && segment !== '..') {
    // Allow dotfiles but validate the rest
    return isValidPathSegment(segment.slice(1));
  }
  return true;
}

/**
 * Creates a FileSystemState using the persistence system.
 * This will load from localStorage if available, or create a default filesystem.
 *
 * @param mode - The filesystem mode to use (optional, defaults to environment variable)
 * @returns FileSystemState with either persisted or default data
 */
export function createDefaultFileSystem(mode: FilesystemMode = 'default'): FileSystemState {
  const initialized = initializeFilesystem(mode);

  return {
    root: initialized.filesystem,
    currentPath: initialized.currentPath,
  };
}

/**
 * Creates a fresh FileSystemState using the default filesystem structure.
 * This bypasses persistence and always returns a clean default state.
 *
 * @returns FileSystemState with fresh default data
 */
export function createFreshDefaultFileSystem(): FileSystemState {
  return {
    root: getDefaultFilesystem(),
    currentPath: ['home', 'user'],
  };
}

/**
 * Creates a fresh FileSystemState for the specified mode.
 * This bypasses persistence and always returns a clean state.
 *
 * @param mode - The filesystem mode to create
 * @returns FileSystemState with fresh data for the specified mode
 */
export function createFreshFileSystem(mode: FilesystemMode): FileSystemState {
  const defaultPath = mode === 'portfolio' ? ['about'] : ['home', 'user'];
  return {
    root: getFilesystemByMode(mode),
    currentPath: defaultPath,
  };
}

export function getNodeAtPath(filesystem: FileSystemState, path: string[]): FileSystemNode | null {
  let current = filesystem.root;

  for (const segment of path) {
    if (current.type !== 'directory' || !current.children || !current.children[segment]) {
      return null;
    }
    current = current.children[segment];
  }

  return current;
}

export function getCurrentDirectory(filesystem: FileSystemState): FileSystemNode | null {
  return getNodeAtPath(filesystem, filesystem.currentPath);
}

export function resolvePath(filesystem: FileSystemState, inputPath: string): string[] {
  // Security: Validate input path length
  if (inputPath.length > 1000) {
    throw new Error('Path too long');
  }

  if (inputPath.startsWith('/')) {
    // Absolute path
    const segments = inputPath
      .slice(1)
      .split('/')
      .filter((segment) => segment !== '');

    // Security: Validate each segment
    for (const segment of segments) {
      if (!isValidPathSegment(segment) && segment !== '.' && segment !== '..') {
        throw new Error(`Invalid path segment: ${segment}`);
      }
    }

    return segments;
  } else if (inputPath === '..') {
    // Parent directory
    return filesystem.currentPath.slice(0, -1);
  } else if (inputPath === '.') {
    // Current directory
    return filesystem.currentPath;
  } else {
    // Relative path
    const segments = inputPath.split('/').filter((segment) => segment !== '');
    let newPath = [...filesystem.currentPath];

    for (const segment of segments) {
      if (segment === '..') {
        newPath.pop();
      } else if (segment !== '.') {
        // Security: Validate segment
        if (!isValidPathSegment(segment)) {
          throw new Error(`Invalid path segment: ${segment}`);
        }
        newPath.push(segment);
      }

      // Security: Check path depth
      if (newPath.length > MAX_PATH_DEPTH) {
        throw new Error(`Path too deep (max depth: ${MAX_PATH_DEPTH})`);
      }
    }

    return newPath;
  }
}

export function formatPath(path: string[]): string {
  return path.length === 0 ? '/' : '/' + path.join('/');
}

export function createFile(filesystem: FileSystemState, path: string[], name: string, content: string = ''): boolean {
  const parentNode = getNodeAtPath(filesystem, path);
  if (!parentNode || parentNode.type !== 'directory' || !parentNode.children) {
    return false;
  }

  const now = new Date();
  parentNode.children[name] = {
    name,
    type: 'file',
    content,
    size: content.length,
    createdAt: now,
    modifiedAt: now,
  };

  parentNode.modifiedAt = now;
  return true;
}

export function createDirectory(filesystem: FileSystemState, path: string[], name: string): boolean {
  const parentNode = getNodeAtPath(filesystem, path);
  if (!parentNode || parentNode.type !== 'directory' || !parentNode.children) {
    return false;
  }

  const now = new Date();
  parentNode.children[name] = {
    name,
    type: 'directory',
    children: {},
    createdAt: now,
    modifiedAt: now,
  };

  parentNode.modifiedAt = now;
  return true;
}

export function deleteNode(filesystem: FileSystemState, path: string[], name: string): boolean {
  const parentNode = getNodeAtPath(filesystem, path);
  if (!parentNode || parentNode.type !== 'directory' || !parentNode.children || !parentNode.children[name]) {
    return false;
  }

  delete parentNode.children[name];
  parentNode.modifiedAt = new Date();
  return true;
}
