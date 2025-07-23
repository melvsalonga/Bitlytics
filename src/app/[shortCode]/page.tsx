import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

interface Props {
  params: Promise<{ shortCode: string }>
}

async function trackClick(shortUrlId: string, request: {
  userAgent?: string
  ipAddress: string
  referrer?: string
}) {
  try {
    // Create click record
    await prisma.click.create({
      data: {
        shortUrlId,
        userAgent: request.userAgent || null,
        ipAddress: request.ipAddress,
        referrer: request.referrer || null,
        // TODO: Add geolocation data (country, city) using IP
      }
    })

    // Update click count
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
    // Find the short URL in database
    const shortUrl = await prisma.shortUrl.findUnique({
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

    // Track the click asynchronously (don't wait for it)
    trackClick(shortUrl.id, {
      userAgent,
      ipAddress,
      referrer
    }).catch(console.error)

    // Redirect to the original URL
    redirect(shortUrl.originalUrl)

  } catch (error) {
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
