import type { FileSystemState } from '~/routes/terminal/types/filesystem';
import { type FilesystemMode, loadEnvironmentVariables, saveEnvironmentVariables } from '~/routes/terminal/utils/persistence';

export interface EnvironmentManager {
  set(name: string, value: string): boolean;
  get(name: string): string | undefined;
  unset(name: string): boolean;
  getAll(): Record<string, string>;
  substitute(text: string): string;
  updatePWD(currentPath: string[]): void;
  exportToLocalStorage(): Record<string, string>;
  importFromLocalStorage(data: Record<string, string>): void;
  saveToStorage(mode: FilesystemMode): boolean;
}

// Security constants
const MAX_VARIABLE_NAME_LENGTH = 100;
const MAX_VARIABLE_VALUE_LENGTH = 1000;
const MAX_VARIABLES_COUNT = 100;

// Valid variable name pattern (alphanumeric + underscore, cannot start with digit)
const VARIABLE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

// Reserved variables that cannot be unset
const RESERVED_VARIABLES = new Set(['HOME', 'USER', 'SHELL', 'TERM']);

export class DefaultEnvironmentManager implements EnvironmentManager {
  private variables: Map<string, string> = new Map();
  private currentMode: FilesystemMode;

  constructor(filesystem?: FileSystemState, mode: FilesystemMode = 'default') {
    this.currentMode = mode;
    this.initializeDefaultVariables(filesystem);
    this.loadSavedVariables(mode);
  }

  private initializeDefaultVariables(filesystem?: FileSystemState): void {
    // Set default environment variables
    this.variables.set('HOME', '/home/user');
    this.variables.set('USER', 'user');
    this.variables.set('SHELL', '/bin/bash');
    this.variables.set('TERM', 'terminal-emulator');
    this.variables.set('PATH', '/usr/bin:/bin:/usr/local/bin');
    this.variables.set('LANG', 'en_US.UTF-8');
    this.variables.set('PWD', this.formatPath(filesystem?.currentPath || []));

    // Terminal-specific variables
    this.variables.set('TERMINAL_VERSION', '1.0.0');
    this.variables.set('EDITOR', 'vi');
  }

  private formatPath(path: string[]): string {
    if (path.length === 0) {
      return '/';
    }
    return '/' + path.join('/');
  }

  private validateVariableName(name: string): { valid: boolean; error?: string } {
    if (name.length === 0) {
      return { valid: false, error: 'Variable name cannot be empty' };
    }

    if (name.length > MAX_VARIABLE_NAME_LENGTH) {
      return { valid: false, error: `Variable name too long (max ${MAX_VARIABLE_NAME_LENGTH} characters)` };
    }

    if (!VARIABLE_NAME_REGEX.test(name)) {
      return { valid: false, error: 'Invalid variable name. Must start with letter or underscore, contain only alphanumeric characters and underscores' };
    }

    return { valid: true };
  }

  private validateVariableValue(value: string): { valid: boolean; error?: string } {
    if (value.length > MAX_VARIABLE_VALUE_LENGTH) {
      return { valid: false, error: `Variable value too long (max ${MAX_VARIABLE_VALUE_LENGTH} characters)` };
    }

    return { valid: true };
  }

  set(name: string, value: string): boolean {
    // Validate name
    const nameValidation = this.validateVariableName(name);
    if (!nameValidation.valid) {
      return false;
    }

    // Validate value
    const valueValidation = this.validateVariableValue(value);
    if (!valueValidation.valid) {
      return false;
    }

    // Check variables count limit
    if (!this.variables.has(name) && this.variables.size >= MAX_VARIABLES_COUNT) {
      return false;
    }

    this.variables.set(name, value);
    return true;
  }

  get(name: string): string | undefined {
    return this.variables.get(name);
  }

  unset(name: string): boolean {
    // Validate name
    const nameValidation = this.validateVariableName(name);
    if (!nameValidation.valid) {
      return false;
    }

    // Prevent unsetting reserved variables
    if (RESERVED_VARIABLES.has(name)) {
      return false;
    }

    return this.variables.delete(name);
  }

  getAll(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of this.variables) {
      result[key] = value;
    }
    return result;
  }

  substitute(text: string): string {
    // Replace $VAR and ${VAR} patterns with their values
    return text.replace(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, braced, simple) => {
      const varName = braced || simple;
      const value = this.variables.get(varName);
      return value !== undefined ? value : match; // Keep original if variable not found
    });
  }

  updatePWD(currentPath: string[]): void {
    this.variables.set('PWD', this.formatPath(currentPath));
  }

  exportToLocalStorage(): Record<string, string> {
    const result: Record<string, string> = {};

    // Only export non-default variables (user-defined ones)
    const defaultVars = new Set(['HOME', 'USER', 'SHELL', 'TERM', 'PATH', 'LANG', 'PWD', 'TERMINAL_VERSION', 'EDITOR']);

    for (const [key, value] of this.variables) {
      if (!defaultVars.has(key)) {
        result[key] = value;
      }
    }

    return result;
  }

  importFromLocalStorage(data: Record<string, string>): void {
    // Import user-defined variables from localStorage
    for (const [key, value] of Object.entries(data)) {
      const nameValidation = this.validateVariableName(key);
      const valueValidation = this.validateVariableValue(value);

      if (nameValidation.valid && valueValidation.valid) {
        this.variables.set(key, value);
      }
    }
  }

  private loadSavedVariables(mode: FilesystemMode): void {
    try {
      const savedVariables = loadEnvironmentVariables(mode);
      for (const [key, value] of Object.entries(savedVariables)) {
        this.variables.set(key, value);
      }
    } catch (error) {
      console.warn('Failed to load saved environment variables:', error);
    }
  }

  saveToStorage(mode: FilesystemMode): boolean {
    try {
      const userVariables = this.exportToLocalStorage();
      return saveEnvironmentVariables(userVariables, mode);
    } catch (error) {
      console.error('Failed to save environment variables:', error);
      return false;
    }
  }
}

/**
 * Creates a new environment manager instance
 */
export function createEnvironmentManager(filesystem?: FileSystemState, mode: FilesystemMode = 'default'): EnvironmentManager {
  return new DefaultEnvironmentManager(filesystem, mode);
}

/**
 * Validates an environment variable assignment string (VAR=value format)
 */
export function parseVariableAssignment(assignment: string): { name: string; value: string } | null {
  const match = assignment.match(/^([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/);
  if (!match) {
    return null;
  }

  const [, name, value] = match;
  return { name, value };
}

/**
 * Extracts variable references from a string
 */
export function extractVariableReferences(text: string): string[] {
  const variables: string[] = [];
  const matches = text.matchAll(/\$\{([^}]+)\}|\$([a-zA-Z_][a-zA-Z0-9_]*)/g);

  for (const match of matches) {
    const varName = match[1] || match[2];
    if (varName && !variables.includes(varName)) {
      variables.push(varName);
    }
  }

  return variables;
}
