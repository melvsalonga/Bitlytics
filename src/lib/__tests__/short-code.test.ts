import { generateShortCode, isValidCustomCode, isReservedCode } from '../short-code'

describe('short-code utilities', () => {
  describe('generateShortCode', () => {
    it('should generate a short code with default length of 6', () => {
      const code = generateShortCode()
      expect(code).toHaveLength(6)
      expect(typeof code).toBe('string')
    })

    it('should generate a short code with custom length', () => {
      const customLength = 10
      const code = generateShortCode(customLength)
      expect(code).toHaveLength(customLength)
    })

    it('should generate unique codes on multiple calls', () => {
      const codes = new Set()
      for (let i = 0; i < 100; i++) {
        codes.add(generateShortCode())
      }
      // Should generate at least 99 unique codes out of 100 (allowing for rare collisions)
      expect(codes.size).toBeGreaterThan(98)
    })

    it('should generate URL-safe characters only', () => {
      const code = generateShortCode(20)
      // nanoid default alphabet is URL-safe
      expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
    })
  })

  describe('isValidCustomCode', () => {
    it('should accept valid alphanumeric codes', () => {
      expect(isValidCustomCode('abc123')).toBe(true)
      expect(isValidCustomCode('ABC123')).toBe(true)
      expect(isValidCustomCode('myLink')).toBe(true)
    })

    it('should accept codes with hyphens', () => {
      expect(isValidCustomCode('my-link')).toBe(true)
      expect(isValidCustomCode('test-123')).toBe(true)
      expect(isValidCustomCode('a-b-c')).toBe(true)
    })

    it('should reject codes that are too short', () => {
      expect(isValidCustomCode('ab')).toBe(false)
      expect(isValidCustomCode('a')).toBe(false)
      expect(isValidCustomCode('')).toBe(false)
    })

    it('should reject codes that are too long', () => {
      const longCode = 'a'.repeat(21)
      expect(isValidCustomCode(longCode)).toBe(false)
    })

    it('should reject codes with invalid characters', () => {
      expect(isValidCustomCode('test_123')).toBe(false) // underscore
      expect(isValidCustomCode('test.123')).toBe(false) // dot
      expect(isValidCustomCode('test 123')).toBe(false) // space
      expect(isValidCustomCode('test@123')).toBe(false) // special character
      expect(isValidCustomCode('test/123')).toBe(false) // slash
    })

    it('should accept codes at boundary lengths', () => {
      expect(isValidCustomCode('abc')).toBe(true) // minimum length
      expect(isValidCustomCode('a'.repeat(20))).toBe(true) // maximum length
    })
  })

  describe('isReservedCode', () => {
    it('should identify reserved system routes', () => {
      const reservedCodes = [
        'api', 'admin', 'auth', 'dashboard', 'analytics',
        'login', 'register', 'logout', 'profile', 'settings',
        'help', 'about', 'contact', 'terms', 'privacy'
      ]

      reservedCodes.forEach(code => {
        expect(isReservedCode(code)).toBe(true)
      })
    })

    it('should be case insensitive', () => {
      expect(isReservedCode('API')).toBe(true)
      expect(isReservedCode('Admin')).toBe(true)
      expect(isReservedCode('DASHBOARD')).toBe(true)
      expect(isReservedCode('Login')).toBe(true)
    })

    it('should not flag non-reserved codes', () => {
      expect(isReservedCode('mylink')).toBe(false)
      expect(isReservedCode('test123')).toBe(false)
      expect(isReservedCode('custom-url')).toBe(false)
      expect(isReservedCode('github')).toBe(false)
    })

    it('should handle empty and invalid inputs', () => {
      expect(isReservedCode('')).toBe(false)
      expect(isReservedCode(' ')).toBe(false)
      expect(isReservedCode('  api  ')).toBe(false) // with spaces
    })
  })
})
