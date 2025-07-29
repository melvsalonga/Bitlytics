import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Create Redis instance for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_PASSWORD || '',
})

// Different rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting - 100 requests per 15 minutes
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '15 m'),
    analytics: true,
  }),

  // Authentication endpoints - 10 attempts per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'),
    analytics: true,
  }),

  // URL shortening - 20 URLs per hour
  urlShorten: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    analytics: true,
  }),

  // URL redirects - 1000 redirects per minute (high traffic)
  urlRedirect: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 m'),
    analytics: true,
  }),

  // Analytics endpoints - 60 requests per minute
  analytics: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
  }),
}

// IP-based rate limiting
export async function checkRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters = 'api'
): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: Date
}> {
  try {
    const ip = getClientIP(request)
    const limiter = rateLimiters[limiterType]
    
    const { success, limit, remaining, reset } = await limiter.limit(ip)
    
    return {
      success,
      limit,
      remaining,
      reset: new Date(reset),
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    // If Redis is down, allow the request but log the error
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
    }
  }
}

// Get client IP address with proxy support
function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers (for production with proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) return realIP
  if (cfConnectingIP) return cfConnectingIP
  
  // Fallback for development
  return '127.0.0.1'
}

// Rate limit response helper
export function createRateLimitResponse(rateLimitResult: {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}): NextResponse {
  const response = NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.reset.toISOString(),
    },
    { status: 429 }
  )

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.getTime().toString())
  response.headers.set('Retry-After', Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString())

  return response
}

// Middleware helper for API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiterType: keyof typeof rateLimiters = 'api'
) {
  return async (req: NextRequest) => {
    const rateLimitResult = await checkRateLimit(req, limiterType)
    
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult)
    }

    // Add rate limit headers to successful responses
    const response = await handler(req)
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.getTime().toString())

    return response
  }
}
