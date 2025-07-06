import type { FileSystemNode, FileSystemState } from '~/routes/terminal/types/filesystem';
import { getDefaultFilesystem, getFilesystemModeFromEnv } from '~/routes/terminal/utils/defaultFilesystems';
import { initializeFilesystem } from '~/routes/terminal/utils/persistence';

/**
 * Creates a FileSystemState using the persistence system.
 * This will load from localStorage if available, or create a default filesystem.
 *
 * @returns FileSystemState with either persisted or default data
 */
export function createDefaultFileSystem(): FileSystemState {
  const initialized = initializeFilesystem(getFilesystemModeFromEnv());

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
  if (inputPath.startsWith('/')) {
    // Absolute path
    return inputPath
      .slice(1)
      .split('/')
      .filter((segment) => segment !== '');
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
        newPath.push(segment);
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
