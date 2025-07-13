import type { CommandHandler, CommandResult, FileSystemNode, FileSystemState } from '~/routes/terminal/types/filesystem';
import type { OutputSegment } from '~/routes/terminal/types/filesystem';
import type { AliasManager } from '~/routes/terminal/utils/aliasManager';
import { type ChainedCommand, type ParsedCommand, type PipedCommand, parseChainedCommand, parseCommand } from '~/routes/terminal/utils/commandParser';
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
import type { EnvironmentManager } from '~/routes/terminal/utils/environmentManager';
import { parseVariableAssignment } from '~/routes/terminal/utils/environmentManager';
import { createDirectory, createFile, deleteNode, formatPath, getNodeAtPath, resolvePath } from '~/routes/terminal/utils/filesystem';
import { renderMarkdown } from '~/routes/terminal/utils/markdown';
import { parseOptions } from '~/routes/terminal/utils/optionParser';
import { getStorageInfo } from '~/routes/terminal/utils/persistence';
import { ALIAS_NAME_REGEX, ShellParser } from '~/routes/terminal/utils/shellParser';

import { unicodeSafeBtoa } from './unicodeBase64';

// Security constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const MAX_FILESYSTEM_SIZE = 50 * 1024 * 1024; // 50MB total limit
const MAX_FILES_PER_DIRECTORY = 1000;

/**
 * Process input for grep command
 */
function processGrepInput(input: string, regex: RegExp, options: { flags: Record<string, boolean>; remaining: string[] }): CommandResult {
  const lines = input.split('\n');
  let results: string[] = [];
  let totalMatches = 0;
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    const matches = regex.test(line);
    const shouldInclude = options.flags.v ? !matches : matches;

    if (shouldInclude) {
      totalMatches++;

      if (options.flags.c) {
        // Count mode - we'll output the count at the end
        continue;
      }

      let resultLine = line;
      if (options.flags.n) {
        resultLine = `${lineNumber}:${line}`;
      }

      results.push(resultLine);
    }
  }

  if (options.flags.c) {
    return createSuccessResult(totalMatches.toString(), totalMatches > 0 ? 0 : 1);
  }

  if (results.length === 0) {
    return { success: false, output: '', exitCode: 1 };
  }

  return createSuccessResult(results.join('\n'), 0);
}

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
  cd: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    if (args.length === 0) {
      // Use appropriate home directory based on filesystem mode
      filesystem.currentPath = ['home', 'user'];
      return { success: true, output: '', exitCode: 0 };
    }

    const targetPath = resolvePath(filesystem, args[0]);
    const targetNode = getNodeAtPath(filesystem, targetPath);

    if (!targetNode) {
      return {
        success: false,
        output: '',
        error: `cd: no such file or directory: ${args[0]}`,
        exitCode: 1,
      };
    }

    if (targetNode.type !== 'directory') {
      return {
        success: false,
        output: '',
        error: `cd: not a directory: ${args[0]}`,
        exitCode: 1,
      };
    }

    filesystem.currentPath = targetPath;
    return { success: true, output: '', exitCode: 0 };
  },

  ls: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);
    const showHidden = flags.has('a');
    const showDetails = flags.has('l');
    const pathArg = positionalArgs[0];

    // Resolve target path and get node
    const targetPath = pathArg ? resolvePath(filesystem, pathArg) : filesystem.currentPath;
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

  pwd: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    return { success: true, output: formatPath(filesystem.currentPath), exitCode: 0 };
  },

  touch: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return createErrorResult(ERROR_MESSAGES.MISSING_OPERAND('touch', 'file'));
    }

    for (const filepath of positionalArgs) {
      // Resolve the path to handle tilde expansion
      const targetPath = resolvePath(filesystem, filepath);

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
        continue; // Move to next file
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
    }

    return createSuccessResult('');
  },

  cat: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return createErrorResult(ERROR_MESSAGES.MISSING_OPERAND('cat', 'file'));
    }

    const showLineNumbers = flags.has('n');

    // Handle single file for backward compatibility (especially for markdown)
    if (positionalArgs.length === 1 && !showLineNumbers) {
      const filename = positionalArgs[0];
      const targetPath = resolvePath(filesystem, filename);
      const file = getNodeAtPath(filesystem, targetPath);

      if (!file) {
        return createErrorResult(`cat: ${ERROR_MESSAGES.FILE_NOT_FOUND(filename)}`);
      }

      if (file.type === 'directory') {
        return createErrorResult(`cat: ${ERROR_MESSAGES.IS_A_DIRECTORY(filename)}`);
      }

      const content = file.content || '';

      // Check if it's a markdown file - return original renderMarkdown result
      if (filename.endsWith('.md')) {
        return createSuccessResult(renderMarkdown(content));
      }

      return createSuccessResult(content);
    }

    // Handle multiple files or line numbers
    const results: string[] = [];
    let currentLineNumber = 1;

    for (const filename of positionalArgs) {
      const targetPath = resolvePath(filesystem, filename);
      const file = getNodeAtPath(filesystem, targetPath);

      if (!file) {
        return createErrorResult(`cat: ${ERROR_MESSAGES.FILE_NOT_FOUND(filename)}`);
      }

      if (file.type === 'directory') {
        return createErrorResult(`cat: ${ERROR_MESSAGES.IS_A_DIRECTORY(filename)}`);
      }

      let content = file.content || '';

      // For markdown files with multiple files or line numbers, convert to string
      if (filename.endsWith('.md')) {
        const markdownResult = renderMarkdown(content);
        content = Array.isArray(markdownResult) ? markdownResult.map((seg) => seg.text).join('') : markdownResult;
      }

      if (showLineNumbers) {
        const lines = content.split('\n');
        const numberedLines = lines.map((line) => {
          const lineNum = currentLineNumber.toString().padStart(6);
          currentLineNumber++;
          return `${lineNum}\t${line}`;
        });
        results.push(numberedLines.join('\n'));
      } else {
        results.push(content);
      }
    }

    return createSuccessResult(results.join(''));
  },

  mkdir: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return createErrorResult(ERROR_MESSAGES.MISSING_OPERAND('mkdir', 'operand'));
    }

    const createParents = flags.has('p');

    for (const dirpath of positionalArgs) {
      const result = createDirectoryPath(filesystem, dirpath, createParents);
      if (!result.success) {
        return result;
      }
    }

    return { success: true, output: '', exitCode: 0 };
  },

  rm: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return { success: false, output: '', error: 'rm: missing operand', exitCode: 1 };
    }

    const recursive = flags.has('r') || flags.has('R');
    const force = flags.has('f');

    for (const filename of positionalArgs) {
      const result = removeFile(filesystem, filename, recursive, force);
      if (!result.success && !force) {
        return result;
      }
    }

    return { success: true, output: '', exitCode: 0 };
  },

  rmdir: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: '', error: 'rmdir: missing operand', exitCode: 1 };
    }

    const dirname = args[0];
    const targetPath = resolvePath(filesystem, dirname);
    const dir = getNodeAtPath(filesystem, targetPath);

    if (!dir) {
      return {
        success: false,
        output: '',
        error: `rmdir: failed to remove '${dirname}': No such file or directory`,
        exitCode: 1,
      };
    }

    if (dir.type === 'file') {
      return {
        success: false,
        output: '',
        error: `rmdir: failed to remove '${dirname}': Not a directory`,
        exitCode: 1,
      };
    }

    if (dir.children && Object.keys(dir.children).length > 0) {
      return {
        success: false,
        output: '',
        error: `rmdir: failed to remove '${dirname}': Directory not empty`,
        exitCode: 1,
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
        exitCode: 1,
      };
    }

    return { success: true, output: '', exitCode: 0 };
  },

  clear: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    return { success: true, output: 'CLEAR', exitCode: 0 };
  },

  echo: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
    environmentManager?: EnvironmentManager,
  ): CommandResult => {
    let processedArgs: string[];

    if (environmentManager) {
      // Use environment manager for all variable substitution
      processedArgs = args.map((arg) => {
        // Handle special $? variable for exit code
        let substituted = arg.replace(/\$\?/g, String(lastExitCode ?? 0));
        // Then substitute other environment variables
        return environmentManager.substitute(substituted);
      });
    } else {
      // Fallback to original $? handling only
      processedArgs = args.map((arg) => {
        if (arg === '$?') {
          return String(lastExitCode ?? 0);
        }
        return arg.replace(/\$\?/g, String(lastExitCode ?? 0));
      });
    }

    const output = processedArgs.join(' ');
    return { success: true, output: output + '\n', exitCode: 0 };
  },

  date: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const now = new Date();

    // Simple date command implementation
    if (args.length === 0) {
      // Default format: Day Mon DD HH:MM:SS YYYY
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const year = now.getFullYear();

      const dateStr = `${dayName} ${monthName} ${day} ${hours}:${minutes}:${seconds} ${year}`;
      return { success: true, output: dateStr, exitCode: 0 };
    }

    // Handle format option
    if (args[0] && args[0].startsWith('+')) {
      const format = args[0].substring(1);
      let result = format;

      // Simple format substitutions
      result = result.replace(/%Y/g, now.getFullYear().toString());
      result = result.replace(/%m/g, (now.getMonth() + 1).toString().padStart(2, '0'));
      result = result.replace(/%d/g, now.getDate().toString().padStart(2, '0'));
      result = result.replace(/%H/g, now.getHours().toString().padStart(2, '0'));
      result = result.replace(/%M/g, now.getMinutes().toString().padStart(2, '0'));
      result = result.replace(/%S/g, now.getSeconds().toString().padStart(2, '0'));

      return { success: true, output: result, exitCode: 0 };
    }

    return { success: false, output: '', error: 'date: invalid option', exitCode: 1 };
  },

  wc: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return { success: false, output: '', error: 'wc: missing operand', exitCode: 1 };
    }

    const showLines = flags.has('l');
    const showWords = flags.has('w');
    const showChars = flags.has('c');

    // If no flags specified, show all (default behavior)
    const showAll = !showLines && !showWords && !showChars;

    let totalLines = 0;
    let totalWords = 0;
    let totalChars = 0;
    const results: string[] = [];

    for (const filename of positionalArgs) {
      const targetPath = resolvePath(filesystem, filename);
      const file = getNodeAtPath(filesystem, targetPath);

      if (!file) {
        return {
          success: false,
          output: '',
          error: `wc: ${filename}: No such file or directory`,
          exitCode: 1,
        };
      }

      if (file.type === 'directory') {
        return {
          success: false,
          output: '',
          error: `wc: ${filename}: Is a directory`,
          exitCode: 1,
        };
      }

      const content = file.content || '';
      const lines = content.split('\n').length;
      const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
      const chars = content.length;

      totalLines += lines;
      totalWords += words;
      totalChars += chars;

      const outputParts: string[] = [];

      if (showAll || showLines) {
        outputParts.push(lines.toString().padStart(8));
      }
      if (showAll || showWords) {
        outputParts.push(words.toString().padStart(8));
      }
      if (showAll || showChars) {
        outputParts.push(chars.toString().padStart(8));
      }

      outputParts.push(filename);
      results.push(outputParts.join(' '));
    }

    if (positionalArgs.length > 1) {
      const totalParts: string[] = [];

      if (showAll || showLines) {
        totalParts.push(totalLines.toString().padStart(8));
      }
      if (showAll || showWords) {
        totalParts.push(totalWords.toString().padStart(8));
      }
      if (showAll || showChars) {
        totalParts.push(totalChars.toString().padStart(8));
      }

      totalParts.push('total');
      results.push(totalParts.join(' '));
    }

    return { success: true, output: results.join('\n'), exitCode: 0 };
  },

  'reset-fs': (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    // This command needs special handling in the terminal component
    // It will trigger a filesystem reset to default state
    return {
      success: true,
      output: `RESET_FILESYSTEM`,
      exitCode: 0,
    };
  },

  'storage-info': (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
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

    return { success: true, output, exitCode: 0 };
  },

  vi: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'vi: missing filename argument',
        exitCode: 1,
      };
    }

    const filename = args[0];

    // Check if file exists and get content
    const targetPath = resolvePath(filesystem, filename);
    const existingFile = getNodeAtPath(filesystem, targetPath);

    let content = '';
    if (existingFile) {
      if (existingFile.type === 'directory') {
        return {
          success: false,
          output: '',
          error: `vi: ${filename}: Is a directory`,
          exitCode: 1,
        };
      }
      content = existingFile.content || '';
    }

    // This command needs special handling in the terminal component
    // It will open the text editor with the file content
    return {
      success: true,
      output: `OPEN_EDITOR:${filename}:${unicodeSafeBtoa(content)}`, // Unicode-safe Base64 encode content
      exitCode: 0,
    };
  },

  history: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    // Determine history file path based on filesystem structure
    const homeUser = getNodeAtPath(filesystem, ['home', 'user']);
    const historyPath = homeUser && homeUser.type === 'directory' ? ['home', 'user', '.history'] : ['.history'];

    const historyFile = getNodeAtPath(filesystem, historyPath);

    if (!historyFile || historyFile.type !== 'file' || !historyFile.content) {
      return {
        success: true,
        output: 'No command history available',
        exitCode: 0,
      };
    }

    const lines = historyFile.content.split('\n').filter((line) => line.trim() !== '');
    const numberedLines = lines.map((line, index) => `${(index + 1).toString().padStart(4, ' ')}  ${line}`);

    return {
      success: true,
      output: numberedLines.join('\n'),
      exitCode: 0,
    };
  },

  cp: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length < 2) {
      return createErrorResult('cp: missing destination file operand');
    }

    const recursive = flags.has('r') || flags.has('R');
    const force = flags.has('f');
    const interactive = flags.has('i');

    const sources = positionalArgs.slice(0, -1);
    const destination = positionalArgs[positionalArgs.length - 1];

    // Resolve destination path
    const destPath = resolvePath(filesystem, destination);
    const destNode = getNodeAtPath(filesystem, destPath);

    // Handle multiple sources - destination must be a directory
    if (sources.length > 1) {
      if (!destNode || destNode.type !== 'directory') {
        return createErrorResult(`cp: target '${destination}' is not a directory`);
      }

      for (const source of sources) {
        const result = copyFileOrDirectory(filesystem, source, destination, recursive, force, interactive);
        if (!result.success) {
          return result;
        }
      }
      return createSuccessResult('');
    }

    // Single source
    const source = sources[0];
    return copyFileOrDirectory(filesystem, source, destination, recursive, force, interactive);
  },

  mv: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length < 2) {
      return createErrorResult('mv: missing destination file operand');
    }

    const force = flags.has('f');
    const interactive = flags.has('i');
    const noOverwrite = flags.has('n');

    const sources = positionalArgs.slice(0, -1);
    const destination = positionalArgs[positionalArgs.length - 1];

    // Resolve destination path
    const destPath = resolvePath(filesystem, destination);
    const destNode = getNodeAtPath(filesystem, destPath);

    // Handle multiple sources - destination must be a directory
    if (sources.length > 1) {
      if (!destNode || destNode.type !== 'directory') {
        return createErrorResult(`mv: target '${destination}' is not a directory`);
      }

      for (const source of sources) {
        const result = moveFileOrDirectory(filesystem, source, destination, force, interactive, noOverwrite);
        if (!result.success) {
          return result;
        }
      }
      return createSuccessResult('');
    }

    // Single source
    const source = sources[0];
    return moveFileOrDirectory(filesystem, source, destination, force, interactive, noOverwrite);
  },

  alias: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    if (!aliasManager) {
      return createErrorResult('alias: alias manager not available');
    }

    // If no arguments, list all aliases
    if (args.length === 0) {
      const aliases = aliasManager.getAllAliases();
      if (aliases.length === 0) {
        return createSuccessResult('');
      }

      const output = aliases.map((alias) => ShellParser.formatAlias(alias.name, alias.command)).join('\n');
      return createSuccessResult(output);
    }

    // Parse alias definition
    const input = args.join(' ');
    const aliasMatch = input.match(/^([a-zA-Z_.][a-zA-Z0-9_.]*)\s*=\s*(.+)$/);

    if (!aliasMatch) {
      // Show specific alias if just name is provided
      const aliasName = args[0];
      const alias = aliasManager.getAlias(aliasName);
      if (alias) {
        return createSuccessResult(ShellParser.formatAlias(alias.name, alias.command));
      } else {
        return createErrorResult(`alias: ${aliasName}: not found`);
      }
    }

    const [, name, command] = aliasMatch;

    // Remove quotes from command if present
    let cleanCommand = command.trim();
    if ((cleanCommand.startsWith('"') && cleanCommand.endsWith('"')) || (cleanCommand.startsWith("'") && cleanCommand.endsWith("'"))) {
      cleanCommand = cleanCommand.slice(1, -1);
    }

    // Validate alias
    const validation = ShellParser.validateAlias(name, cleanCommand);
    if (!validation.valid) {
      return createErrorResult(`alias: ${validation.error}`);
    }

    // Set alias
    const success = aliasManager.setAlias(name, cleanCommand);
    if (!success) {
      return createErrorResult(`alias: failed to set alias '${name}'`);
    }

    return createSuccessResult('');
  },

  unalias: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    if (!aliasManager) {
      return createErrorResult('unalias: alias manager not available');
    }

    if (args.length === 0) {
      return createErrorResult('unalias: missing operand');
    }

    const { flags, positionalArgs } = parseOptions(args);
    const removeAll = flags.has('a');

    if (removeAll) {
      aliasManager.clearAliases();
      return createSuccessResult('');
    }

    for (const aliasName of positionalArgs) {
      const success = aliasManager.removeAlias(aliasName);
      if (!success) {
        return createErrorResult(`unalias: ${aliasName}: not found`);
      }
    }

    return createSuccessResult('');
  },

  source: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
    environmentManager?: EnvironmentManager,
  ): CommandResult => {
    if (!aliasManager) {
      return createErrorResult('source: alias manager not available');
    }

    if (args.length === 0) {
      return createErrorResult('source: missing operand');
    }

    const filename = args[0];
    const targetPath = resolvePath(filesystem, filename);
    const file = getNodeAtPath(filesystem, targetPath);

    if (!file) {
      return createErrorResult(`source: ${filename}: No such file or directory`);
    }

    if (file.type === 'directory') {
      return createErrorResult(`source: ${filename}: Is a directory`);
    }

    const content = file.content || '';

    // Parse the shell script
    const parseResult = ShellParser.parse(content);

    if (parseResult.errors.length > 0) {
      return createErrorResult(`source: ${filename}: ${parseResult.errors.join(', ')}`);
    }

    // Execute the parsed script
    const executeResult = ShellParser.execute(parseResult, aliasManager, environmentManager);

    if (!executeResult.success) {
      return createErrorResult(`source: ${filename}: ${executeResult.errors.join(', ')}`);
    }

    // Save environment variables after successful sourcing
    if (environmentManager && currentMode && executeResult.appliedExports.length > 0) {
      environmentManager.saveToStorage(currentMode);
    }

    // Generate success message
    const messages: string[] = [];
    if (executeResult.appliedAliases.length > 0) {
      messages.push(`Applied ${executeResult.appliedAliases.length} alias${executeResult.appliedAliases.length === 1 ? '' : 'es'}`);
    }
    if (executeResult.appliedExports.length > 0) {
      messages.push(`Applied ${executeResult.appliedExports.length} export${executeResult.appliedExports.length === 1 ? '' : 's'}`);
    }
    if (parseResult.commandCount > 0) {
      messages.push(`Ignored ${parseResult.commandCount} command${parseResult.commandCount === 1 ? '' : 's'} (commands not executed for security)`);
    }

    return createSuccessResult(messages.length > 0 ? messages.join(', ') : '');
  },

  man: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    if (args.length === 0) {
      return createErrorResult('What manual page do you want?');
    }

    let commandName = args[0];
    let section = '1'; // Default to section 1 (user commands)

    // Handle section specification (e.g., man 1 ls)
    if (args.length > 1 && /^\d+$/.test(args[0])) {
      section = args[0];
      commandName = args[1];
    }

    // Construct the manual page path
    const manPagePath = ['usr', 'share', 'man', `man${section}`, `${commandName}.${section}`];
    const manPage = getNodeAtPath(filesystem, manPagePath);

    if (!manPage || manPage.type !== 'file') {
      return createErrorResult(`No manual entry for ${commandName}`);
    }

    const content = manPage.content || '';
    return createSuccessResult(content);
  },

  help: (args: string[], filesystem: FileSystemState, aliasManager?: AliasManager): CommandResult => {
    const helpText = [
      'Available commands:',
      '',
      'File Operations:',
      '  cd [dir]         - Change directory',
      '  ls [-a] [-l]     - List directory contents (-a: show hidden, -l: long format)',
      '  pwd              - Print working directory',
      '  touch <file>     - Create empty file or update timestamp',
      '  cat <file>       - Display file contents (supports markdown rendering)',
      '  date [+format]   - Display current date and time',
      '  mkdir [-p] <dir> - Create directory (-p: create parent directories)',
      '  rm [-r] [-f] <file> - Remove file (-r: recursive, -f: force)',
      '  rmdir <dir>      - Remove empty directory',
      '  cp [-r] [-f] <src> <dst> - Copy files/directories (-r: recursive, -f: force)',
      '  mv [-f] [-i] <src> <dst> - Move/rename files/directories (-f: force, -i: interactive)',
      '',
      'Text Editor:',
      '  vi <file>        - Open file in vi text editor',
      '',
      'Filesystem Management:',
      '  reset-fs         - Reset filesystem to deployment-configured state',
      '  storage-info     - Show browser storage information',
      '',
      'Aliases and Shell:',
      '  alias [name=cmd] - Create or list command aliases',
      '  unalias [-a] <name> - Remove alias (-a: remove all)',
      '  export [VAR=value] - Create/list environment variables',
      '  unset <VAR>      - Remove environment variables',
      '  source <file>    - Execute shell script and apply aliases',
      '',
      'Text Processing:',
      '  grep [-i] [-v] [-n] [-c] <pattern> [file] - Search for pattern in files',
      '  head [-n] [num] <file> - Show first lines of file (default 10)',
      '  tail [-n] [num] <file> - Show last lines of file (default 10)',
      '  sort [-r] [-n] <file> - Sort lines alphabetically or numerically',
      '  uniq <file>      - Remove consecutive duplicate lines',
      '',
      'Utilities:',
      '  echo <text>      - Print text to output (supports $? for last exit code)',
      '  wc <file>        - Count lines, words, and characters in file',
      '  history          - Show command history',
      '  clear            - Clear terminal',
      '  help             - Show this help message',
      '  man <command>    - Display manual page for command',
      '',
      'Pipes & Command Chaining:',
      '  cmd1 | cmd2      - Pipe output from cmd1 as input to cmd2',
      '  cmd1 && cmd2     - Execute cmd2 only if cmd1 succeeds (exit code 0)',
      '  cmd1 || cmd2     - Execute cmd2 only if cmd1 fails (exit code != 0)',
      '  cmd1 ; cmd2      - Execute cmd2 unconditionally after cmd1',
      '  echo $?          - Display exit code of last command',
      '',
      'Options can be combined (e.g., ls -la, rm -rf, cp -rf)',
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
      '  cp -r src_dir dest_dir',
      '  mv old_file.txt new_file.txt',
      '  ls -la > file_list.txt',
      '  wc < example.md',
      '  cat readme.txt >> log.txt',
      '  vi myfile.txt',
      "  alias ll='ls -l'",
      "  alias work='cd ~/projects && ls'",
      "  alias hello='echo Hello, $1!'",
      '  hello World',
      '  source ~/.bashrc',
      '  reset-fs',
      '  man ls',
      '  mkdir test && echo "Success!" || echo "Failed!"',
      '  ls nonexistent || echo "File not found"',
      '  echo "first"; echo "second"; echo "third"',
      '  echo $?',
      '  ls -la | grep ".txt" | sort',
      '  cat file.txt | grep "pattern" | head -5',
      '  cat data.txt | sort | uniq | wc -l',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      'Made by ThibaultJRD - https://thibault.iusevimbtw.com',
    ].join('\n');

    return { success: true, output: helpText, exitCode: 0 };
  },

  grep: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
  ): CommandResult => {
    if (args.length === 0) {
      return createErrorResult('grep: missing pattern', 2);
    }

    const { flags, positionalArgs } = parseOptions(args);
    let pattern = positionalArgs[0];
    const files = positionalArgs.slice(1);

    if (!pattern) {
      return createErrorResult('grep: missing pattern', 2);
    }

    // Security: Validate pattern to prevent ReDoS attacks
    if (pattern.length > 100) {
      return createErrorResult('grep: pattern too long', 2);
    }

    let regexFlags = '';
    if (flags.has('i')) {
      regexFlags += 'i';
    }

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, regexFlags);
    } catch (error) {
      return createErrorResult(`grep: invalid pattern: ${pattern}`, 2);
    }

    let input = '';

    // If no files specified, return an error - input will be handled by executeSingleCommand
    if (files.length === 0) {
      return createErrorResult('grep: no input provided (use with pipe or specify file)', 1);
    }

    // Process specified files
    for (const filename of files) {
      const targetPath = resolvePath(filesystem, filename);
      const node = getNodeAtPath(filesystem, targetPath);

      if (!node) {
        return createErrorResult(`grep: ${filename}: No such file or directory`, 2);
      }

      if (node.type !== 'file') {
        return createErrorResult(`grep: ${filename}: Is a directory`, 2);
      }

      input += (node.content || '') + '\n';
    }

    return processGrepInput(input.trim(), regex, { flags: Object.fromEntries([...flags].map((flag) => [flag, true])), remaining: [] });
  },

  head: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
  ): CommandResult => {
    if (args.length === 0) {
      return createErrorResult('head: use with pipes or input redirection', 1);
    }

    const { flags, positionalArgs } = parseOptions(args);
    let lineCount = 10;

    // Check for -n flag
    if (flags.has('n') && positionalArgs[0]) {
      const num = parseInt(positionalArgs[0], 10);
      if (!isNaN(num) && num >= 0) {
        lineCount = num;
        positionalArgs.shift(); // Remove the number from positional args
      } else {
        return createErrorResult('head: invalid number of lines', 1);
      }
    }

    const filename = positionalArgs[0];
    if (!filename) {
      return createErrorResult('head: missing file operand', 1);
    }

    const targetPath = resolvePath(filesystem, filename);
    const file = getNodeAtPath(filesystem, targetPath);

    if (!file) {
      return createErrorResult(`head: ${ERROR_MESSAGES.FILE_NOT_FOUND(filename)}`, 1);
    }

    if (file.type === 'directory') {
      return createErrorResult(`head: ${ERROR_MESSAGES.IS_A_DIRECTORY(filename)}`, 1);
    }

    const content = file.content || '';
    const lines = content.split('\n');
    const result = lines.slice(0, lineCount).join('\n');
    return createSuccessResult(result, 0);
  },

  tail: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
  ): CommandResult => {
    if (args.length === 0) {
      return createErrorResult('tail: use with pipes or input redirection', 1);
    }

    const { flags, positionalArgs } = parseOptions(args);
    let lineCount = 10;

    // Check for -n flag
    if (flags.has('n') && positionalArgs[0]) {
      const num = parseInt(positionalArgs[0], 10);
      if (!isNaN(num) && num >= 0) {
        lineCount = num;
        positionalArgs.shift(); // Remove the number from positional args
      } else {
        return createErrorResult('tail: invalid number of lines', 1);
      }
    }

    const filename = positionalArgs[0];
    if (!filename) {
      return createErrorResult('tail: missing file operand', 1);
    }

    const targetPath = resolvePath(filesystem, filename);
    const file = getNodeAtPath(filesystem, targetPath);

    if (!file) {
      return createErrorResult(`tail: ${ERROR_MESSAGES.FILE_NOT_FOUND(filename)}`, 1);
    }

    if (file.type === 'directory') {
      return createErrorResult(`tail: ${ERROR_MESSAGES.IS_A_DIRECTORY(filename)}`, 1);
    }

    const content = file.content || '';
    const lines = content.split('\n');
    const result = lines.slice(-lineCount).join('\n');
    return createSuccessResult(result, 0);
  },

  sort: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
  ): CommandResult => {
    if (args.length === 0) {
      return createErrorResult('sort: use with pipes or input redirection', 1);
    }

    const { flags, positionalArgs } = parseOptions(args);
    const filename = positionalArgs[0];

    if (!filename) {
      return createErrorResult('sort: missing file operand', 1);
    }

    const targetPath = resolvePath(filesystem, filename);
    const file = getNodeAtPath(filesystem, targetPath);

    if (!file) {
      return createErrorResult(`sort: ${ERROR_MESSAGES.FILE_NOT_FOUND(filename)}`, 1);
    }

    if (file.type === 'directory') {
      return createErrorResult(`sort: ${ERROR_MESSAGES.IS_A_DIRECTORY(filename)}`, 1);
    }

    const content = file.content || '';
    const lines = content.split('\n');

    let sortedLines: string[];
    if (flags.has('n')) {
      // Numeric sort
      sortedLines = lines.sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        const valueA = isNaN(numA) ? 0 : numA;
        const valueB = isNaN(numB) ? 0 : numB;
        return valueA - valueB;
      });
    } else {
      // Alphabetical sort
      sortedLines = lines.sort();
    }

    if (flags.has('r')) {
      sortedLines.reverse();
    }

    return createSuccessResult(sortedLines.join('\n'), 0);
  },

  uniq: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
  ): CommandResult => {
    if (args.length === 0) {
      return createErrorResult('uniq: use with pipes or input redirection', 1);
    }

    const filename = args[0];
    const targetPath = resolvePath(filesystem, filename);
    const file = getNodeAtPath(filesystem, targetPath);

    if (!file) {
      return createErrorResult(`uniq: ${ERROR_MESSAGES.FILE_NOT_FOUND(filename)}`, 1);
    }

    if (file.type === 'directory') {
      return createErrorResult(`uniq: ${ERROR_MESSAGES.IS_A_DIRECTORY(filename)}`, 1);
    }

    const content = file.content || '';
    const lines = content.split('\n');
    const uniqueLines: string[] = [];
    let lastLine = '';

    for (const line of lines) {
      if (line !== lastLine) {
        uniqueLines.push(line);
        lastLine = line;
      }
    }

    return createSuccessResult(uniqueLines.join('\n'), 0);
  },

  export: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
    environmentManager?: EnvironmentManager,
  ): CommandResult => {
    if (!environmentManager) {
      return createErrorResult('export: environment manager not available');
    }

    if (args.length === 0) {
      // List all exported variables (same as env)
      const variables = environmentManager.getAll();
      const output = Object.entries(variables)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, value]) => `${name}=${value}`)
        .join('\n');

      return createSuccessResult(output, 0);
    }

    // Process each argument as VAR=value
    for (const arg of args) {
      const assignment = parseVariableAssignment(arg);
      if (!assignment) {
        return createErrorResult(`export: invalid assignment: ${arg}`);
      }

      const success = environmentManager.set(assignment.name, assignment.value);
      if (!success) {
        return createErrorResult(`export: failed to set variable: ${assignment.name}`);
      }
    }

    // Save environment variables to storage after changes
    if (currentMode) {
      environmentManager.saveToStorage(currentMode);
    }

    return createSuccessResult('', 0);
  },

  env: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
    environmentManager?: EnvironmentManager,
  ): CommandResult => {
    if (!environmentManager) {
      return createErrorResult('env: environment manager not available');
    }

    if (args.length > 0) {
      return createErrorResult('env: command arguments not supported yet');
    }

    const variables = environmentManager.getAll();
    const output = Object.entries(variables)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => `${name}=${value}`)
      .join('\n');

    return createSuccessResult(output, 0);
  },

  unset: (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
    environmentManager?: EnvironmentManager,
  ): CommandResult => {
    if (!environmentManager) {
      return createErrorResult('unset: environment manager not available');
    }

    if (args.length === 0) {
      return createErrorResult('unset: missing variable name');
    }

    for (const varName of args) {
      if (!varName) {
        continue;
      }

      const success = environmentManager.unset(varName);
      if (!success) {
        return createErrorResult(`unset: cannot unset ${varName}: invalid name or reserved variable`);
      }
    }

    // Save environment variables to storage after changes
    if (currentMode) {
      environmentManager.saveToStorage(currentMode);
    }

    return createSuccessResult('', 0);
  },
};

export function executeCommand(
  input: string,
  filesystem: FileSystemState,
  aliasManager?: AliasManager,
  lastExitCode?: number,
  environmentManager?: EnvironmentManager,
): CommandResult {
  const parsed = parseChainedCommand(input, environmentManager);

  // Handle chained commands or piped commands
  if ('commands' in parsed) {
    // Check if it's a PipedCommand (has only | operators)
    if ('operators' in parsed && parsed.operators.length > 0) {
      const hasOnlyPipes = parsed.operators.every((op) => op === '|');
      if (hasOnlyPipes) {
        return executePipedCommand(parsed as PipedCommand, filesystem, aliasManager, lastExitCode, environmentManager);
      }
    }
    // Otherwise it's a ChainedCommand
    return executeChainedCommand(parsed as ChainedCommand, filesystem, aliasManager, lastExitCode, environmentManager);
  }

  // Handle single command
  return executeSingleCommand(parsed, filesystem, aliasManager, lastExitCode, environmentManager);
}

function executePipedCommand(
  pipedCommand: PipedCommand,
  filesystem: FileSystemState,
  aliasManager?: AliasManager,
  lastExitCode?: number,
  environmentManager?: EnvironmentManager,
): CommandResult {
  const { commands } = pipedCommand;

  if (commands.length === 0) {
    return { success: false, output: '', error: 'No commands in pipe', exitCode: 1 };
  }

  // Start with the first command
  let currentInput = '';
  let lastResult: CommandResult = { success: true, output: '', exitCode: 0 };

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];

    // For commands after the first, we need to pass the previous output as input
    if (i > 0) {
      // Convert previous output to string for piping
      const previousOutput =
        typeof lastResult.output === 'string'
          ? lastResult.output
          : Array.isArray(lastResult.output)
            ? lastResult.output.map((segment) => segment.text || '').join('')
            : '';

      // Create a modified command that accepts piped input
      const modifiedCommand = { ...command };

      // If the command doesn't have input redirection, add piped input
      if (!modifiedCommand.redirectInput) {
        modifiedCommand.redirectInput = {
          type: '<<',
          source: previousOutput,
        };
      }

      lastResult = executeSingleCommand(modifiedCommand, filesystem, aliasManager, lastResult.exitCode, environmentManager);
    } else {
      // Execute first command normally
      lastResult = executeSingleCommand(command, filesystem, aliasManager, lastExitCode, environmentManager);
    }

    // If any command in the pipe fails, stop execution
    if (!lastResult.success) {
      break;
    }
  }

  return lastResult;
}

// Helper function to convert OutputSegment[] to string for backward compatibility
function outputSegmentsToString(segments: OutputSegment[]): string {
  return segments.map((segment) => segment.text).join('');
}

function executeChainedCommand(
  chainedCommand: ChainedCommand,
  filesystem: FileSystemState,
  aliasManager?: AliasManager,
  lastExitCode?: number,
  environmentManager?: EnvironmentManager,
): CommandResult {
  const { commands, operators } = chainedCommand;
  let lastResult: CommandResult = { success: true, output: '', exitCode: 0 };
  let combinedOutput: OutputSegment[] = [];

  for (let i = 0; i < commands.length; i++) {
    const command = commands[i];
    const operator = i > 0 ? operators[i - 1] : null;

    // Check if we should execute this command based on the operator
    if (operator === '&&' && lastResult.exitCode !== 0) {
      // && operator: only execute if previous command succeeded
      break;
    } else if (operator === '||' && lastResult.exitCode === 0) {
      // || operator: only execute if previous command failed
      break;
    }
    // ; operator: always execute (no condition to check)

    // Execute the command
    const result = executeSingleCommand(command, filesystem, aliasManager, lastResult.exitCode, environmentManager);

    // Add output to combined output
    if (result.output) {
      if (typeof result.output === 'string') {
        combinedOutput.push({ text: result.output });
      } else if (Array.isArray(result.output)) {
        combinedOutput.push(...result.output);
      }
    }

    // Update last result for next iteration
    lastResult = result;
  }

  return {
    success: lastResult.success,
    output: combinedOutput.length > 0 ? combinedOutput : '',
    error: lastResult.error,
    exitCode: lastResult.exitCode,
  };
}

function handleStdinCommand(
  command: string,
  args: string[],
  inputData: string,
  filesystem: FileSystemState,
  aliasManager?: AliasManager,
  lastExitCode?: number,
  environmentManager?: EnvironmentManager,
): CommandResult {
  switch (command) {
    case 'grep': {
      if (args.length === 0) {
        return createErrorResult('grep: missing pattern', 2);
      }

      const { flags, positionalArgs } = parseOptions(args);
      const pattern = positionalArgs[0];

      if (!pattern) {
        return createErrorResult('grep: missing pattern', 2);
      }

      // Security: Validate pattern to prevent ReDoS attacks
      if (pattern.length > 100) {
        return createErrorResult('grep: pattern too long', 2);
      }

      let regexFlags = '';
      if (flags.has('i')) {
        regexFlags += 'i';
      }

      let regex: RegExp;
      try {
        regex = new RegExp(pattern, regexFlags);
      } catch (error) {
        return createErrorResult(`grep: invalid pattern: ${pattern}`, 2);
      }

      return processGrepInput(inputData, regex, { flags: Object.fromEntries([...flags].map((flag) => [flag, true])), remaining: [] });
    }

    case 'head': {
      const { flags, positionalArgs } = parseOptions(args);
      let lineCount = 10;

      // Check for -n flag
      if (flags.has('n') && positionalArgs[0]) {
        lineCount = parseInt(positionalArgs[0], 10);
      } else {
        // Check for shorthand like -5, -10, etc.
        for (const flag of flags) {
          const num = parseInt(flag, 10);
          if (!isNaN(num) && num > 0) {
            lineCount = num;
            break;
          }
        }
      }

      if (isNaN(lineCount) || lineCount < 0) {
        return createErrorResult('head: invalid number of lines', 1);
      }

      const lines = inputData.split('\n');
      const result = lines.slice(0, lineCount).join('\n');
      return createSuccessResult(result, 0);
    }

    case 'tail': {
      const { flags, positionalArgs } = parseOptions(args);
      let lineCount = 10;

      // Check for -n flag
      if (flags.has('n') && positionalArgs[0]) {
        lineCount = parseInt(positionalArgs[0], 10);
      } else {
        // Check for shorthand like -5, -10, etc.
        for (const flag of flags) {
          const num = parseInt(flag, 10);
          if (!isNaN(num) && num > 0) {
            lineCount = num;
            break;
          }
        }
      }

      if (isNaN(lineCount) || lineCount < 0) {
        return createErrorResult('tail: invalid number of lines', 1);
      }

      const lines = inputData.split('\n');
      const result = lines.slice(-lineCount).join('\n');
      return createSuccessResult(result, 0);
    }

    case 'sort': {
      const { flags } = parseOptions(args);
      const lines = inputData.split('\n');

      let sortedLines: string[];
      if (flags.has('n')) {
        // Numeric sort
        sortedLines = lines.sort((a, b) => {
          const numA = parseFloat(a);
          const numB = parseFloat(b);
          const valueA = isNaN(numA) ? 0 : numA;
          const valueB = isNaN(numB) ? 0 : numB;
          return valueA - valueB;
        });
      } else {
        // Alphabetical sort
        sortedLines = lines.sort();
      }

      if (flags.has('r')) {
        sortedLines.reverse();
      }

      return createSuccessResult(sortedLines.join('\n'), 0);
    }

    case 'uniq': {
      const lines = inputData.split('\n');
      const uniqueLines: string[] = [];
      let lastLine = '';

      for (const line of lines) {
        if (line !== lastLine) {
          uniqueLines.push(line);
          lastLine = line;
        }
      }

      return createSuccessResult(uniqueLines.join('\n'), 0);
    }

    case 'cat': {
      // For cat with here document, output the input data directly
      // This allows cat << EOF > file.txt to work properly
      return createSuccessResult(inputData, 0);
    }

    default:
      return createErrorResult(`${command}: command not supported for stdin`, 1);
  }
}

function executeSingleCommand(
  parsed: ParsedCommand,
  filesystem: FileSystemState,
  aliasManager?: AliasManager,
  lastExitCode?: number,
  environmentManager?: EnvironmentManager,
): CommandResult {
  let { command, args, redirectOutput, redirectInput } = parsed;

  if (!command) {
    return { success: true, output: '', exitCode: 0 };
  }

  // Resolve aliases if alias manager is available
  if (aliasManager && aliasManager.hasAlias(command)) {
    const resolvedCommand = aliasManager.resolveAlias(command, args);
    if (resolvedCommand) {
      // Check if the resolved command contains chaining operators
      const chainRegex = /(\|\||&&|;)/;
      if (chainRegex.test(resolvedCommand)) {
        // Re-parse the resolved command to handle chaining
        const reparsed = parseChainedCommand(resolvedCommand, environmentManager);

        // Check if it's a command with operators (ChainedCommand or PipedCommand)
        if ('operators' in reparsed && reparsed.operators.length > 0) {
          // Check if it's only pipes
          const hasOnlyPipes = reparsed.operators.every((op) => op === '|');
          if (hasOnlyPipes) {
            return executePipedCommand(reparsed as PipedCommand, filesystem, aliasManager, lastExitCode, environmentManager);
          }
          // Otherwise it's a ChainedCommand
          return executeChainedCommand(reparsed as ChainedCommand, filesystem, aliasManager, lastExitCode, environmentManager);
        }

        // If it's still a single command after parsing, continue with normal execution
        const resolvedParsed = reparsed as ParsedCommand;
        command = resolvedParsed.command;
        args = resolvedParsed.args;
        if (!redirectOutput && resolvedParsed.redirectOutput) {
          redirectOutput = resolvedParsed.redirectOutput;
        }
        if (!redirectInput && resolvedParsed.redirectInput) {
          redirectInput = resolvedParsed.redirectInput;
        }
      } else {
        // Parse the resolved command normally (no chaining)
        const resolvedParsed = parseCommand(resolvedCommand);
        command = resolvedParsed.command;
        args = resolvedParsed.args;
        // Note: We don't override redirections from the original command
        if (!redirectOutput && resolvedParsed.redirectOutput) {
          redirectOutput = resolvedParsed.redirectOutput;
        }
        if (!redirectInput && resolvedParsed.redirectInput) {
          redirectInput = resolvedParsed.redirectInput;
        }
      }
    }
  }

  // Handle input redirection
  let finalArgs = args;
  if (redirectInput) {
    const inputResult = handleInputRedirection(redirectInput, filesystem);
    if (!inputResult.success) {
      return { ...inputResult, exitCode: 1 };
    }

    if (redirectInput.type === '<<') {
      // Heredoc - treat the source as the delimiter for multiline input
      finalArgs = [...args];
    } else {
      // File input - validate the file exists and is readable
      const fileContent = getExistingFileContent(filesystem, redirectInput.source);
      if (fileContent === '' && !fileExists(filesystem, redirectInput.source)) {
        return {
          success: false,
          output: '',
          error: `cannot read from '${redirectInput.source}': No such file or directory`,
          exitCode: 1,
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
      exitCode: 127,
    };
  }

  // Special handling for commands that can process stdin input
  let result: CommandResult;
  if (
    redirectInput &&
    redirectInput.type === '<<' &&
    (command === 'cat' || command === 'grep' || command === 'sort' || command === 'head' || command === 'tail' || command === 'uniq')
  ) {
    // Handle commands that can process piped input
    const inputData = redirectInput.source;
    result = handleStdinCommand(command, finalArgs, inputData, filesystem, aliasManager, lastExitCode, environmentManager);
  } else {
    result = handler(finalArgs, filesystem, aliasManager, undefined, lastExitCode, environmentManager);
  }

  // Handle output redirection
  if (result.success && redirectOutput) {
    let outputContent = '';

    if (typeof result.output === 'string') {
      outputContent = result.output;
    } else if (Array.isArray(result.output)) {
      // Convert OutputSegment array to string
      outputContent = result.output.map((segment) => segment.text || '').join('');
    }

    const existingContent = redirectOutput.type === '>>' ? getExistingFileContent(filesystem, redirectOutput.filename) : '';
    const content =
      redirectOutput.type === '>>' ? existingContent + (existingContent && !existingContent.endsWith('\n') ? '\n' : '') + outputContent : outputContent;

    const writeSuccess = writeToFile(filesystem, redirectOutput.filename, content);

    if (writeSuccess) {
      return { success: true, output: '', exitCode: 0 }; // No output to terminal when redirecting
    } else {
      return {
        success: false,
        output: '',
        error: `cannot write to '${redirectOutput.filename}': Permission denied or invalid path`,
        exitCode: 1,
      };
    }
  }

  return result;
}

function handleInputRedirection(redirectInput: { type: '<<' | '<'; source: string }, filesystem: FileSystemState): CommandResult {
  if (redirectInput.type === '<<') {
    // Heredoc - simplified implementation that accepts any delimiter
    // In a real implementation, this would start interactive input until the delimiter is found
    return { success: true, output: '', exitCode: 0 };
  } else {
    // File input - check if file exists
    if (!fileExists(filesystem, redirectInput.source)) {
      return {
        success: false,
        output: '',
        error: `cannot read from '${redirectInput.source}': No such file or directory`,
        exitCode: 1,
      };
    }
    return { success: true, output: '', exitCode: 0 };
  }
}

function fileExists(filesystem: FileSystemState, filename: string): boolean {
  const targetPath = resolvePath(filesystem, filename);
  const file = getNodeAtPath(filesystem, targetPath);
  return file !== null && file.type === 'file';
}

function getExistingFileContent(filesystem: FileSystemState, filename: string): string {
  const targetPath = resolvePath(filesystem, filename);
  const file = getNodeAtPath(filesystem, targetPath);
  if (file && file.type === 'file') {
    return file.content || '';
  }
  return '';
}

function createDirectoryPath(filesystem: FileSystemState, dirpath: string, createParents: boolean): CommandResult {
  // Resolve the path first to handle tilde expansion
  const targetPath = resolvePath(filesystem, dirpath);

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
        exitCode: 1,
      };
    }
    // Continue to recursive creation logic
  } else {
    // Parent directory exists, this is a simple creation
    if (parentDir.children[dirname]) {
      if (createParents && parentDir.children[dirname].type === 'directory') {
        return { success: true, output: '', exitCode: 0 }; // -p ignores existing directories
      }
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}': File exists`,
        exitCode: 1,
      };
    }

    const success = createDirectory(filesystem, parentPath, dirname);
    if (!success) {
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}'`,
        exitCode: 1,
      };
    }

    return { success: true, output: '', exitCode: 0 };
  }

  // Handle recursive creation when parent directories don't exist
  if (!createParents) {
    return {
      success: false,
      output: '',
      error: 'mkdir: cannot create directory with path separators (use -p for recursive creation)',
      exitCode: 1,
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
        exitCode: 1,
      };
    }

    if (!parentNode.children[segment]) {
      const success = createDirectory(filesystem, currentPath, segment);
      if (!success) {
        return {
          success: false,
          output: '',
          error: `mkdir: cannot create directory '${dirpath}'`,
          exitCode: 1,
        };
      }
    } else if (parentNode.children[segment].type !== 'directory') {
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}': File exists`,
        exitCode: 1,
      };
    }

    currentPath.push(segment);
  }

  return { success: true, output: '', exitCode: 0 };
}

function removeFile(filesystem: FileSystemState, filename: string, recursive: boolean, force: boolean): CommandResult {
  const targetPath = resolvePath(filesystem, filename);
  const file = getNodeAtPath(filesystem, targetPath);

  if (!file) {
    if (force) {
      return { success: true, output: '', exitCode: 0 }; // Force mode ignores missing files
    }
    return {
      success: false,
      output: '',
      error: `rm: cannot remove '${filename}': No such file or directory`,
      exitCode: 1,
    };
  }

  if (file.type === 'directory') {
    if (!recursive) {
      return {
        success: false,
        output: '',
        error: `rm: cannot remove '${filename}': Is a directory`,
        exitCode: 1,
      };
    }

    // For recursive removal, remove contents first
    if (file.children && Object.keys(file.children).length > 0) {
      // Save current path and change to the directory being removed
      const originalPath = filesystem.currentPath.slice();
      filesystem.currentPath = targetPath;

      for (const childName of Object.keys(file.children)) {
        const childResult = removeFile(filesystem, childName, true, force);
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
      exitCode: 1,
    };
  }

  return { success: true, output: '', exitCode: 0 };
}

function writeToFile(filesystem: FileSystemState, filename: string, content: string): boolean {
  // Handle path resolution for the file
  const targetPath = resolvePath(filesystem, filename);
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
    const targetDirPath = resolvePath(filesystem, dirPath);
    return createFile(filesystem, targetDirPath, fileName, content);
  }
}

function copyFileOrDirectory(
  filesystem: FileSystemState,
  source: string,
  destination: string,
  recursive: boolean,
  force: boolean,
  interactive: boolean,
): CommandResult {
  const sourcePath = resolvePath(filesystem, source);
  const sourceNode = getNodeAtPath(filesystem, sourcePath);

  if (!sourceNode) {
    return createErrorResult(`cp: cannot stat '${source}': No such file or directory`);
  }

  // Resolve destination path
  const destPath = resolvePath(filesystem, destination);
  const destNode = getNodeAtPath(filesystem, destPath);

  let finalDestPath = destPath;
  let finalDestName = destPath[destPath.length - 1];

  // If destination is an existing directory, copy into it
  if (destNode && destNode.type === 'directory') {
    finalDestPath = [...destPath, sourceNode.name];
    finalDestName = sourceNode.name;
  }

  // Check if destination already exists
  const existingDest = getNodeAtPath(filesystem, finalDestPath);
  if (existingDest && !force) {
    if (interactive) {
      // In a real terminal, this would prompt the user
      // For now, we'll assume "no" for interactive mode
      return createErrorResult(`cp: overwrite '${formatPath(finalDestPath)}'? (simulated: no)`);
    } else {
      return createErrorResult(`cp: cannot create '${formatPath(finalDestPath)}': File exists`);
    }
  }

  if (sourceNode.type === 'file') {
    return copyFile(filesystem, sourceNode, finalDestPath);
  } else if (sourceNode.type === 'directory') {
    if (!recursive) {
      return createErrorResult(`cp: omitting directory '${source}'`);
    }
    return copyDirectory(filesystem, sourceNode, finalDestPath, recursive, force);
  }

  return createErrorResult(`cp: cannot copy '${source}': Unknown file type`);
}

function copyFile(filesystem: FileSystemState, sourceNode: FileSystemNode, destPath: string[]): CommandResult {
  const destParentPath = destPath.slice(0, -1);
  const destName = destPath[destPath.length - 1];

  // Security: Validate file size
  const content = sourceNode.content || '';
  const validation = validateFileSize(content, destName);
  if (!validation.valid) {
    return createErrorResult(`cp: ${validation.error}`);
  }

  // Security: Check filesystem size
  const sizeValidation = validateFilesystemSize(filesystem);
  if (!sizeValidation.valid) {
    return createErrorResult(`cp: ${sizeValidation.error}`);
  }

  const success = createFile(filesystem, destParentPath, destName, content);
  if (!success) {
    return createErrorResult(`cp: cannot create '${formatPath(destPath)}'`);
  }

  // Copy metadata
  const newFile = getNodeAtPath(filesystem, destPath);
  if (newFile && sourceNode.createdAt) {
    newFile.createdAt = sourceNode.createdAt;
  }

  return createSuccessResult('');
}

function copyDirectory(filesystem: FileSystemState, sourceNode: FileSystemNode, destPath: string[], recursive: boolean, force: boolean): CommandResult {
  const destParentPath = destPath.slice(0, -1);
  const destName = destPath[destPath.length - 1];

  // Create destination directory
  const success = createDirectory(filesystem, destParentPath, destName);
  if (!success) {
    return createErrorResult(`cp: cannot create directory '${formatPath(destPath)}'`);
  }

  // Copy metadata
  const newDir = getNodeAtPath(filesystem, destPath);
  if (newDir && sourceNode.createdAt) {
    newDir.createdAt = sourceNode.createdAt;
  }

  // Copy contents recursively
  if (sourceNode.children) {
    for (const childName of Object.keys(sourceNode.children)) {
      const childNode = sourceNode.children[childName];
      const childDestPath = [...destPath, childName];

      if (childNode.type === 'file') {
        const result = copyFile(filesystem, childNode, childDestPath);
        if (!result.success) {
          return result;
        }
      } else if (childNode.type === 'directory' && recursive) {
        const result = copyDirectory(filesystem, childNode, childDestPath, recursive, force);
        if (!result.success) {
          return result;
        }
      }
    }
  }

  return createSuccessResult('');
}

function moveFileOrDirectory(
  filesystem: FileSystemState,
  source: string,
  destination: string,
  force: boolean,
  interactive: boolean,
  noOverwrite: boolean,
): CommandResult {
  const sourcePath = resolvePath(filesystem, source);
  const sourceNode = getNodeAtPath(filesystem, sourcePath);

  if (!sourceNode) {
    return createErrorResult(`mv: cannot stat '${source}': No such file or directory`);
  }

  // Resolve destination path
  const destPath = resolvePath(filesystem, destination);
  const destNode = getNodeAtPath(filesystem, destPath);

  let finalDestPath = destPath;
  let finalDestName = destPath[destPath.length - 1];

  // If destination is an existing directory, move into it
  if (destNode && destNode.type === 'directory') {
    finalDestPath = [...destPath, sourceNode.name];
    finalDestName = sourceNode.name;
  }

  // Check if source and destination are the same
  if (formatPath(sourcePath) === formatPath(finalDestPath)) {
    return createErrorResult(`mv: '${source}' and '${destination}' are the same file`);
  }

  // Check if destination already exists
  const existingDest = getNodeAtPath(filesystem, finalDestPath);
  if (existingDest) {
    if (noOverwrite) {
      return createSuccessResult(''); // -n flag: do nothing if destination exists
    }
    if (!force) {
      if (interactive) {
        // In a real terminal, this would prompt the user
        // For now, we'll assume "no" for interactive mode
        return createErrorResult(`mv: overwrite '${formatPath(finalDestPath)}'? (simulated: no)`);
      } else {
        return createErrorResult(`mv: cannot create '${formatPath(finalDestPath)}': File exists`);
      }
    }
  }

  // Remove existing destination if it exists and we're forcing
  if (existingDest && force) {
    const destParentPath = finalDestPath.slice(0, -1);
    const destName = finalDestPath[finalDestPath.length - 1];
    if (!deleteNode(filesystem, destParentPath, destName)) {
      return createErrorResult(`mv: cannot remove '${formatPath(finalDestPath)}'`);
    }
  }

  // Move the node
  const sourceParentPath = sourcePath.slice(0, -1);
  const sourceName = sourcePath[sourcePath.length - 1];
  const destParentPath = finalDestPath.slice(0, -1);

  // First, create the node at the destination
  const destParent = getNodeAtPath(filesystem, destParentPath);
  if (!destParent || destParent.type !== 'directory' || !destParent.children) {
    return createErrorResult(`mv: cannot create '${formatPath(finalDestPath)}': No such directory`);
  }

  // Copy the node to destination
  destParent.children[finalDestName] = {
    ...sourceNode,
    name: finalDestName,
    modifiedAt: new Date(),
  };

  // Remove from source
  if (!deleteNode(filesystem, sourceParentPath, sourceName)) {
    // If deletion fails, remove the copy we just made
    delete destParent.children[finalDestName];
    return createErrorResult(`mv: cannot remove '${source}'`);
  }

  return createSuccessResult('');
}
