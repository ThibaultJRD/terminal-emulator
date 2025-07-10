/**
 * Shared constants for terminal utilities
 */

/**
 * Regex pattern for detecting command chaining operators (&&, ||, ;)
 * Used in both command parsing and autocompletion
 */
export const CHAIN_REGEX = /(\|\||&&|;)/g;
