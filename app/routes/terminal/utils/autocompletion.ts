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

  // Determine what to complete based on the input structure
  let pathArg: string;
  if (input.endsWith(' ')) {
    // Input ends with space - we're starting a new argument
    if (parts.length === 1) {
      // Just typed "cat " - complete all files
      pathArg = '';
    } else {
      // Typed "ls -a " or "cat -n " - complete all files after options
      pathArg = '';
    }
  } else {
    // Input doesn't end with space - we're completing the current argument
    const lastArg = parts[parts.length - 1];
    if (isOption(lastArg)) {
      // Last argument is an option like "-a" - no completion for options
      return { completions: [], commonPrefix: '' };
    } else {
      // Last argument is a path - complete it
      pathArg = lastArg;
    }
  }

  if (command === 'cd' || command === 'mkdir' || command === 'rmdir') {
    return getDirectoryCompletions(pathArg, filesystem);
  }

  if (command && ['ls', 'cat', 'rm', 'touch', 'wc', 'vi'].includes(command)) {
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
    .filter((name) => {
      // Filter out hidden files unless user explicitly types a dot prefix
      const isHidden = name.startsWith('.');
      const userWantsHidden = prefix.startsWith('.');

      return name.startsWith(prefix) && (!isHidden || userWantsHidden);
    })
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
      // Filter out hidden files unless user explicitly types a dot prefix
      const isHidden = name.startsWith('.');
      const userWantsHidden = prefix.startsWith('.');

      return node.type === 'file' && name.startsWith(prefix) && (!isHidden || userWantsHidden);
    })
    .sort();

  const completions = matchingNames.map((name) => basePath + name);

  return {
    completions,
    commonPrefix: basePath + getCommonPrefix(matchingNames),
  };
}

function getDirectoryCompletions(partialPath: string, filesystem: FileSystemState): AutocompletionResult {
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

  // Only complete directories (not files) for cd command
  const matchingNames = Object.keys(targetNode.children)
    .filter((name) => {
      const node = targetNode.children![name];
      // Filter out hidden files unless user explicitly types a dot prefix
      const isHidden = name.startsWith('.');
      const userWantsHidden = prefix.startsWith('.');

      return node.type === 'directory' && name.startsWith(prefix) && (!isHidden || userWantsHidden);
    })
    .sort();

  const completions = matchingNames.map((name) => basePath + name + '/');

  return {
    completions,
    commonPrefix: basePath + getCommonPrefix(matchingNames),
  };
}

// Helper to check if an argument is an option (starts with -)
function isOption(arg: string): boolean {
  return arg.startsWith('-') && arg.length > 1;
}

// Helper to find the last non-option argument for path completion
function getLastNonOptionArg(parts: string[]): string {
  // Start from the end and find the first non-option argument
  for (let i = parts.length - 1; i >= 1; i--) {
    // Skip index 0 (command)
    if (!isOption(parts[i])) {
      return parts[i];
    }
  }
  // If all arguments are options, return empty string (complete all files)
  return '';
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
  if (input.endsWith(' ')) {
    // Input ends with space - append the completion
    return `${trimmedInput} ${completion}`;
  } else {
    // Input doesn't end with space - replace the last non-option argument
    const lastArg = parts[parts.length - 1];
    if (isOption(lastArg)) {
      // Last argument is an option - this shouldn't happen in normal flow
      return `${trimmedInput} ${completion}`;
    } else {
      // Replace the last argument (which should be a path)
      parts[parts.length - 1] = completion;
      return parts.join(' ');
    }
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
  if (input.endsWith(' ')) {
    // Input ends with space - append the completion (no trailing space for cycling)
    return `${trimmedInput} ${completion}`;
  } else {
    // Input doesn't end with space - replace the last non-option argument
    const lastArg = parts[parts.length - 1];
    if (isOption(lastArg)) {
      // Last argument is an option - this shouldn't happen in normal flow
      return `${trimmedInput} ${completion}`;
    } else {
      // Replace the last argument (which should be a path)
      parts[parts.length - 1] = completion;
      return parts.join(' ');
    }
  }
}
