import { validateAndNormalizeUrl, extractDomain } from '../url-validator'

describe('url-validator utilities', () => {
  describe('validateAndNormalizeUrl', () => {
    it('should validate and normalize valid HTTP URLs', () => {
      const result = validateAndNormalizeUrl('http://example.com')
      expect(result.isValid).toBe(true)
      expect(result.normalizedUrl).toBe('http://example.com/')
      expect(result.error).toBeUndefined()
    })

    it('should validate and normalize valid HTTPS URLs', () => {
      const result = validateAndNormalizeUrl('https://example.com')
      expect(result.isValid).toBe(true)
      expect(result.normalizedUrl).toBe('https://example.com/')
    })

    it('should add HTTPS protocol to URLs without protocol', () => {
      const result = validateAndNormalizeUrl('example.com')
      expect(result.isValid).toBe(true)
      expect(result.normalizedUrl).toBe('https://example.com/')
    })

    it('should handle URLs with paths and query parameters', () => {
      const result = validateAndNormalizeUrl('https://example.com/path?param=value')
      expect(result.isValid).toBe(true)
      expect(result.normalizedUrl).toBe('https://example.com/path?param=value')
    })

    it('should trim whitespace from URLs', () => {
      const result = validateAndNormalizeUrl('  https://example.com  ')
      expect(result.isValid).toBe(true)
      expect(result.normalizedUrl).toBe('https://example.com/')
    })

    it('should reject empty URLs', () => {
      const result = validateAndNormalizeUrl('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL cannot be empty')
    })

    it('should reject URLs with only whitespace', () => {
      const result = validateAndNormalizeUrl('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('URL cannot be empty')
    })

    it('should reject invalid protocols', () => {
      const result = validateAndNormalizeUrl('ftp://example.com')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Only HTTP and HTTPS protocols are allowed')
    })

    it('should accept valid hostnames', () => {
      const result = validateAndNormalizeUrl('not-a-url')
      expect(result.isValid).toBe(true)
      expect(result.normalizedUrl).toBe('https://not-a-url/')
    })

    it('should reject URLs with very short domains', () => {
      const result = validateAndNormalizeUrl('https://ab')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid domain name')
    })

    describe('production environment restrictions', () => {
      const originalNodeEnv = process.env.NODE_ENV

      beforeEach(() => {
        process.env.NODE_ENV = 'production'
      })

      afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv
      })

      it('should reject localhost URLs in production', () => {
        const result = validateAndNormalizeUrl('http://localhost:3000')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Private and localhost URLs are not allowed')
      })

      it('should reject private IP ranges in production', () => {
        const privateIPs = [
          'http://127.0.0.1',
          'http://10.0.0.1',
          'http://172.16.0.1',
          'http://192.168.1.1'
        ]

        privateIPs.forEach(ip => {
          const result = validateAndNormalizeUrl(ip)
          expect(result.isValid).toBe(false)
          expect(result.error).toBe('Private and localhost URLs are not allowed')
        })
      })
    })

    describe('development environment', () => {
      const originalNodeEnv = process.env.NODE_ENV

      beforeEach(() => {
        process.env.NODE_ENV = 'development'
      })

      afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv
      })

      it('should allow localhost URLs in development', () => {
        const result = validateAndNormalizeUrl('http://localhost:3000')
        expect(result.isValid).toBe(true)
        expect(result.normalizedUrl).toBe('http://localhost:3000/')
      })

      it('should allow private IP ranges in development', () => {
        const result = validateAndNormalizeUrl('http://192.168.1.1')
        expect(result.isValid).toBe(true)
        expect(result.normalizedUrl).toBe('http://192.168.1.1/')
      })
    })

    it('should handle complex URLs with all components', () => {
      const complexUrl = 'https://user:pass@example.com:8080/path/to/resource?param1=value1&param2=value2#section'
      const result = validateAndNormalizeUrl(complexUrl)
      expect(result.isValid).toBe(true)
      expect(result.normalizedUrl).toBe(complexUrl)
    })
  })

  describe('extractDomain', () => {
    it('should extract domain from HTTPS URLs', () => {
      const domain = extractDomain('https://example.com/path')
      expect(domain).toBe('example.com')
    })

    it('should extract domain from HTTP URLs', () => {
      const domain = extractDomain('http://example.com')
      expect(domain).toBe('example.com')
    })

    it('should extract domain with subdomains', () => {
      const domain = extractDomain('https://www.subdomain.example.com')
      expect(domain).toBe('www.subdomain.example.com')
    })

    it('should extract domain from URLs with ports', () => {
      const domain = extractDomain('https://example.com:8080/path')
      expect(domain).toBe('example.com')
    })

    it('should extract domain from URLs with authentication', () => {
      const domain = extractDomain('https://user:pass@example.com/path')
      expect(domain).toBe('example.com')
    })

    it('should return original string for invalid URLs', () => {
      const invalidUrl = 'not-a-url'
      const result = extractDomain(invalidUrl)
      expect(result).toBe(invalidUrl)
    })

    it('should handle empty strings gracefully', () => {
      const result = extractDomain('')
      expect(result).toBe('')
    })

    it('should extract localhost', () => {
      const domain = extractDomain('http://localhost:3000')
      expect(domain).toBe('localhost')
    })

    it('should extract IP addresses', () => {
      const domain = extractDomain('http://192.168.1.1:8080')
      expect(domain).toBe('192.168.1.1')
    })
  })
})
