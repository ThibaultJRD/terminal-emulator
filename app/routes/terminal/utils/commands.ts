import type { CommandHandler, CommandResult, FileSystemState, OutputSegment } from '~/routes/terminal/types/filesystem';
import { parseCommand } from '~/routes/terminal/utils/commandParser';
import { createDirectory, createFile, deleteNode, formatPath, getCurrentDirectory, getNodeAtPath, resolvePath } from '~/routes/terminal/utils/filesystem';
import { renderMarkdown } from '~/routes/terminal/utils/markdown';
import { parseOptions } from '~/routes/terminal/utils/optionParser';

export const commands: Record<string, CommandHandler> = {
  cd: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      filesystem.currentPath = ['home', 'user'];
      return { success: true, output: '' };
    }

    const targetPath = resolvePath(filesystem, args[0]);
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

  ls: (args: string[], filesystem: FileSystemState): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    const showHidden = flags.has('a');
    const showDetails = flags.has('l');
    const pathArg = positionalArgs[0];

    const targetPath = pathArg ? resolvePath(filesystem, pathArg) : filesystem.currentPath;
    const targetNode = getNodeAtPath(filesystem, targetPath);

    if (!targetNode) {
      return {
        success: false,
        output: '',
        error: `ls: cannot access '${pathArg}': No such file or directory`,
      };
    }

    if (targetNode.type === 'file') {
      return { success: true, output: targetNode.name };
    }

    if (!targetNode.children) {
      return { success: true, output: '' };
    }

    const entries = Object.values(targetNode.children)
      .filter((node) => showHidden || !node.name.startsWith('.'))
      .sort((a, b) => {
        if (a.type === 'directory' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'directory') return 1;
        return a.name.localeCompare(b.name);
      });

    if (showDetails) {
      const outputSegments: OutputSegment[] = [];
      entries.forEach((node, index) => {
        if (index > 0) {
          outputSegments.push({ text: '\n', type: 'normal' });
        }
        const type = node.type === 'directory' ? 'd' : '-';
        const permissions = node.permissions || 'rwxr-xr-x';
        const size = node.size || 0;
        const date = node.modifiedAt.toLocaleDateString();

        outputSegments.push({
          text: `${type}${permissions} ${size.toString().padStart(8)} ${date} `,
          type: 'normal',
        });
        outputSegments.push({ text: node.name, type: node.type });
      });

      return { success: true, output: outputSegments };
    } else {
      const outputSegments: OutputSegment[] = [];
      entries.forEach((node, index) => {
        if (index > 0) {
          outputSegments.push({ text: '  ', type: 'normal' });
        }
        outputSegments.push({ text: node.name, type: node.type });
      });

      return { success: true, output: outputSegments };
    }
  },

  pwd: (args: string[], filesystem: FileSystemState): CommandResult => {
    return { success: true, output: formatPath(filesystem.currentPath) };
  },

  touch: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: '',
        error: 'touch: missing file operand',
      };
    }

    const filename = args[0];
    if (filename.includes('/')) {
      return {
        success: false,
        output: '',
        error: 'touch: cannot create file with path separators',
      };
    }

    const currentDir = getCurrentDirectory(filesystem);
    if (!currentDir || currentDir.type !== 'directory' || !currentDir.children) {
      return {
        success: false,
        output: '',
        error: 'touch: cannot access current directory',
      };
    }

    if (currentDir.children[filename]) {
      currentDir.children[filename].modifiedAt = new Date();
      return { success: true, output: '' };
    }

    const success = createFile(filesystem, filesystem.currentPath, filename, '');
    if (!success) {
      return {
        success: false,
        output: '',
        error: `touch: cannot create '${filename}'`,
      };
    }

    return { success: true, output: '' };
  },

  cat: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: '', error: 'cat: missing file operand' };
    }

    const filename = args[0];
    const targetPath = resolvePath(filesystem, filename);
    const file = getNodeAtPath(filesystem, targetPath);

    if (!file) {
      return {
        success: false,
        output: '',
        error: `cat: ${filename}: No such file or directory`,
      };
    }

    if (file.type === 'directory') {
      return {
        success: false,
        output: '',
        error: `cat: ${filename}: Is a directory`,
      };
    }

    const content = file.content || '';

    // Check if it's a markdown file
    if (filename.endsWith('.md')) {
      return { success: true, output: renderMarkdown(content) };
    }

    return { success: true, output: content };
  },

  mkdir: (args: string[], filesystem: FileSystemState): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return { success: false, output: '', error: 'mkdir: missing operand' };
    }

    const createParents = flags.has('p');

    for (const dirpath of positionalArgs) {
      const result = createDirectoryPath(filesystem, dirpath, createParents);
      if (!result.success) {
        return result;
      }
    }

    return { success: true, output: '' };
  },

  rm: (args: string[], filesystem: FileSystemState): CommandResult => {
    const { flags, positionalArgs } = parseOptions(args);

    if (positionalArgs.length === 0) {
      return { success: false, output: '', error: 'rm: missing operand' };
    }

    const recursive = flags.has('r') || flags.has('R');
    const force = flags.has('f');

    for (const filename of positionalArgs) {
      const result = removeFile(filesystem, filename, recursive, force);
      if (!result.success && !force) {
        return result;
      }
    }

    return { success: true, output: '' };
  },

  rmdir: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: '', error: 'rmdir: missing operand' };
    }

    const dirname = args[0];
    const currentDir = getCurrentDirectory(filesystem);
    if (!currentDir || currentDir.type !== 'directory' || !currentDir.children) {
      return {
        success: false,
        output: '',
        error: 'rmdir: cannot access current directory',
      };
    }

    const dir = currentDir.children[dirname];
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

    const success = deleteNode(filesystem, filesystem.currentPath, dirname);
    if (!success) {
      return {
        success: false,
        output: '',
        error: `rmdir: failed to remove '${dirname}'`,
      };
    }

    return { success: true, output: '' };
  },

  clear: (args: string[], filesystem: FileSystemState): CommandResult => {
    return { success: true, output: 'CLEAR' };
  },

  echo: (args: string[], filesystem: FileSystemState): CommandResult => {
    const output = args.join(' ');
    return { success: true, output };
  },

  wc: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: '', error: 'wc: missing operand' };
    }

    let totalLines = 0;
    let totalWords = 0;
    let totalChars = 0;
    const results: string[] = [];

    for (const filename of args) {
      const currentDir = getCurrentDirectory(filesystem);
      if (!currentDir || currentDir.type !== 'directory' || !currentDir.children) {
        return {
          success: false,
          output: '',
          error: 'wc: cannot access current directory',
        };
      }

      const file = currentDir.children[filename];
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

  help: (args: string[], filesystem: FileSystemState): CommandResult => {
    const helpText = [
      'Available commands:',
      '  cd [dir]         - Change directory',
      '  ls [-a] [-l]     - List directory contents (-a: show hidden, -l: long format)',
      '  pwd              - Print working directory',
      '  touch <file>     - Create empty file or update timestamp',
      '  cat <file>       - Display file contents (supports markdown rendering)',
      '  mkdir [-p] <dir> - Create directory (-p: create parent directories)',
      '  rm [-r] [-f] <file> - Remove file (-r: recursive, -f: force)',
      '  rmdir <dir>      - Remove empty directory',
      '  echo <text>      - Print text to output',
      '  wc <file>        - Count lines, words, and characters in file',
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
    ].join('\n');

    return { success: true, output: helpText };
  },
};

export function executeCommand(input: string, filesystem: FileSystemState): CommandResult {
  const parsed = parseCommand(input);
  const { command, args, redirectOutput, redirectInput } = parsed;

  if (!command) {
    return { success: true, output: '' };
  }

  // Handle input redirection
  let finalArgs = args;
  if (redirectInput) {
    const inputResult = handleInputRedirection(redirectInput, filesystem);
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
      const fileContent = getExistingFileContent(filesystem, redirectInput.source);
      if (fileContent === '' && !fileExists(filesystem, redirectInput.source)) {
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

  const result = handler(finalArgs, filesystem);

  // Handle output redirection
  if (result.success && redirectOutput) {
    let outputContent = '';

    if (typeof result.output === 'string') {
      outputContent = result.output;
    } else if (Array.isArray(result.output)) {
      // Convert OutputSegment array to string
      outputContent = result.output.map((segment) => segment.text || '').join('');
    }

    const content = redirectOutput.type === '>>' ? getExistingFileContent(filesystem, redirectOutput.filename) + outputContent : outputContent;

    const writeSuccess = writeToFile(filesystem, redirectOutput.filename, content);

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

function handleInputRedirection(redirectInput: { type: '<<' | '<'; source: string }, filesystem: FileSystemState): CommandResult {
  if (redirectInput.type === '<<') {
    // Heredoc - simplified implementation that accepts any delimiter
    // In a real implementation, this would start interactive input until the delimiter is found
    return { success: true, output: '' };
  } else {
    // File input - check if file exists
    if (!fileExists(filesystem, redirectInput.source)) {
      return {
        success: false,
        output: '',
        error: `cannot read from '${redirectInput.source}': No such file or directory`,
      };
    }
    return { success: true, output: '' };
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
  // Handle simple case (no path separators)
  if (!dirpath.includes('/')) {
    const currentDir = getCurrentDirectory(filesystem);
    if (!currentDir || currentDir.type !== 'directory' || !currentDir.children) {
      return {
        success: false,
        output: '',
        error: 'mkdir: cannot access current directory',
      };
    }

    if (currentDir.children[dirpath]) {
      if (createParents && currentDir.children[dirpath].type === 'directory') {
        return { success: true, output: '' }; // -p ignores existing directories
      }
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}': File exists`,
      };
    }

    const success = createDirectory(filesystem, filesystem.currentPath, dirpath);
    if (!success) {
      return {
        success: false,
        output: '',
        error: `mkdir: cannot create directory '${dirpath}'`,
      };
    }

    return { success: true, output: '' };
  }

  // Handle path with separators
  if (!createParents) {
    return {
      success: false,
      output: '',
      error: 'mkdir: cannot create directory with path separators (use -p for recursive creation)',
    };
  }

  // Create directories recursively
  const targetPath = resolvePath(filesystem, dirpath);
  let currentPath = filesystem.currentPath.slice(); // Copy current path

  for (let i = filesystem.currentPath.length; i < targetPath.length; i++) {
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

function removeFile(filesystem: FileSystemState, filename: string, recursive: boolean, force: boolean): CommandResult {
  const currentDir = getCurrentDirectory(filesystem);
  if (!currentDir || currentDir.type !== 'directory' || !currentDir.children) {
    return {
      success: false,
      output: '',
      error: 'rm: cannot access current directory',
    };
  }

  const file = currentDir.children[filename];
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
      filesystem.currentPath = [...originalPath, filename];

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

  const success = deleteNode(filesystem, filesystem.currentPath, filename);
  if (!success && !force) {
    return {
      success: false,
      output: '',
      error: `rm: cannot remove '${filename}'`,
    };
  }

  return { success: true, output: '' };
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
