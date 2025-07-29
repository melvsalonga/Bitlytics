import { NextRequest, NextResponse } from 'next/server'
import { isIPBlacklisted, getClientIP, checkAndBlacklistSuspiciousIP } from './src/lib/ip-blacklist'
import { checkRateLimit, createRateLimitResponse } from './src/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ip = getClientIP(request)

  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  try {
    // 1. Check if IP is blacklisted
    const blacklistResult = await isIPBlacklisted(ip)
    if (blacklistResult.isBlacklisted) {
      console.log(`Blocked blacklisted IP: ${ip} - Reason: ${blacklistResult.reason}`)
      
      return NextResponse.json(
        {
          error: 'Access Denied',
          message: 'Your IP address has been blocked due to suspicious activity.',
          reason: blacklistResult.reason,
          expiresAt: blacklistResult.expiresAt,
        },
        { status: 403 }
      )
    }

    // 2. Apply rate limiting based on route
    let rateLimitType: 'api' | 'auth' | 'urlShorten' | 'urlRedirect' | 'analytics' = 'api'
    
    if (pathname.startsWith('/api/auth/')) {
      rateLimitType = 'auth'
    } else if (pathname.startsWith('/api/urls') && request.method === 'POST') {
      rateLimitType = 'urlShorten'
    } else if (pathname.startsWith('/api/analytics')) {
      rateLimitType = 'analytics'
    } else if (pathname.match(/^\/[a-zA-Z0-9]{6,10}$/)) {
      // This is likely a short URL redirect
      rateLimitType = 'urlRedirect'
    }

    const rateLimitResult = await checkRateLimit(request, rateLimitType)
    
    if (!rateLimitResult.success) {
      console.log(`Rate limit exceeded for IP: ${ip} - Type: ${rateLimitType}`)
      
      // Track suspicious activity for potential auto-blacklisting
      await checkAndBlacklistSuspiciousIP(ip, 'rate_limit_exceeded')
      
      return createRateLimitResponse(rateLimitResult)
    }

    // 3. Add security headers to response
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    // Content Security Policy
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; ')
    
    response.headers.set('Content-Security-Policy', cspHeader)
    
    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.getTime().toString())

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    // If middleware fails, let the request continue but log the error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
