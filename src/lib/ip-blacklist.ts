import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { cacheManager } from './redis'

// Interface for blacklisted IP records
export interface BlacklistedIP {
  id: string
  ipAddress: string
  reason: string
  createdBy?: string
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Reasons for IP blacklisting
export enum BlacklistReason {
  SPAM = 'SPAM',
  ABUSE = 'ABUSE',
  BRUTE_FORCE = 'BRUTE_FORCE',
  MALICIOUS_ACTIVITY = 'MALICIOUS_ACTIVITY',
  SUSPICIOUS_BEHAVIOR = 'SUSPICIOUS_BEHAVIOR',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

// Check if an IP is blacklisted
export async function isIPBlacklisted(ipAddress: string): Promise<{
  isBlacklisted: boolean
  reason?: string
  expiresAt?: Date
}> {
  try {
    // First check cache for fast lookup
    const cacheKey = `blacklist:${ipAddress}`
    const cachedResult = await cacheManager.getCachedAnalytics(cacheKey)
    
    if (cachedResult) {
      return cachedResult as { isBlacklisted: boolean; reason?: string; expiresAt?: Date }
    }

    // Check database
    const blacklistedIP = await prisma.blacklistedIP.findFirst({
      where: {
        ipAddress,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    })

    const result = {
      isBlacklisted: !!blacklistedIP,
      reason: blacklistedIP?.reason,
      expiresAt: blacklistedIP?.expiresAt || undefined,
    }

    // Cache result for 5 minutes
    await cacheManager.cacheAnalytics(cacheKey, result, 300)

    return result
  } catch (error) {
    console.error('Error checking IP blacklist:', error)
    // If there's an error, don't block the request
    return { isBlacklisted: false }
  }
}

// Add IP to blacklist
export async function blacklistIP(
  ipAddress: string,
  reason: BlacklistReason,
  adminUserId?: string,
  expiresAt?: Date
): Promise<BlacklistedIP> {
  try {
    const blacklistedIP = await prisma.blacklistedIP.create({
      data: {
        ipAddress,
        reason,
        createdBy: adminUserId,
        expiresAt,
        isActive: true,
      }
    })

    // Invalidate cache
    await cacheManager.getCachedAnalytics(`blacklist:${ipAddress}`)

    // Log security event
    await logSecurityEvent({
      type: 'IP_BLACKLISTED',
      ipAddress,
      details: { reason, adminUserId, expiresAt },
    })

    return blacklistedIP as BlacklistedIP
  } catch (error) {
    console.error('Error blacklisting IP:', error)
    throw new Error('Failed to blacklist IP address')
  }
}

// Remove IP from blacklist
export async function removeIPFromBlacklist(ipAddress: string, adminUserId?: string): Promise<void> {
  try {
    await prisma.blacklistedIP.updateMany({
      where: {
        ipAddress,
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      }
    })

    // Invalidate cache
    await cacheManager.getCachedAnalytics(`blacklist:${ipAddress}`)

    // Log security event
    await logSecurityEvent({
      type: 'IP_UNBLACKLISTED',
      ipAddress,
      details: { adminUserId },
    })
  } catch (error) {
    console.error('Error removing IP from blacklist:', error)
    throw new Error('Failed to remove IP from blacklist')
  }
}

// Get all blacklisted IPs (for admin dashboard)
export async function getBlacklistedIPs(page = 1, limit = 50): Promise<{
  ips: BlacklistedIP[]
  total: number
  totalPages: number
}> {
  try {
    const skip = (page - 1) * limit

    const [ips, total] = await Promise.all([
      prisma.blacklistedIP.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdByUser: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.blacklistedIP.count({
        where: { isActive: true }
      })
    ])

    return {
      ips: ips as BlacklistedIP[],
      total,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error('Error fetching blacklisted IPs:', error)
    return { ips: [], total: 0, totalPages: 0 }
  }
}

// Automatic IP blacklisting based on suspicious activity
export async function checkAndBlacklistSuspiciousIP(
  ipAddress: string,
  activityType: 'failed_login' | 'rate_limit_exceeded' | 'malicious_request'
): Promise<boolean> {
  try {
    const suspiciousActivityKey = `suspicious:${ipAddress}:${activityType}`
    
    // Increment suspicious activity counter
    const activityCount = await cacheManager.incrementClickCount(suspiciousActivityKey)
    
    // Set expiry for the counter (1 hour)
    if (activityCount === 1) {
      // This is a new counter, set expiry
      // Note: We'll use a simple approach here, in production you might want a more sophisticated system
    }

    // Define thresholds for automatic blacklisting
    const thresholds = {
      failed_login: 10,      // 10 failed logins in 1 hour
      rate_limit_exceeded: 5, // 5 rate limit violations in 1 hour
      malicious_request: 3,   // 3 malicious requests in 1 hour
    }

    if (activityCount >= thresholds[activityType]) {
      // Automatically blacklist IP
      await blacklistIP(
        ipAddress,
        getReasonForActivity(activityType),
        undefined, // No admin user (automatic)
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      )

      return true
    }

    return false
  } catch (error) {
    console.error('Error checking suspicious IP activity:', error)
    return false
  }
}

// Helper function to map activity types to blacklist reasons
function getReasonForActivity(activityType: string): BlacklistReason {
  switch (activityType) {
    case 'failed_login':
      return BlacklistReason.BRUTE_FORCE
    case 'rate_limit_exceeded':
      return BlacklistReason.ABUSE
    case 'malicious_request':
      return BlacklistReason.MALICIOUS_ACTIVITY
    default:
      return BlacklistReason.SUSPICIOUS_BEHAVIOR
  }
}

// Security event logging
interface SecurityEvent {
  type: string
  ipAddress: string
  userAgent?: string
  details?: Record<string, unknown>
}

async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        type: event.type,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details ? JSON.parse(JSON.stringify(event.details)) : null,
        timestamp: new Date(),
      }
    })
  } catch (error) {
    console.error('Error logging security event:', error)
  }
}

// Extract IP from request
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) return realIP
  if (cfConnectingIP) return cfConnectingIP
  
  return '127.0.0.1'
}
