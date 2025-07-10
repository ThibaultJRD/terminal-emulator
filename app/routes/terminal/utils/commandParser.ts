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

// Security constants
const MAX_COMMAND_LENGTH = 1000;
const MAX_FILENAME_LENGTH = 255;

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();

  // Security: Limit command length to prevent ReDoS attacks
  if (trimmed.length > MAX_COMMAND_LENGTH) {
    throw new Error(`Command too long (max ${MAX_COMMAND_LENGTH} characters)`);
  }

  // Check for output redirection operators (must come before input redirection check)
  // Use more specific regex to prevent ReDoS
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

  // Check for input redirection operators
  // Use more specific regex to prevent ReDoS
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

export function parseChainedCommand(input: string): ChainedCommand | ParsedCommand {
  const trimmed = input.trim();

  // Security: Limit command length to prevent ReDoS attacks
  if (trimmed.length > MAX_COMMAND_LENGTH) {
    throw new Error(`Command too long (max ${MAX_COMMAND_LENGTH} characters)`);
  }

  // Check for command chaining operators
  const chainRegex = /(\|\||&&|;)/g;
  const matches = [...trimmed.matchAll(chainRegex)];

  if (matches.length === 0) {
    // No chaining operators, return single command
    return parseCommand(trimmed);
  }

  // Parse chained commands
  const commands: ParsedCommand[] = [];
  const operators: ('&&' | '||' | ';')[] = [];

  let lastIndex = 0;
  for (const match of matches) {
    const commandStr = trimmed.slice(lastIndex, match.index).trim();
    if (commandStr) {
      commands.push(parseCommand(commandStr));
    }
    operators.push(match[1] as '&&' | '||' | ';');
    lastIndex = match.index! + match[0].length;
  }

  // Add the last command
  const lastCommandStr = trimmed.slice(lastIndex).trim();
  if (lastCommandStr) {
    commands.push(parseCommand(lastCommandStr));
  }

  // Validate we have the right number of operators
  if (operators.length !== commands.length - 1) {
    throw new Error('Invalid command chain syntax');
  }

  return {
    commands,
    operators,
  };
}
