import type { FileSystemNode, OutputSegment } from '~/routes/terminal/types/filesystem';

/**
 * Formats file size for display
 */
export function formatFileSize(size: number): string {
  return size.toString().padStart(8);
}

/**
 * Formats date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

/**
 * Creates file info line for ls -l command
 */
export function createDetailedFileInfo(node: FileSystemNode): OutputSegment[] {
  const type = node.type === 'directory' ? 'd' : '-';
  const permissions = node.permissions || 'rwxr-xr-x';
  const size = node.size || 0;
  const date = node.modifiedAt ? formatDate(new Date(node.modifiedAt)) : formatDate(new Date());

  return [
    {
      text: `${type}${permissions} ${formatFileSize(size)} ${date} `,
      type: 'normal',
    },
    {
      text: node.name,
      type: node.type,
    },
  ];
}

/**
 * Creates simple file info for basic ls command
 */
export function createSimpleFileInfo(node: FileSystemNode): OutputSegment {
  return {
    text: node.name,
    type: node.type,
  };
}

/**
 * Sorts directory entries (directories first, then alphabetical)
 */
export function sortDirectoryEntries(entries: FileSystemNode[]): FileSystemNode[] {
  return entries.sort((a, b) => {
    if (a.type === 'directory' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Filters directory entries based on hidden file visibility
 */
export function filterDirectoryEntries(entries: FileSystemNode[], showHidden: boolean): FileSystemNode[] {
  return entries.filter((node) => showHidden || !node.name.startsWith('.'));
}

/**
 * Joins output segments with separator
 */
export function joinOutputSegments(segments: (OutputSegment | OutputSegment[])[], separator: string = '\n'): OutputSegment[] {
  const result: OutputSegment[] = [];

  segments.forEach((segment, index) => {
    if (index > 0) {
      result.push({ text: separator, type: 'normal' });
    }

    if (Array.isArray(segment)) {
      result.push(...segment);
    } else {
      result.push(segment);
    }
  });

  return result;
}

/**
 * Common error messages for commands
 */
export const ERROR_MESSAGES = {
  FILE_NOT_FOUND: (path: string) => `cannot access '${path}': No such file or directory`,
  NOT_A_DIRECTORY: (path: string) => `'${path}': Not a directory`,
  IS_A_DIRECTORY: (path: string) => `'${path}': Is a directory`,
  PERMISSION_DENIED: (path: string) => `cannot access '${path}': Permission denied`,
  FILE_EXISTS: (path: string) => `cannot create '${path}': File exists`,
  MISSING_OPERAND: (command: string, operand: string) => `${command}: missing ${operand} operand`,
  INVALID_OPTION: (command: string, option: string) => `${command}: invalid option -- '${option}'`,
} as const;

/**
 * Creates a standardized error result
 */
export function createErrorResult(errorMessage: string): {
  success: false;
  output: '';
  error: string;
} {
  return {
    success: false,
    output: '',
    error: errorMessage,
  };
}

/**
 * Creates a standardized success result
 */
export function createSuccessResult(output: string | OutputSegment[]): {
  success: true;
  output: string | OutputSegment[];
} {
  return {
    success: true,
    output,
  };
}
