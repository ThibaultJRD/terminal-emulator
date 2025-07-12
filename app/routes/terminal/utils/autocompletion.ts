import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { commands } from '~/routes/terminal/utils/commands';
// FilesystemMode removed as both modes now use the same structure
import { getCurrentDirectory, getNodeAtPath, resolvePath } from '~/routes/terminal/utils/filesystem';

import { CHAIN_REGEX } from './constants';

export interface AutocompletionResult {
  completions: string[];
  commonPrefix: string;
}

interface CommandContext {
  isChainedContext: boolean;
  currentInput: string;
  isNewCommand: boolean;
}

/**
 * Determines if we're at the beginning of a new command context
 * @param afterLastOperator - The input string after the last chaining operator
 * @returns true if we're starting a new command, false otherwise
 */
function isNewCommandContext(afterLastOperator: string): boolean {
  return afterLastOperator === '' || !afterLastOperator.includes(' ');
}

/**
 * Analyzes the input to determine if we're in a command chaining context
 * and extracts the relevant part for completion
 */
function parseCommandContext(input: string): CommandContext {
  // Check for command chaining operators (&&, ||, ;)
  const matches = [...input.matchAll(CHAIN_REGEX)];

  if (matches.length === 0) {
    return {
      isChainedContext: false,
      currentInput: input,
      isNewCommand: false,
    };
  }

  // Find the last operator
  const lastMatch = matches[matches.length - 1];
  const lastOperatorIndex = lastMatch.index! + lastMatch[0].length;

  // Extract the part after the last operator
  const afterLastOperator = input.slice(lastOperatorIndex).trimStart();

  // Check if we're at the beginning of a new command
  const isNewCommand = isNewCommandContext(afterLastOperator);

  return {
    isChainedContext: true,
    currentInput: afterLastOperator,
    isNewCommand,
  };
}

export function getAutocompletions(
  input: string,
  filesystem: FileSystemState,
  aliasManager?: import('~/routes/terminal/utils/aliasManager').AliasManager,
): AutocompletionResult {
  // Parse command context to handle chaining
  const context = parseCommandContext(input);
  const workingInput = context.currentInput.trim();

  // If we're in a chained context and at the beginning of a new command,
  // force command completion
  if (context.isChainedContext && context.isNewCommand) {
    const commandName = workingInput;
    const commandNames = Object.keys(commands);
    const aliasNames = aliasManager ? aliasManager.getAliasNames() : [];
    const allCommands = [...commandNames, ...aliasNames];
    const matchingCommands = allCommands.filter((cmd) => cmd.startsWith(commandName));

    return {
      completions: matchingCommands,
      commonPrefix: getCommonPrefix(matchingCommands),
    };
  }

  // Check for redirection operators in the working input
  const redirectMatch = workingInput.match(/^(.+?)\s*(>>|>|<<|<)\s*(.*)$/);

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

  const parts = workingInput.split(/\s+/);

  if (parts.length === 0 || workingInput === '' || (parts.length === 1 && !context.currentInput.endsWith(' '))) {
    // Command completion
    const commandName = parts[0] || '';
    const commandNames = Object.keys(commands);
    const aliasNames = aliasManager ? aliasManager.getAliasNames() : [];
    const allCommands = [...commandNames, ...aliasNames];
    const matchingCommands = allCommands.filter((cmd) => cmd.startsWith(commandName));

    return {
      completions: matchingCommands,
      commonPrefix: getCommonPrefix(matchingCommands),
    };
  }

  // Path completion
  const command = parts[0];

  // Determine what to complete based on the input structure
  let pathArg: string;
  if (context.currentInput.endsWith(' ')) {
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

  if (command && ['ls', 'cat', 'rm', 'touch', 'wc', 'vi', 'cp', 'mv', 'source', 'grep'].includes(command)) {
    return getPathCompletions(pathArg, filesystem);
  }

  // Special handling for unalias command - complete with existing alias names
  if (command === 'unalias' && aliasManager) {
    const aliasNames = aliasManager.getAliasNames();
    const matchingAliases = aliasNames.filter((alias) => alias.startsWith(pathArg));

    return {
      completions: matchingAliases,
      commonPrefix: getCommonPrefix(matchingAliases),
    };
  }

  // Special handling for alias command - complete with existing alias names
  if (command === 'alias' && aliasManager) {
    const aliasNames = aliasManager.getAliasNames();
    const matchingAliases = aliasNames.filter((alias) => alias.startsWith(pathArg));

    return {
      completions: matchingAliases,
      commonPrefix: getCommonPrefix(matchingAliases),
    };
  }

  // Special handling for man command - complete with available manual pages
  if (command === 'man') {
    return getManPageCompletions(pathArg, filesystem);
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

function getManPageCompletions(partialName: string, filesystem: FileSystemState): AutocompletionResult {
  // Get the man1 directory
  const manPath = ['usr', 'share', 'man', 'man1'];
  const manDir = getNodeAtPath(filesystem, manPath);

  if (!manDir || manDir.type !== 'directory' || !manDir.children) {
    return { completions: [], commonPrefix: '' };
  }

  // Extract command names from manual pages (remove .1 extension)
  const manPages = Object.keys(manDir.children)
    .filter((name) => name.endsWith('.1'))
    .map((name) => name.slice(0, -2)) // Remove .1 extension
    .filter((command) => command.startsWith(partialName))
    .sort();

  return {
    completions: manPages,
    commonPrefix: getCommonPrefix(manPages),
  };
}

export function applyCompletion(input: string, completion: string, aliasManager?: import('~/routes/terminal/utils/aliasManager').AliasManager): string {
  // Parse command context to handle chaining
  const context = parseCommandContext(input);
  const workingInput = context.currentInput;

  // Check for redirection operators in the working input
  const redirectMatch = workingInput.match(/^(.+?)\s*(>>|>|<<|<)\s*(.*)$/);

  if (redirectMatch) {
    const [, commandPart, operator] = redirectMatch;
    const newWorkingInput = `${commandPart} ${operator} ${completion}`;
    return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newWorkingInput : newWorkingInput;
  }

  const trimmedInput = workingInput.trim();
  const parts = trimmedInput.split(/\s+/);

  if (parts.length === 0 || (parts.length === 1 && !workingInput.endsWith(' '))) {
    // Command completion - only add space if completion is a valid complete command/alias
    const currentCommand = parts[0] || '';
    if (completion === currentCommand) {
      return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + completion : completion;
    }

    // Check if completion is a valid command or alias
    const commandNames = Object.keys(commands);
    const aliasNames = aliasManager ? aliasManager.getAliasNames() : [];
    const isValidCommand = commandNames.includes(completion) || aliasNames.includes(completion);

    const newCompletion = isValidCommand ? completion + ' ' : completion;
    return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newCompletion : newCompletion;
  }

  // Path completion - handle the case where input ends with space
  if (workingInput.endsWith(' ')) {
    // Input ends with space - append the completion
    const newWorkingInput = `${trimmedInput} ${completion}`;
    return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newWorkingInput : newWorkingInput;
  } else {
    // Input doesn't end with space - replace the last non-option argument
    const lastArg = parts[parts.length - 1];
    if (isOption(lastArg)) {
      // Last argument is an option - this shouldn't happen in normal flow
      const newWorkingInput = `${trimmedInput} ${completion}`;
      return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newWorkingInput : newWorkingInput;
    } else {
      // Replace the last argument (which should be a path)
      parts[parts.length - 1] = completion;
      const newWorkingInput = parts.join(' ');
      return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newWorkingInput : newWorkingInput;
    }
  }
}

// Apply completion without adding trailing space (for cycling)
export function applyCompletionNoSpace(input: string, completion: string, aliasManager?: import('~/routes/terminal/utils/aliasManager').AliasManager): string {
  // Parse command context to handle chaining
  const context = parseCommandContext(input);
  const workingInput = context.currentInput;

  // Check for redirection operators in the working input
  const redirectMatch = workingInput.match(/^(.+?)\s*(>>|>|<<|<)\s*(.*)$/);

  if (redirectMatch) {
    const [, commandPart, operator] = redirectMatch;
    const newWorkingInput = `${commandPart} ${operator} ${completion}`;
    return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newWorkingInput : newWorkingInput;
  }

  const trimmedInput = workingInput.trim();
  const parts = trimmedInput.split(/\s+/);

  if (parts.length === 0 || (parts.length === 1 && !workingInput.endsWith(' '))) {
    // Command completion without space
    return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + completion : completion;
  }

  // Path completion - handle the case where input ends with space
  if (workingInput.endsWith(' ')) {
    // Input ends with space - append the completion (no trailing space for cycling)
    const newWorkingInput = `${trimmedInput} ${completion}`;
    return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newWorkingInput : newWorkingInput;
  } else {
    // Input doesn't end with space - replace the last non-option argument
    const lastArg = parts[parts.length - 1];
    if (isOption(lastArg)) {
      // Last argument is an option - this shouldn't happen in normal flow
      const newWorkingInput = `${trimmedInput} ${completion}`;
      return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newWorkingInput : newWorkingInput;
    } else {
      // Replace the last argument (which should be a path)
      parts[parts.length - 1] = completion;
      const newWorkingInput = parts.join(' ');
      return context.isChainedContext ? input.slice(0, input.length - workingInput.length) + newWorkingInput : newWorkingInput;
    }
  }
}
