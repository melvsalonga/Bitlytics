import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { cacheManager } from '@/lib/redis'

interface Props {
  params: Promise<{ shortCode: string }>
}

async function trackClick(shortUrlId: string, shortCode: string, request: {
  userAgent?: string
  ipAddress: string
  referrer?: string
}) {
  try {
    // Increment click count in cache immediately (fast response)
    await cacheManager.incrementClickCount(shortCode)

    // Create click record asynchronously
    await prisma.click.create({
      data: {
        shortUrlId,
        userAgent: request.userAgent || null,
        ipAddress: request.ipAddress,
        referrer: request.referrer || null,
        // TODO: Add geolocation data (country, city) using IP
      }
    })

    // Update click count in database
    await prisma.shortUrl.update({
      where: { id: shortUrlId },
      data: {
        clickCount: {
          increment: 1
        },
        // TODO: Update uniqueClickCount based on IP tracking
      }
    })
  } catch (error) {
    console.error('Error tracking click:', error)
    // Don't block redirect if analytics fails
  }
}

function getClientIP(headersList: Headers): string {
  // Try to get real IP from various headers (for production with proxies)
  const forwarded = headersList.get('x-forwarded-for')
  const realIP = headersList.get('x-real-ip')
  const cfConnectingIP = headersList.get('cf-connecting-ip')
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) return realIP
  if (cfConnectingIP) return cfConnectingIP
  
  // Fallback for development
  return '127.0.0.1'
}

export default async function RedirectPage({ params }: Props) {
  const { shortCode } = await params
  
  // Get request headers for analytics
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || undefined
  const referrer = headersList.get('referer') || undefined
  const ipAddress = getClientIP(headersList)

  try {
let shortUrl: Awaited<ReturnType<typeof prisma.shortUrl.findUnique>> = null
    let originalUrl: string

    // Try cache first for fastest possible redirect
    const cachedUrl = await cacheManager.getCachedUrl(shortCode)
    
    if (cachedUrl) {
      // Cache hit - super fast redirect
      originalUrl = cachedUrl.originalUrl
      
      // Get full URL data from database for tracking (but don't wait for it)
      prisma.shortUrl.findUnique({
        where: { shortCode: shortCode, isActive: true }
      }).then(dbUrl => {
        if (dbUrl) {
          // Track the click asynchronously
          trackClick(dbUrl.id, shortCode, {
            userAgent,
            ipAddress,
            referrer
          }).catch(console.error)
        }
      }).catch(console.error)

      // Immediate redirect from cache
      redirect(originalUrl)
    } else {
      // Cache miss - fall back to database
      shortUrl = await prisma.shortUrl.findUnique({
        where: { 
          shortCode: shortCode,
          isActive: true // Only redirect active URLs
        }
      })

      if (!shortUrl) {
        notFound()
      }

      // Check if URL has expired (if expiration is set)
      if (shortUrl.expiresAt && new Date() > shortUrl.expiresAt) {
        notFound()
      }

      // Cache the URL for future requests (1 hour TTL)
      await cacheManager.cacheUrl(
        shortCode, 
        shortUrl.originalUrl, 
        shortUrl.createdBy || undefined,
        3600 // 1 hour
      )

      // Track the click asynchronously (don't wait for it)
      trackClick(shortUrl.id, shortCode, {
        userAgent,
        ipAddress,
        referrer
      }).catch(console.error)

      // Redirect to the original URL
      redirect(shortUrl.originalUrl)
    }

  } catch (error) {
    // Don't catch NEXT_REDIRECT errors - they are normal Next.js behavior
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Error processing redirect:', error)
    notFound()
  }
}

// Generate metadata for the page (for SEO when URL is shared)
export async function generateMetadata({ params }: Props) {
  const { shortCode } = await params
  
  try {
    const shortUrl = await prisma.shortUrl.findUnique({
      where: { 
        shortCode: shortCode,
        isActive: true 
      }
    })

    if (!shortUrl) {
      return {
        title: 'URL Not Found - Bitlytics',
        description: 'The requested short URL could not be found.'
      }
    }

    return {
      title: shortUrl.title || 'Redirecting... - Bitlytics',
      description: shortUrl.description || `Redirecting to ${shortUrl.originalUrl}`,
      openGraph: {
        title: shortUrl.title || 'Bitlytics Short URL',
        description: shortUrl.description || `Redirecting to ${shortUrl.originalUrl}`,
        url: `${process.env.APP_URL || 'http://localhost:3000'}/${shortUrl.shortCode}`,
      },
      twitter: {
        card: 'summary',
        title: shortUrl.title || 'Bitlytics Short URL',
        description: shortUrl.description || `Redirecting to ${shortUrl.originalUrl}`,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Bitlytics',
      description: 'URL Shortener with Analytics'
    }
  }
}
