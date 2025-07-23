/**
 * Validate and normalize URL
 * @param url - The URL to validate
 * @returns Object with isValid boolean and normalized URL
 */
export function validateAndNormalizeUrl(url: string): { isValid: boolean; normalizedUrl?: string; error?: string } {
  try {
    // Remove whitespace
    const trimmedUrl = url.trim()
    
    if (!trimmedUrl) {
      return { isValid: false, error: 'URL cannot be empty' }
    }

    // Add protocol if missing
    const urlWithProtocol = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') 
      ? trimmedUrl 
      : `https://${trimmedUrl}`

    // Create URL object to validate
    const urlObject = new URL(urlWithProtocol)

    // Check for valid protocols
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are allowed' }
    }

    // Check for localhost or private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = urlObject.hostname.toLowerCase()
      const privateIpRegex = /^(localhost|127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/
      
      if (hostname === 'localhost' || privateIpRegex.test(hostname)) {
        return { isValid: false, error: 'Private and localhost URLs are not allowed' }
      }
    }

    // Check for minimum domain length
    if (urlObject.hostname.length < 3) {
      return { isValid: false, error: 'Invalid domain name' }
    }

    return { 
      isValid: true, 
      normalizedUrl: urlObject.toString() 
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid URL format' 
    }
  }
}

/**
 * Extract domain from URL for display purposes
 * @param url - The URL to extract domain from
 * @returns Domain name or the original URL if extraction fails
 */
export function extractDomain(url: string): string {
  try {
    const urlObject = new URL(url)
    return urlObject.hostname
  } catch {
    return url
  }
}
