import { CHAIN_REGEX } from './constants';
import type { EnvironmentManager } from './environmentManager';

export interface ParsedCommand {
  command: string;
  args: string[];
  redirectOutput?: {
    type: '>>' | '>';
    filename: string;
  };
  redirectInput?: {
    type: '<<' | '<';
    source: string;
  };
}

export interface ChainedCommand {
  commands: ParsedCommand[];
  operators: ('&&' | '||' | ';')[];
}

export interface PipedCommand {
  commands: ParsedCommand[];
  operators: '|'[];
}

// Security constants
const MAX_COMMAND_LENGTH = 1000;
const MAX_FILENAME_LENGTH = 255;

/**
 * Performs variable substitution on a string using the environment manager
 */
export function substituteVariables(input: string, environmentManager?: EnvironmentManager): string {
  if (!environmentManager) {
    return input;
  }
  return environmentManager.substitute(input);
}

/**
 * Performs variable substitution on all parts of a parsed command
 */
export function substituteVariablesInParsedCommand(parsedCommand: ParsedCommand, environmentManager?: EnvironmentManager): ParsedCommand {
  if (!environmentManager) {
    return parsedCommand;
  }

  const substituted: ParsedCommand = {
    command: environmentManager.substitute(parsedCommand.command),
    args: parsedCommand.args.map((arg) => environmentManager.substitute(arg)),
  };

  if (parsedCommand.redirectOutput) {
    substituted.redirectOutput = {
      type: parsedCommand.redirectOutput.type,
      filename: environmentManager.substitute(parsedCommand.redirectOutput.filename),
    };
  }

  if (parsedCommand.redirectInput) {
    substituted.redirectInput = {
      type: parsedCommand.redirectInput.type,
      source: environmentManager.substitute(parsedCommand.redirectInput.source),
    };
  }

  return substituted;
}

export function parseCommand(input: string, environmentManager?: EnvironmentManager): ParsedCommand {
  // Perform variable substitution first
  const substituted = substituteVariables(input, environmentManager);
  const trimmed = substituted.trim();

  // Security: Limit command length to prevent ReDoS attacks
  if (trimmed.length > MAX_COMMAND_LENGTH) {
    throw new Error(`Command too long (max ${MAX_COMMAND_LENGTH} characters)`);
  }

  // Check for combined input and output redirection (e.g., cat << EOF > file.txt)
  const combinedRedirectMatch = trimmed.match(/^([^<>]+?)\s*(<<|<)\s*([^<>]+?)\s*(>>|>)\s*([^<>]+)$/);

  if (combinedRedirectMatch) {
    const [, commandPart, inputOperator, inputSource, outputOperator, outputFilename] = combinedRedirectMatch;
    const parts = parseArguments(commandPart.trim());
    const command = parts[0];
    const args = parts.slice(1);
    const cleanInputSource = inputSource.trim().replace(/^["']|["']$/g, '');
    const cleanOutputFilename = outputFilename.trim().replace(/^["']|["']$/g, '');

    // Security: Validate lengths and characters
    if (cleanInputSource.length > MAX_FILENAME_LENGTH) {
      throw new Error(`Input source too long (max ${MAX_FILENAME_LENGTH} characters)`);
    }
    if (cleanOutputFilename.length > MAX_FILENAME_LENGTH) {
      throw new Error(`Output filename too long (max ${MAX_FILENAME_LENGTH} characters)`);
    }
    if (cleanInputSource.includes('\0') || cleanInputSource.includes('..')) {
      throw new Error('Invalid input source: contains forbidden characters');
    }
    if (cleanOutputFilename.includes('\0') || cleanOutputFilename.includes('..')) {
      throw new Error('Invalid output filename: contains forbidden characters');
    }

    return {
      command,
      args,
      redirectInput: {
        type: inputOperator as '<<' | '<',
        source: cleanInputSource,
      },
      redirectOutput: {
        type: outputOperator as '>>' | '>',
        filename: cleanOutputFilename,
      },
    };
  }

  // Check for output redirection operators only
  const outputRedirectMatch = trimmed.match(/^([^>]+?)\s*(>>|>)\s*([^>]+)$/);

  if (outputRedirectMatch) {
    const [, commandPart, operator, filename] = outputRedirectMatch;
    const parts = parseArguments(commandPart.trim());
    const command = parts[0];
    const args = parts.slice(1);
    const cleanFilename = filename.trim().replace(/^["']|["']$/g, '');

    // Security: Validate filename length and characters
    if (cleanFilename.length > MAX_FILENAME_LENGTH) {
      throw new Error(`Filename too long (max ${MAX_FILENAME_LENGTH} characters)`);
    }
    if (cleanFilename.includes('\0') || cleanFilename.includes('..')) {
      throw new Error('Invalid filename: contains forbidden characters');
    }

    return {
      command,
      args,
      redirectOutput: {
        type: operator as '>>' | '>',
        filename: cleanFilename,
      },
    };
  }

  // Check for input redirection operators only
  const inputRedirectMatch = trimmed.match(/^([^<]+?)\s*(<<|<)\s*([^<]+)$/);

  if (inputRedirectMatch) {
    const [, commandPart, operator, source] = inputRedirectMatch;
    const parts = parseArguments(commandPart.trim());
    const command = parts[0];
    const args = parts.slice(1);
    const cleanSource = source.trim().replace(/^["']|["']$/g, '');

    // Security: Validate source length and characters
    if (cleanSource.length > MAX_FILENAME_LENGTH) {
      throw new Error(`Source too long (max ${MAX_FILENAME_LENGTH} characters)`);
    }
    if (cleanSource.includes('\0') || cleanSource.includes('..')) {
      throw new Error('Invalid source: contains forbidden characters');
    }

    return {
      command,
      args,
      redirectInput: {
        type: operator as '<<' | '<',
        source: cleanSource,
      },
    };
  }

  // No redirection, parse normally
  const parts = parseArguments(trimmed);
  const command = parts[0] || '';
  const args = parts.slice(1);

  return {
    command,
    args,
  };
}

function parseArguments(input: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = '';
    } else if (!inQuotes && char === ' ') {
      if (current.trim()) {
        args.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args.filter((arg) => arg.length > 0);
}

/**
 * Finds chain operators in a command string while respecting quoted sections
 */
function findChainOperators(input: string): Array<{ index: number; operator: '&&' | '||' | ';' | '|'; length: number }> {
  const operators: Array<{ index: number; operator: '&&' | '||' | ';' | '|'; length: number }> = [];
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = '';
    } else if (!inQuotes) {
      // Check for operators outside quotes
      if (i < input.length - 1) {
        const twoChar = input.slice(i, i + 2);
        if (twoChar === '||' || twoChar === '&&') {
          operators.push({ index: i, operator: twoChar as '||' | '&&', length: 2 });
          i++; // Skip next character since we consumed two
          continue;
        }
      }

      if (char === ';' || char === '|') {
        operators.push({ index: i, operator: char as ';' | '|', length: 1 });
      }
    }
  }

  return operators;
}

export function parseChainedCommand(input: string, environmentManager?: EnvironmentManager): ChainedCommand | PipedCommand | ParsedCommand {
  const trimmed = input.trim();

  // Security: Limit command length to prevent ReDoS attacks
  if (trimmed.length > MAX_COMMAND_LENGTH) {
    throw new Error(`Command too long (max ${MAX_COMMAND_LENGTH} characters)`);
  }

  // Check for command chaining operators while respecting quotes
  const operatorMatches = findChainOperators(trimmed);

  if (operatorMatches.length === 0) {
    // No chaining operators, return single command
    return parseCommand(trimmed, environmentManager);
  }

  // Parse chained commands - separate pipes from other operators
  const commands: ParsedCommand[] = [];
  const operators: ('&&' | '||' | ';' | '|')[] = [];

  let lastIndex = 0;
  for (const match of operatorMatches) {
    const commandStr = trimmed.slice(lastIndex, match.index).trim();
    if (commandStr) {
      commands.push(parseCommand(commandStr, environmentManager));
    }
    operators.push(match.operator);
    lastIndex = match.index + match.length;
  }

  // Add the last command
  const lastCommandStr = trimmed.slice(lastIndex).trim();
  if (lastCommandStr) {
    commands.push(parseCommand(lastCommandStr, environmentManager));
  }

  // Validate we have the right number of operators
  if (operators.length !== commands.length - 1) {
    throw new Error('Invalid command chain syntax');
  }

  // Check if this is a pure pipe chain (only | operators)
  const hasPipeOperators = operators.some((op) => op === '|');
  const hasNonPipeOperators = operators.some((op) => op !== '|');

  if (hasPipeOperators && hasNonPipeOperators) {
    throw new Error('Cannot mix pipe operators (|) with other chaining operators (&&, ||, ;)');
  }

  if (hasPipeOperators) {
    // Return PipedCommand for pure pipe chains
    return {
      commands,
      operators: operators as '|'[],
    };
  }

  // Return ChainedCommand for other operator chains
  return {
    commands,
    operators: operators as ('&&' | '||' | ';')[],
  };
}
