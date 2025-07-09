/**
 * Shell Script Parser - Parses basic shell script constructs
 *
 * This parser handles:
 * - Alias definitions (alias name='command')
 * - Comments (# comment)
 * - Empty lines
 * - Basic environment variable assignments (export VAR=value)
 * - Simple command execution
 */
import type { AliasManager } from '~/routes/terminal/utils/aliasManager';

export interface ParsedLine {
  type: 'alias' | 'export' | 'command' | 'comment' | 'empty' | 'error';
  content: string;
  alias?: {
    name: string;
    command: string;
  };
  export?: {
    name: string;
    value: string;
  };
  command?: string;
  error?: string;
}

export interface ShellParseResult {
  lines: ParsedLine[];
  errors: string[];
  aliasCount: number;
  exportCount: number;
  commandCount: number;
}

export class ShellParser {
  /**
   * Parses a shell script content line by line
   * @param content - The shell script content
   * @returns Parsed result with lines and statistics
   */
  static parse(content: string): ShellParseResult {
    if (!content) {
      return {
        lines: [],
        errors: [],
        aliasCount: 0,
        exportCount: 0,
        commandCount: 0,
      };
    }

    const lines = content.split('\n');
    const parsedLines: ParsedLine[] = [];
    const errors: string[] = [];
    let aliasCount = 0;
    let exportCount = 0;
    let commandCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i];
      const parsedLine = this.parseLine(line.trim(), lineNumber);

      parsedLines.push(parsedLine);

      if (parsedLine.type === 'alias') {
        aliasCount++;
      } else if (parsedLine.type === 'export') {
        exportCount++;
      } else if (parsedLine.type === 'command') {
        commandCount++;
      } else if (parsedLine.type === 'error') {
        errors.push(`Line ${lineNumber}: ${parsedLine.error}`);
      }
    }

    return {
      lines: parsedLines,
      errors,
      aliasCount,
      exportCount,
      commandCount,
    };
  }

  /**
   * Executes a parsed shell script by applying aliases and commands
   * @param parseResult - The parsed shell script result
   * @param aliasManager - The alias manager to register aliases
   * @returns Execution result with applied changes and any errors
   */
  static execute(
    parseResult: ShellParseResult,
    aliasManager: AliasManager,
  ): {
    success: boolean;
    appliedAliases: string[];
    errors: string[];
  } {
    const appliedAliases: string[] = [];
    const errors: string[] = [...parseResult.errors]; // Include parse errors

    for (const parsedLine of parseResult.lines) {
      if (parsedLine.type === 'alias' && parsedLine.alias) {
        const success = aliasManager.setAlias(parsedLine.alias.name, parsedLine.alias.command);
        if (success) {
          appliedAliases.push(parsedLine.alias.name);
        } else {
          errors.push(`Failed to set alias: ${parsedLine.alias.name}`);
        }
      }
      // Note: We don't execute commands or exports for security reasons
      // This is a simplified implementation focused on alias management
    }

    return {
      success: errors.length === 0,
      appliedAliases,
      errors,
    };
  }

  private static parseLine(line: string, lineNumber: number): ParsedLine {
    // Handle empty lines
    if (line.length === 0) {
      return {
        type: 'empty',
        content: line,
      };
    }

    // Handle comments
    if (line.startsWith('#')) {
      return {
        type: 'comment',
        content: line,
      };
    }

    // Handle alias definitions
    const aliasMatch = line.match(/^alias\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*['"](.*)['"]$/);
    if (aliasMatch) {
      const [, name, command] = aliasMatch;
      const validation = this.validateAlias(name, command);
      if (!validation.valid) {
        return {
          type: 'error',
          content: line,
          error: validation.error,
        };
      }
      return {
        type: 'alias',
        content: line,
        alias: {
          name,
          command,
        },
      };
    }

    // Handle alias definitions without quotes (less common but valid)
    const aliasNoQuotesMatch = line.match(/^alias\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (aliasNoQuotesMatch) {
      const [, name, command] = aliasNoQuotesMatch;
      const validation = this.validateAlias(name, command);
      if (!validation.valid) {
        return {
          type: 'error',
          content: line,
          error: validation.error,
        };
      }
      return {
        type: 'alias',
        content: line,
        alias: {
          name,
          command: command.trim(),
        },
      };
    }

    // Handle export statements
    const exportMatch = line.match(/^export\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*['"]?([^'"]*)['"]?$/);
    if (exportMatch) {
      const [, name, value] = exportMatch;
      return {
        type: 'export',
        content: line,
        export: {
          name,
          value,
        },
      };
    }

    // Handle potential alias syntax errors
    if (line.startsWith('alias ')) {
      return {
        type: 'error',
        content: line,
        error: "Invalid alias syntax. Use: alias name='command'",
      };
    }

    // Handle other commands (we don't execute them for security)
    if (line.trim().length > 0) {
      return {
        type: 'command',
        content: line,
        command: line,
      };
    }

    return {
      type: 'empty',
      content: line,
    };
  }

  /**
   * Validates an alias definition
   * @param name - The alias name
   * @param command - The alias command
   * @returns Validation result
   */
  static validateAlias(
    name: string,
    command: string,
  ): {
    valid: boolean;
    error?: string;
  } {
    // Check alias name
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Alias name cannot be empty' };
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      return { valid: false, error: 'Invalid alias name. Use only letters, numbers, and underscores' };
    }

    // Check command
    if (!command || command.trim().length === 0) {
      return { valid: false, error: 'Alias command cannot be empty' };
    }

    // Check for potentially dangerous constructs
    const dangerousPatterns = [
      /rm\s+-rf\s+\//, // rm -rf /
      /\>\s*\/dev\/null\s*2>&1.*rm/, // Redirecting and removing
      /eval\s*\(/, // eval() execution
      /\$\(.*\)/, // Command substitution (basic check)
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        return { valid: false, error: 'Potentially dangerous command detected' };
      }
    }

    return { valid: true };
  }

  /**
   * Formats an alias definition for display
   * @param name - The alias name
   * @param command - The alias command
   * @returns Formatted alias string
   */
  static formatAlias(name: string, command: string): string {
    // Determine if quotes are needed
    const needsQuotes = /[\s'"\\|&;<>(){}[\]$`]/.test(command);

    if (needsQuotes) {
      // Escape single quotes in the command
      const escapedCommand = command.replace(/'/g, "'\\''");
      return `alias ${name}='${escapedCommand}'`;
    } else {
      return `alias ${name}=${command}`;
    }
  }
}
