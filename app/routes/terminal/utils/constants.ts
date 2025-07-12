/**
 * Shared constants for terminal utilities
 */

/**
 * Regex pattern for detecting command chaining operators (&&, ||, ;, |)
 * Used in both command parsing and autocompletion
 * Note: || must come before | in the alternation to match correctly
 */
export const CHAIN_REGEX = /(\|\||&&|;|\|)/g;
