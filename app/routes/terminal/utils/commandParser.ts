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

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  
  // Check for output redirection operators (must come before input redirection check)
  const outputRedirectMatch = trimmed.match(/^(.+?)\s*(>>|>)\s*(.+)$/);
  
  if (outputRedirectMatch) {
    const [, commandPart, operator, filename] = outputRedirectMatch;
    const parts = parseArguments(commandPart.trim());
    const command = parts[0];
    const args = parts.slice(1);
    
    return {
      command,
      args,
      redirectOutput: {
        type: operator as '>>' | '>',
        filename: filename.trim().replace(/^["']|["']$/g, ''), // Remove quotes from filename
      },
    };
  }

  // Check for input redirection operators
  const inputRedirectMatch = trimmed.match(/^(.+?)\s*(<<|<)\s*(.+)$/);
  
  if (inputRedirectMatch) {
    const [, commandPart, operator, source] = inputRedirectMatch;
    const parts = parseArguments(commandPart.trim());
    const command = parts[0];
    const args = parts.slice(1);
    
    return {
      command,
      args,
      redirectInput: {
        type: operator as '<<' | '<',
        source: source.trim().replace(/^["']|["']$/g, ''), // Remove quotes from source
      },
    };
  }
  
  // No redirection, parse normally
  const parts = parseArguments(trimmed);
  const command = parts[0];
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
  
  return args.filter(arg => arg.length > 0);
}