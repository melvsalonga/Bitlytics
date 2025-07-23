import { nanoid } from 'nanoid'

/**
 * Generate a unique short code for URLs
 * @param length - Length of the short code (default: 6)
 * @returns A random short code
 */
export function generateShortCode(length: number = 6): string {
  // Use nanoid with URL-safe alphabet
  return nanoid(length)
}

/**
 * Validate if a custom short code is valid
 * @param code - The custom code to validate
 * @returns boolean indicating if the code is valid
 */
export function isValidCustomCode(code: string): boolean {
  // Allow alphanumeric characters and hyphens, 3-20 characters
  const regex = /^[a-zA-Z0-9-]{3,20}$/
  return regex.test(code)
}

/**
 * Check if a code is reserved (system routes)
 * @param code - The code to check
 * @returns boolean indicating if the code is reserved
 */
export function isReservedCode(code: string): boolean {
  const reservedCodes = [
    'api', 'admin', 'auth', 'dashboard', 'analytics', 
    'login', 'register', 'logout', 'profile', 'settings',
    'help', 'about', 'contact', 'terms', 'privacy'
  ]
  return reservedCodes.includes(code.toLowerCase())
}
