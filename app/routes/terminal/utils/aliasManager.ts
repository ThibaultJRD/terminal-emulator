/**
 * AliasManager - Manages command aliases for the terminal emulator
 *
 * This class handles:
 * - Storage and retrieval of command aliases
 * - Alias resolution with loop detection
 * - Persistence integration with localStorage
 * - Parameter substitution in alias definitions
 */

export interface AliasDefinition {
  name: string;
  command: string;
  createdAt: Date;
}

export class AliasManager {
  private aliases: Map<string, AliasDefinition> = new Map();
  private readonly maxRecursionDepth = 10;

  /**
   * Creates a new alias
   * @param name - The alias name
   * @param command - The command to alias
   * @returns Success status
   */
  setAlias(name: string, command: string): boolean {
    // Validate alias name
    if (!this.isValidAliasName(name)) {
      return false;
    }

    // Validate command
    if (!command || command.trim().length === 0) {
      return false;
    }

    const alias: AliasDefinition = {
      name,
      command: command.trim(),
      createdAt: new Date(),
    };

    this.aliases.set(name, alias);
    return true;
  }

  /**
   * Removes an alias
   * @param name - The alias name to remove
   * @returns Success status
   */
  removeAlias(name: string): boolean {
    return this.aliases.delete(name);
  }

  /**
   * Gets a specific alias
   * @param name - The alias name
   * @returns The alias definition or null if not found
   */
  getAlias(name: string): AliasDefinition | null {
    return this.aliases.get(name) || null;
  }

  /**
   * Gets all aliases
   * @returns Array of all alias definitions
   */
  getAllAliases(): AliasDefinition[] {
    return Array.from(this.aliases.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Checks if an alias exists
   * @param name - The alias name
   * @returns True if alias exists
   */
  hasAlias(name: string): boolean {
    return this.aliases.has(name);
  }

  /**
   * Resolves an alias to its command with loop detection
   * @param name - The alias name
   * @param args - Arguments to substitute in the alias command
   * @returns The resolved command or null if not found/circular
   */
  resolveAlias(name: string, args: string[] = []): string | null {
    return this.resolveAliasRecursive(name, args, new Set(), 0);
  }

  /**
   * Clears all aliases
   */
  clearAliases(): void {
    this.aliases.clear();
  }

  /**
   * Gets aliases as a serializable object for persistence
   * @returns Serializable aliases object
   */
  serialize(): Record<string, { command: string; createdAt: string }> {
    const result: Record<string, { command: string; createdAt: string }> = {};

    for (const [name, alias] of this.aliases) {
      result[name] = {
        command: alias.command,
        createdAt: alias.createdAt.toISOString(),
      };
    }

    return result;
  }

  /**
   * Restores aliases from serialized data
   * @param data - Serialized aliases data
   */
  deserialize(data: Record<string, { command: string; createdAt: string }>): void {
    this.aliases.clear();

    for (const [name, serializedAlias] of Object.entries(data)) {
      if (this.isValidAliasName(name) && serializedAlias.command) {
        const alias: AliasDefinition = {
          name,
          command: serializedAlias.command,
          createdAt: new Date(serializedAlias.createdAt),
        };
        this.aliases.set(name, alias);
      }
    }
  }

  /**
   * Gets alias names for autocompletion
   * @returns Array of alias names
   */
  getAliasNames(): string[] {
    return Array.from(this.aliases.keys()).sort();
  }

  private resolveAliasRecursive(name: string, args: string[], visited: Set<string>, depth: number): string | null {
    // Check recursion depth
    if (depth >= this.maxRecursionDepth) {
      return null;
    }

    // Check for circular reference
    if (visited.has(name)) {
      return null;
    }

    const alias = this.aliases.get(name);
    if (!alias) {
      return null;
    }

    // Mark as visited
    visited.add(name);

    // Substitute parameters in the command
    let resolvedCommand = this.substituteParameters(alias.command, args);

    // Check if the resolved command starts with another alias
    const parts = resolvedCommand.split(' ');
    const firstWord = parts[0];
    if (this.aliases.has(firstWord)) {
      const remainingArgs = parts.slice(1);
      const nestedResolution = this.resolveAliasRecursive(firstWord, remainingArgs, visited, depth + 1);

      if (nestedResolution === null) {
        // Circular reference or max depth reached
        return null;
      }

      if (nestedResolution) {
        resolvedCommand = nestedResolution;
      }
    }

    // Remove from visited set (backtrack)
    visited.delete(name);

    return resolvedCommand;
  }

  private substituteParameters(command: string, args: string[]): string {
    let result = command;
    let hasSubstitution = false;

    // Replace $1, $2, etc. with corresponding arguments
    for (let i = 0; i < args.length; i++) {
      const placeholder = `$${i + 1}`;
      const regex = new RegExp(`\\${placeholder}`, 'g');
      if (regex.test(result)) {
        hasSubstitution = true;
        result = result.replace(regex, args[i]);
      }
    }

    // Replace $* with all arguments
    if (result.includes('$*')) {
      hasSubstitution = true;
      result = result.replace(/\$\*/g, args.join(' '));
    }

    // Replace $@ with all arguments (same as $* in this simple implementation)
    if (result.includes('$@')) {
      hasSubstitution = true;
      result = result.replace(/\$@/g, args.join(' '));
    }

    // If there are arguments and no parameter substitution was done, append them
    if (args.length > 0 && !hasSubstitution) {
      result = result + ' ' + args.join(' ');
    }

    return result;
  }

  private isValidAliasName(name: string): boolean {
    // Check if name is empty or contains invalid characters
    if (!name || name.trim().length === 0) {
      return false;
    }

    // Check for reserved characters and patterns
    // Note: . is allowed for aliases like .. (cd ..)
    const reservedChars = /[<>|&;(){}[\]$`"'\\\/\s\-]/;
    if (reservedChars.test(name)) {
      return false;
    }

    // Check length limits
    if (name.length > 100) {
      return false;
    }

    // Check if it starts with a number (bash-like behavior)
    if (/^[0-9]/.test(name)) {
      return false;
    }

    return true;
  }
}
