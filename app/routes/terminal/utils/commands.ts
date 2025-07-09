import type { CommandHandler, CommandResult, FileSystemNode, FileSystemState, OutputSegment } from '~/routes/terminal/types/filesystem';
import { parseCommand } from '~/routes/terminal/utils/commandParser';
import {
  ERROR_MESSAGES,
  createDetailedFileInfo,
  createErrorResult,
  createSimpleFileInfo,
  createSuccessResult,
  filterDirectoryEntries,
  joinOutputSegments,
  sortDirectoryEntries,
} from '~/routes/terminal/utils/commandUtils';
import { FILESYSTEM_MODES, type FilesystemMode, getFilesystemByMode } from '~/routes/terminal/utils/defaultFilesystems';
import { createDirectory, createFile, deleteNode, formatPath, getCurrentDirectory, getNodeAtPath, resolvePath } from '~/routes/terminal/utils/filesystem';
import { renderMarkdown } from '~/routes/terminal/utils/markdown';
import { parseOptions } from '~/routes/terminal/utils/optionParser';
import { getStorageInfo, resetToDefaultFilesystem, saveFilesystemState } from '~/routes/terminal/utils/persistence';

import { unicodeSafeBtoa } from './unicodeBase64';

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const MAX_FILESYSTEM_SIZE = 50 * 1024 * 1024; // 50MB total limit
const MAX_FILES_PER_DIRECTORY = 1000;

/**
 * Calculates the total size of a filesystem node
 * @param node - The filesystem node to calculate size for
 * @returns Size in bytes
 */
function calculateNodeSize(node: FileSystemNode): number {
  if (node.type === 'file') {
    return (node.content || '').length;
  }

  if (node.type === 'directory' && node.children) {
    return Object.values(node.children).reduce((total: number, child) => total + calculateNodeSize(child), 0);
  }

  return 0;
}

/**
 * Validates file content size
 * @param content - The file content to validate
 * @param filename - The filename for error messages
 * @returns Validation result
 */
function validateFileSize(content: string, filename: string): { valid: boolean; error?: string } {
  if (content.length > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File '${filename}' exceeds maximum size limit (${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
    };
  }
  return { valid: true };
}

/**
 * Validates filesystem size limits
 * @param filesystem - The filesystem to validate
 * @returns Validation result
 */
function validateFilesystemSize(filesystem: FileSystemState): { valid: boolean; error?: string } {
  const totalSize = calculateNodeSize(filesystem.root);
  if (totalSize > MAX_FILESYSTEM_SIZE) {
    return {
      valid: false,
      error: `Filesystem exceeds maximum size limit (${MAX_FILESYSTEM_SIZE / (1024 * 1024)}MB)`,
    };
  }
  return { valid: true };
}

export const commands: Record<string, CommandHandler> = {
  cd: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    if (args.length === 0) {
      // Use appropriate home directory based on filesystem mode
      filesystem.currentPath = currentMode === 'portfolio' ? [] : ['home', 'user'];
      return { success: true, output: '' };
    }

    const targetPath = resolvePath(filesystem, args[0], currentMode);
    const targetNode = getNodeAtPath(filesystem, targetPath);

    if (!targetNode) {
      return {
        success: false,
        output: '',
        error: `cd: no such file or directory: ${args[0]}`,
      };
    }

    if (targetNode.type !== 'directory') {
      return {
        success: false,
        output: '',
        error: `cd: not a directory: ${args[0]}`,
      };
    }

    filesystem.currentPath = targetPath;
    return { success: true, output: '' };
  },

  ls: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);
    const showHidden = flags.has('a');
    const showDetails = flags.has('l');
    const pathArg = positionalArgs[0];

    // Resolve target path and get node
    const targetPath = pathArg ? resolvePath(filesystem, pathArg, currentMode) : filesystem.currentPath;
    const targetNode = getNodeAtPath(filesystem, targetPath);

    if (!targetNode) {
      return createErrorResult(`ls: ${ERROR_MESSAGES.FILE_NOT_FOUND(pathArg || formatPath(targetPath))}`);
    }

    // Handle single file case
    if (targetNode.type === 'file') {
      return createSuccessResult(targetNode.name);
    }

    // Handle empty directory
    if (!targetNode.children) {
      return createSuccessResult('');
    }

    // Get, filter, and sort directory entries
    const allEntries = Object.values(targetNode.children);
    const filteredEntries = filterDirectoryEntries(allEntries, showHidden);
    const sortedEntries = sortDirectoryEntries(filteredEntries);

    // Generate output based on format
    if (showDetails) {
      const detailedSegments = sortedEntries.map(createDetailedFileInfo);
      return createSuccessResult(joinOutputSegments(detailedSegments));
    } else {
      const simpleSegments = sortedEntries.map(createSimpleFileInfo);
      return createSuccessResult(joinOutputSegments(simpleSegments, '  '));
    }
  },

  pwd: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    return { success: true, output: formatPath(filesystem.currentPath) };
  },

  touch: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    if (args.length === 0) {
      return createErrorResult(ERROR_MESSAGES.MISSING_OPERAND('touch', 'file'));
    }

    const filepath = args[0];

    // Resolve the path to handle tilde expansion
    const targetPath = resolvePath(filesystem, filepath, currentMode);

    // Extract parent directory path and filename
    const parentPath = targetPath.slice(0, -1);
    const filename = targetPath[targetPath.length - 1];

    // Security: Enhanced filename validation for the actual filename
    if (filename.includes('\\') || filename.includes('\0')) {
      return createErrorResult('touch: invalid filename');
    }

    if (filename.length > 255) {
      return createErrorResult('touch: filename too long');
    }

    const parentDir = getNodeAtPath(filesystem, parentPath);
    if (!parentDir || parentDir.type !== 'directory' || !parentDir.children) {
      return createErrorResult('touch: cannot access parent directory');
    }

    // Security: Check directory file count limit
    if (Object.keys(parentDir.children).length >= MAX_FILES_PER_DIRECTORY) {
      return createErrorResult(`touch: too many files in directory (max ${MAX_FILES_PER_DIRECTORY})`);
    }

    if (parentDir.children[filename]) {
      parentDir.children[filename].modifiedAt = new Date();
      return createSuccessResult('');
    }

    // Security: Check filesystem size before creating file
    const sizeValidation = validateFilesystemSize(filesystem);
    if (!sizeValidation.valid) {
      return createErrorResult(`touch: ${sizeValidation.error}`);
    }

    const success = createFile(filesystem, parentPath, filename, '');
    if (!success) {
      return createErrorResult(`touch: cannot create '${filepath}'`);
    }

    return createSuccessResult('');
  },

  cat: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    if (args.length === 0) {
      return createErrorResult(ERROR_MESSAGES.MISSING_OPERAND('cat', 'file'));
    }

    const filename = args[0];
    const targetPath = resolvePath(filesystem, filename, currentMode);
    const file = getNodeAtPath(filesystem, targetPath);

    if (!file) {
      return createErrorResult(`cat: ${ERROR_MESSAGES.FILE_NOT_FOUND(filename)}`);
    }

    if (file.type === 'directory') {
      return createErrorResult(`cat: ${ERROR_MESSAGES.IS_A_DIRECTORY(filename)}`);
    }

    const content = file.content || '';

    // Check if it's a markdown file
    if (filename.endsWith('.md')) {
      return createSuccessResult(renderMarkdown(content));
    }

    return createSuccessResult(content);
  },

  mkdir: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return createErrorResult(ERROR_MESSAGES.MISSING_OPERAND('mkdir', 'operand'));
    }

    const createParents = flags.has('p');

    for (const dirpath of positionalArgs) {
      const result = createDirectoryPath(filesystem, dirpath, createParents, currentMode);
      if (!result.success) {
        return result;
      }
    }

    return { success: true, output: '' };
  },

  rm: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return { success: false, output: '', error: 'rm: missing operand' };
    }

    const recursive = flags.has('r') || flags.has('R');
    const force = flags.has('f');

    for (const filename of positionalArgs) {
      const result = removeFile(filesystem, filename, recursive, force, currentMode);
      if (!result.success && !force) {
        return result;
      }
    }

    return { success: true, output: '' };
  },

  rmdir: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: '', error: 'rmdir: missing operand' };
    }

    const dirname = args[0];
    const targetPath = resolvePath(filesystem, dirname, currentMode);
    const dir = getNodeAtPath(filesystem, targetPath);

    if (!dir) {
      return {
        success: false,
        output: '',
        error: `rmdir: failed to remove '${dirname}': No such file or directory`,
      };
    }

    if (dir.type === 'file') {
      return {
        success: false,
        output: '',
        error: `rmdir: failed to remove '${dirname}': Not a directory`,
      };
    }

    if (dir.children && Object.keys(dir.children).length > 0) {
      return {
        success: false,
        output: '',
        error: `rmdir: failed to remove '${dirname}': Directory not empty`,
      };
    }

    // Get parent path and clean filename for deletion
    const parentPath = targetPath.slice(0, -1);
    const cleanDirname = targetPath[targetPath.length - 1];

    const success = deleteNode(filesystem, parentPath, cleanDirname);
    if (!success) {
      return {
        success: false,
        output: '',
        error: `rmdir: failed to remove '${dirname}'`,
      };
    }

    return { success: true, output: '' };
  },

  clear: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    return { success: true, output: 'CLEAR' };
  },

  echo: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    const output = args.join(' ');
    return { success: true, output: output + '\n' };
  },

  wc: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: '', error: 'wc: missing operand' };
    }

    let totalLines = 0;
    let totalWords = 0;
    let totalChars = 0;
    const results: string[] = [];

    for (const filename of args) {
      const targetPath = resolvePath(filesystem, filename, currentMode);
      const file = getNodeAtPath(filesystem, targetPath);

      if (!file) {
        return {
          success: false,
          output: '',
          error: `wc: ${filename}: No such file or directory`,
        };
      }

      if (file.type === 'directory') {
        return {
          success: false,
          output: '',
          error: `wc: ${filename}: Is a directory`,
        };
      }

      const content = file.content || '';
      const lines = content.split('\n').length;
      const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
      const chars = content.length;

      totalLines += lines;
      totalWords += words;
      totalChars += chars;

      results.push(`${lines.toString().padStart(8)} ${words.toString().padStart(8)} ${chars.toString().padStart(8)} ${filename}`);
    }

    if (args.length > 1) {
      results.push(`${totalLines.toString().padStart(8)} ${totalWords.toString().padStart(8)} ${totalChars.toString().padStart(8)} total`);
    }

    return { success: true, output: results.join('\n') };
  },

  'reset-fs': (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    // Use the current route's filesystem mode
    const mode = currentMode || 'default';

    // This command needs special handling in the terminal component
    // It will trigger a filesystem reset to default state
    return {
      success: true,
      output: `RESET_FILESYSTEM:${mode}`,
    };
  },

  'storage-info': (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    const info = getStorageInfo();
    const formatSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const output = [
      'Browser Storage Information:',
      `  Total terminal storage: ${formatSize(info.totalSize)}`,
      `  Filesystem data: ${formatSize(info.filesystemSize)}`,
      `  Has backups: ${info.hasBackups ? 'Yes' : 'No'}`,
      info.lastSaved ? `  Last saved: ${new Date(info.lastSaved).toLocaleString()}` : '  Last saved: Never',
      '',
      'Commands:',
      '  reset-fs - Reset filesystem to deployment-configured state',
    ].join('\n');

    return { success: true, output };
  },

  vi: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'vi: missing filename argument',
      };
    }

    const filename = args[0];

    // Check if file exists and get content
    const targetPath = resolvePath(filesystem, filename, currentMode);
    const existingFile = getNodeAtPath(filesystem, targetPath);

    let content = '';
    if (existingFile) {
      if (existingFile.type === 'directory') {
        return {
          success: false,
          output: '',
          error: `vi: ${filename}: Is a directory`,
        };
      }
      content = existingFile.content || '';
    }

    // This command needs special handling in the terminal component
    // It will open the text editor with the file content
    return {
      success: true,
      output: `OPEN_EDITOR:${filename}:${unicodeSafeBtoa(content)}`, // Unicode-safe Base64 encode content
    };
  },

  history: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    // Determine history file path based on filesystem structure
    const homeUser = getNodeAtPath(filesystem, ['home', 'user']);
    const historyPath = homeUser && homeUser.type === 'directory' ? ['home', 'user', '.history'] : ['.history'];

    const historyFile = getNodeAtPath(filesystem, historyPath);

    if (!historyFile || historyFile.type !== 'file' || !historyFile.content) {
      return {
        success: true,
        output: 'No command history available',
      };
    }

    const lines = historyFile.content.split('\n').filter((line) => line.trim() !== '');
    const numberedLines = lines.map((line, index) => `${(index + 1).toString().padStart(4, ' ')}  ${line}`);

    return {
      success: true,
      output: numberedLines.join('\n'),
    };
  },

  help: (args: string[], filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult => {
    const helpText = [
      'Available commands:',
      '',
      'File Operations:',
      '  cd [dir]         - Change directory',
      '  ls [-a] [-l]     - List directory contents (-a: show hidden, -l: long format)',
      '  pwd              - Print working directory',
      '  touch <file>     - Create empty file or update timestamp',
      '  cat <file>       - Display file contents (supports markdown rendering)',
      '  mkdir [-p] <dir> - Create directory (-p: create parent directories)',
      '  rm [-r] [-f] <file> - Remove file (-r: recursive, -f: force)',
      '  rmdir <dir>      - Remove empty directory',
      '',
      'Text Editor:',
      '  vi <file>        - Open file in vi text editor',
      '',
      'Filesystem Management:',
      '  reset-fs         - Reset filesystem to deployment-configured state',
      '  storage-info     - Show browser storage information',
      '',
      'Utilities:',
      '  echo <text>      - Print text to output',
      '  wc <file>        - Count lines, words, and characters in file',
      '  history          - Show command history',
      '  clear            - Clear terminal',
      '  help             - Show this help message',
      '',
      'Options can be combined (e.g., ls -la, rm -rf)',
      '',
      'Redirection:',
      '  command > file   - Write output to file (overwrite)',
      '  command >> file  - Append output to file',
      '  command < file   - Read input from file',
      '  command << delimiter - Heredoc input (simplified)',
      '',
      'Examples:',
      '  echo "Hello World" > greeting.txt',
      '  mkdir -p deep/nested/directory',
      '  rm -rf unwanted_folder',
      '  ls -la > file_list.txt',
      '  wc < example.md',
      '  cat readme.txt >> log.txt',
      '  vi myfile.txt',
      '  reset-fs',
    ].join('\n');

    return { success: true, output: helpText };
  },
};

export function executeCommand(input: string, filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult {
  const parsed = parseCommand(input);
  const { command, args, redirectOutput, redirectInput } = parsed;

  if (!command) {
    return { success: true, output: '' };
  }

  // Handle input redirection
  let finalArgs = args;
  if (redirectInput) {
    const inputResult = handleInputRedirection(redirectInput, filesystem, currentMode);
    if (!inputResult.success) {
      return inputResult;
    }

    if (redirectInput.type === '<<') {
      // Heredoc - for now, simulate with empty input for cat, or pass delimiter for other commands
      if (command === 'cat' && args.length === 0) {
        // For cat with heredoc and no files, simulate stdin input
        return { success: true, output: `Reading input until '${redirectInput.source}'...` };
      }
      finalArgs = [...args];
    } else {
      // File input - validate the file exists and is readable
      const fileContent = getExistingFileContent(filesystem, redirectInput.source, currentMode);
      if (fileContent === '' && !fileExists(filesystem, redirectInput.source, currentMode)) {
        return {
          success: false,
          output: '',
          error: `cannot read from '${redirectInput.source}': No such file or directory`,
        };
      }
      // For file input, replace the filename argument with the actual file content for certain commands
      if (command === 'wc' && args.length === 0) {
        finalArgs = [redirectInput.source];
      }
    }
  }

  const handler = commands[command];
  if (!handler) {
    return {
      success: false,
      output: '',
      error: `${command}: command not found`,
    };
  }

  const result = handler(finalArgs, filesystem, currentMode);

  // Handle output redirection
  if (result.success && redirectOutput) {
    let outputContent = '';

    if (typeof result.output === 'string') {
      outputContent = result.output;
    } else if (Array.isArray(result.output)) {
      // Convert OutputSegment array to string
      outputContent = result.output.map((segment) => segment.text || '').join('');
    }

    const existingContent = redirectOutput.type === '>>' ? getExistingFileContent(filesystem, redirectOutput.filename, currentMode) : '';
    const content =
      redirectOutput.type === '>>' ? existingContent + (existingContent && !existingContent.endsWith('\n') ? '\n' : '') + outputContent : outputContent;

    const writeSuccess = writeToFile(filesystem, redirectOutput.filename, content, currentMode);

    if (writeSuccess) {
      return { success: true, output: '' }; // No output to terminal when redirecting
    } else {
      return {
        success: false,
        output: '',
        error: `cannot write to '${redirectOutput.filename}': Permission denied or invalid path`,
      };
    }
  }

  return result;
}

function handleInputRedirection(redirectInput: { type: '<<' | '<'; source: string }, filesystem: FileSystemState, currentMode?: FilesystemMode): CommandResult {
  if (redirectInput.type === '<<') {
    // Heredoc - simplified implementation that accepts any delimiter
    // In a real implementation, this would start interactive input until the delimiter is found
    return { success: true, output: '' };
  } else {
    // File input - check if file exists
    if (!fileExists(filesystem, redirectInput.source, currentMode)) {
      return {
        success: false,
        output: '',
        error: `cannot read from '${redirectInput.source}': No such file or directory`,
      };
    }
    return { success: true, output: '' };
  }
}

function fileExists(filesystem: FileSystemState, filename: string, currentMode?: FilesystemMode): boolean {
  const targetPath = resolvePath(filesystem, filename, currentMode || 'default');
  const file = getNodeAtPath(filesystem, targetPath);
  return file !== null && file.type === 'file';
}

function getExistingFileContent(filesystem: FileSystemState, filename: string, currentMode?: FilesystemMode): string {
  const targetPath = resolvePath(filesystem, filename, currentMode || 'default');
  const file = getNodeAtPath(filesystem, targetPath);
  if (file && file.type === 'file') {
    return file.content || '';
  }
  return '';
}

function createDirectoryPath(filesystem: FileSystemState, dirpath: string, createParents: boolean, currentMode?: FilesystemMode): CommandResult {
  // Resolve the path first to handle tilde expansion
  const targetPath = resolvePath(filesystem, dirpath, currentMode || 'default');

  // Check if this is a simple directory creation (only one directory to create)
  const parentPath = targetPath.slice(0, -1);
  const dirname = targetPath[targetPath.length - 1];

  // Check if parent directory exists
  const parentDir = getNodeAtPath(filesystem, parentPath);
  if (!parentDir || parentDir.type !== 'directory' || !parentDir.children) {
    if (!createParents) {
      return {
        success: false,
        output: '',
        error: 'mkdir: cannot create directory with path separators (use -p for recursive creation)',
      };
    }
    // Continue to recursive creation logic
  } else {
    // Parent directory exists, this is a simple creation
    if (parentDir.children[dirname]) {
      if (createParents && parentDir.children[dirname].type === 'directory') {
        return { success: true, output: '' }; // -p ignores existing directories
      }
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}': File exists`,
      };
    }

    const success = createDirectory(filesystem, parentPath, dirname);
    if (!success) {
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}'`,
      };
    }

    return { success: true, output: '' };
  }

  // Handle recursive creation when parent directories don't exist
  if (!createParents) {
    return {
      success: false,
      output: '',
      error: 'mkdir: cannot create directory with path separators (use -p for recursive creation)',
    };
  }

  // Create directories recursively
  // Start from root and work our way down to the target path
  let currentPath: string[] = [];

  for (let i = 0; i < targetPath.length; i++) {
    const segment = targetPath[i];
    const parentNode = getNodeAtPath(filesystem, currentPath);

    if (!parentNode || parentNode.type !== 'directory' || !parentNode.children) {
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}': Invalid parent directory`,
      };
    }

    if (!parentNode.children[segment]) {
      const success = createDirectory(filesystem, currentPath, segment);
      if (!success) {
        return {
          success: false,
          output: '',
          error: `mkdir: cannot create directory '${dirpath}'`,
        };
      }
    } else if (parentNode.children[segment].type !== 'directory') {
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}': File exists`,
      };
    }

    currentPath.push(segment);
  }

  return { success: true, output: '' };
}

function removeFile(filesystem: FileSystemState, filename: string, recursive: boolean, force: boolean, currentMode?: FilesystemMode): CommandResult {
  const targetPath = resolvePath(filesystem, filename, currentMode || 'default');
  const file = getNodeAtPath(filesystem, targetPath);

  if (!file) {
    if (force) {
      return { success: true, output: '' }; // Force mode ignores missing files
    }
    return {
      success: false,
      output: '',
      error: `rm: cannot remove '${filename}': No such file or directory`,
    };
  }

  if (file.type === 'directory') {
    if (!recursive) {
      return {
        success: false,
        output: '',
        error: `rm: cannot remove '${filename}': Is a directory`,
      };
    }

    // For recursive removal, remove contents first
    if (file.children && Object.keys(file.children).length > 0) {
      // Save current path and change to the directory being removed
      const originalPath = filesystem.currentPath.slice();
      filesystem.currentPath = targetPath;

      for (const childName of Object.keys(file.children)) {
        const childResult = removeFile(filesystem, childName, true, force, currentMode);
        if (!childResult.success && !force) {
          filesystem.currentPath = originalPath;
          return childResult;
        }
      }

      // Restore original path
      filesystem.currentPath = originalPath;
    }
  }

  // Get parent path and clean filename for deletion
  const parentPath = targetPath.slice(0, -1);
  const cleanFilename = targetPath[targetPath.length - 1];

  const success = deleteNode(filesystem, parentPath, cleanFilename);
  if (!success && !force) {
    return {
      success: false,
      output: '',
      error: `rm: cannot remove '${filename}'`,
    };
  }

  return { success: true, output: '' };
}

function writeToFile(filesystem: FileSystemState, filename: string, content: string, currentMode?: FilesystemMode): boolean {
  // Handle path resolution for the file
  const targetPath = resolvePath(filesystem, filename, currentMode || 'default');
  const existingFile = getNodeAtPath(filesystem, targetPath);

  if (existingFile) {
    if (existingFile.type === 'file') {
      existingFile.content = content;
      existingFile.size = content.length;
      existingFile.modifiedAt = new Date();
      return true;
    }
    return false; // Can't write to directory
  }

  // Create new file - extract directory and filename
  const lastSlashIndex = filename.lastIndexOf('/');
  if (lastSlashIndex === -1) {
    // Simple filename, create in current directory
    return createFile(filesystem, filesystem.currentPath, filename, content);
  } else {
    // Path with directory, create in the specified directory
    const dirPath = filename.substring(0, lastSlashIndex);
    const fileName = filename.substring(lastSlashIndex + 1);
    const targetDirPath = resolvePath(filesystem, dirPath, currentMode || 'default');
    return createFile(filesystem, targetDirPath, fileName, content);
  }
}
