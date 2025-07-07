/**
 * Unicode-safe Base64 encoding and decoding utilities
 *
 * These functions properly handle Unicode characters (including emojis)
 * by using TextEncoder/TextDecoder for UTF-8 conversion before Base64 encoding.
 */

/**
 * Encodes a Unicode string to Base64 safely
 * @param str - The string to encode (can contain Unicode characters)
 * @returns Base64 encoded string
 */
export function unicodeSafeBtoa(str: string): string {
  // Convert string to UTF-8 bytes using TextEncoder
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);

  // Convert bytes to binary string
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  // Use standard btoa on the binary string (now Latin-1 safe)
  return btoa(binary);
}

/**
 * Decodes a Base64 string to Unicode safely
 * @param base64 - The Base64 string to decode
 * @returns The decoded Unicode string
 */
export function unicodeSafeAtob(base64: string): string {
  // Decode Base64 to binary string
  const binary = atob(base64);

  // Convert binary string back to bytes
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  // Convert bytes to UTF-8 string using TextDecoder
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}
