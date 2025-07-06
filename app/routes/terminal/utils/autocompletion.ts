import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { commands } from '~/routes/terminal/utils/commands';
import { getCurrentDirectory, getNodeAtPath, resolvePath } from '~/routes/terminal/utils/filesystem';

export interface AutocompletionResult {
  completions: string[];
  commonPrefix: string;
}

export function getAutocompletions(input: string, filesystem: FileSystemState): AutocompletionResult {
  // Check for redirection operators
  const redirectMatch = input.match(/^(.+?)\s*(>>|>|<<|<)\s*(.*)$/);

  if (redirectMatch) {
    const [, , operator, filename] = redirectMatch;
    // For output redirection, complete filenames
    if (operator === '>' || operator === '>>') {
      return getPathCompletions(filename.trim(), filesystem);
    }
    // For input redirection, complete existing files only
    if (operator === '<') {
      return getFileCompletions(filename.trim(), filesystem);
    }
    // For heredoc (<<), no completion needed
    if (operator === '<<') {
      return { completions: [], commonPrefix: '' };
    }
  }

  const trimmedInput = input.trim();
  const parts = trimmedInput.split(/\s+/);

  if (parts.length === 0 || trimmedInput === '' || (parts.length === 1 && !input.endsWith(' '))) {
    // Command completion
    const commandName = parts[0] || '';
    const commandNames = Object.keys(commands);
    const matchingCommands = commandNames.filter((cmd) => cmd.startsWith(commandName));

    return {
      completions: matchingCommands,
      commonPrefix: getCommonPrefix(matchingCommands),
    };
  }

  // Path completion
  const command = parts[0];

  // Detect if we just finished typing a command (ends with space)
  let pathArg: string;
  if (input.endsWith(' ') && parts.length === 1) {
    // Just typed "cat " - complete all files
    pathArg = '';
  } else {
    // Normal case - complete the last argument
    pathArg = parts[parts.length - 1];
  }

  if (command && ['cd', 'ls', 'cat', 'rm', 'rmdir', 'mkdir', 'touch', 'wc', 'vi'].includes(command)) {
    return getPathCompletions(pathArg, filesystem);
  }

  // No special completions needed for reset-fs as it no longer takes arguments

  return { completions: [], commonPrefix: '' };
}

function getPathCompletions(partialPath: string, filesystem: FileSystemState): AutocompletionResult {
  const lastSlashIndex = partialPath.lastIndexOf('/');
  let basePath: string;
  let prefix: string;

  if (lastSlashIndex === -1) {
    // No slash, completing in current directory
    basePath = '';
    prefix = partialPath;
  } else {
    // Has slash, completing in specified directory
    basePath = partialPath.substring(0, lastSlashIndex + 1);
    prefix = partialPath.substring(lastSlashIndex + 1);
  }

  const targetPath = basePath ? resolvePath(filesystem, basePath) : filesystem.currentPath;
  const targetNode = getNodeAtPath(filesystem, targetPath);

  if (!targetNode || targetNode.type !== 'directory' || !targetNode.children) {
    return { completions: [], commonPrefix: '' };
  }

  const matchingNames = Object.keys(targetNode.children)
    .filter((name) => name.startsWith(prefix))
    .sort();

  const completions = matchingNames.map((name) => {
    const node = targetNode.children![name];
    const fullPath = basePath + name;
    return node.type === 'directory' ? fullPath + '/' : fullPath;
  });

  return {
    completions,
    commonPrefix: basePath + getCommonPrefix(matchingNames),
  };
}

function getFileCompletions(partialPath: string, filesystem: FileSystemState): AutocompletionResult {
  const lastSlashIndex = partialPath.lastIndexOf('/');
  let basePath: string;
  let prefix: string;

  if (lastSlashIndex === -1) {
    // No slash, completing in current directory
    basePath = '';
    prefix = partialPath;
  } else {
    // Has slash, completing in specified directory
    basePath = partialPath.substring(0, lastSlashIndex + 1);
    prefix = partialPath.substring(lastSlashIndex + 1);
  }

  const targetPath = basePath ? resolvePath(filesystem, basePath) : filesystem.currentPath;
  const targetNode = getNodeAtPath(filesystem, targetPath);

  if (!targetNode || targetNode.type !== 'directory' || !targetNode.children) {
    return { completions: [], commonPrefix: '' };
  }

  // Only complete files (not directories) for input redirection
  const matchingNames = Object.keys(targetNode.children)
    .filter((name) => {
      const node = targetNode.children![name];
      return node.type === 'file' && name.startsWith(prefix);
    })
    .sort();

  const completions = matchingNames.map((name) => basePath + name);

  return {
    completions,
    commonPrefix: basePath + getCommonPrefix(matchingNames),
  };
}

function getCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return '';
  if (strings.length === 1) return strings[0];

  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    let j = 0;
    while (j < prefix.length && j < strings[i].length && prefix[j] === strings[i][j]) {
      j++;
    }
    prefix = prefix.substring(0, j);
    if (prefix === '') break;
  }

  return prefix;
}

export function applyCompletion(input: string, completion: string): string {
  // Check for redirection operators
  const redirectMatch = input.match(/^(.+?)\s*(>>|>|<<|<)\s*(.*)$/);

  if (redirectMatch) {
    const [, commandPart, operator] = redirectMatch;
    return `${commandPart} ${operator} ${completion}`;
  }

  const trimmedInput = input.trim();
  const parts = trimmedInput.split(/\s+/);

  if (parts.length === 0 || (parts.length === 1 && !input.endsWith(' '))) {
    // Command completion
    return completion + ' ';
  }

  // Path completion - handle the case where input ends with space
  if (input.endsWith(' ') && parts.length === 1) {
    // Input like "cat " - append the completion
    return `${trimmedInput} ${completion}`;
  } else {
    // Input like "cat file" - replace last part
    parts[parts.length - 1] = completion;
    return parts.join(' ');
  }
}

// Apply completion without adding trailing space (for cycling)
export function applyCompletionNoSpace(input: string, completion: string): string {
  // Check for redirection operators
  const redirectMatch = input.match(/^(.+?)\s*(>>|>|<<|<)\s*(.*)$/);

  if (redirectMatch) {
    const [, commandPart, operator] = redirectMatch;
    return `${commandPart} ${operator} ${completion}`;
  }

  const trimmedInput = input.trim();
  const parts = trimmedInput.split(/\s+/);

  if (parts.length === 0 || (parts.length === 1 && !input.endsWith(' '))) {
    // Command completion without space
    return completion;
  }

  // Path completion - handle the case where input ends with space
  if (input.endsWith(' ') && parts.length === 1) {
    // Input like "cat " - append the completion (no trailing space for cycling)
    return `${trimmedInput} ${completion}`;
  } else {
    // Input like "cat file" - replace last part
    parts[parts.length - 1] = completion;
    return parts.join(' ');
  }
}
