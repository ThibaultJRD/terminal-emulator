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
  const pathArg = parts[parts.length - 1];

  if (command && ['cd', 'ls', 'cat', 'rm', 'rmdir', 'mkdir', 'touch', 'nano', 'vi'].includes(command)) {
    return getPathCompletions(pathArg, filesystem);
  }

  // Special completions for new commands
  if (command === 'switch-fs' && parts.length === 2) {
    const modes = ['default', 'portfolio'];
    const prefix = parts[1] || '';
    const matchingModes = modes.filter((mode) => mode.startsWith(prefix));

    return {
      completions: matchingModes,
      commonPrefix: getCommonPrefix(matchingModes),
    };
  }

  if (command === 'reset-fs' && parts.length === 2) {
    const modes = ['default', 'portfolio'];
    const prefix = parts[1] || '';
    const matchingModes = modes.filter((mode) => mode.startsWith(prefix));

    return {
      completions: matchingModes,
      commonPrefix: getCommonPrefix(matchingModes),
    };
  }

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

  const parts = input.trim().split(/\s+/);

  if (parts.length === 0 || (parts.length === 1 && !input.endsWith(' '))) {
    // Command completion
    return completion + ' ';
  }

  // Path completion
  parts[parts.length - 1] = completion;
  return parts.join(' ');
}
