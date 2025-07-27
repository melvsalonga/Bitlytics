# 🛠️ Bitlytics: Technical Implementation Guide

## 📖 Table of Contents
1. [Core URL Shortening Logic](#core-url-shortening-logic)
2. [Database Schema & Models](#database-schema--models)
3. [API Endpoints Implementation](#api-endpoints-implementation)
4. [Frontend Components](#frontend-components)
5. [Authentication System](#authentication-system)
6. [Analytics & Tracking](#analytics--tracking)
7. [Security & Validation](#security--validation)
8. [Performance Optimizations](#performance-optimizations)

---

## 🔗 Core URL Shortening Logic

### Short Code Generation (`src/lib/short-code.ts`)
```typescript
import { nanoid } from 'nanoid'

export function generateShortCode(length: number = 6): string {
  // Generates URL-safe codes like "xK3mN9", "Yp2vQ8"
  return nanoid(length)
}

export function isValidCustomCode(code: string): boolean {
  // Allow alphanumeric characters and hyphens, 3-20 characters
  const regex = /^[a-zA-Z0-9-]{3,20}$/
  return regex.test(code)
}

export function isReservedCode(code: string): boolean {
  const reservedCodes = [
    'api', 'admin', 'auth', 'dashboard', 'analytics', 
    'login', 'register', 'logout', 'profile', 'settings',
    'help', 'about', 'contact', 'terms', 'privacy'
  ]
  return reservedCodes.includes(code.toLowerCase())
}
```

### URL Creation API (`src/app/api/urls/route.ts`)
```typescript
export async function POST(request: NextRequest) {
  try {
    // 1. Get user session
    const session = await getServerSession(authOptions)
    
    // 2. Validate input data
    const body = await request.json()
    const validatedData = createUrlSchema.parse(body)

    // 3. Validate and normalize URL
    const { isValid, normalizedUrl, error } = validateAndNormalizeUrl(validatedData.originalUrl)
    if (!isValid) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    // 4. Handle short code generation
    let shortCode: string
    if (validatedData.customCode) {
      // Validate custom code
      if (!isValidCustomCode(validatedData.customCode)) {
        return NextResponse.json({ 
          success: false, 
          error: 'Custom code must be 3-20 characters long and contain only letters, numbers, and hyphens' 
        }, { status: 400 })
      }
      
      // Check availability
      const existingUrl = await prisma.shortUrl.findUnique({
        where: { shortCode: validatedData.customCode }
      })
      if (existingUrl) {
        return NextResponse.json({ 
          success: false, 
          error: 'This custom code is already taken' 
        }, { status: 409 })
      }
      
      shortCode = validatedData.customCode
    } else {
      // Generate unique code with collision handling
      let attempts = 0
      do {
        shortCode = generateShortCode()
        attempts++
        
        const existing = await prisma.shortUrl.findUnique({
          where: { shortCode }
        })
        if (!existing) break
        
        if (attempts >= 10) {
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to generate unique short code. Please try again.' 
          }, { status: 500 })
        }
      } while (attempts < 10)
    }

    // 5. Create database entry
    const shortUrl = await prisma.shortUrl.create({
      data: {
        shortCode,
        originalUrl: normalizedUrl!,
        customCode: validatedData.customCode || null,
        title: validatedData.title || null,
        description: validatedData.description || null,
        createdBy: session?.user?.id || null,
      }
    })

    // 6. Return success response
    return NextResponse.json({
      success: true,
      data: {
        id: shortUrl.id,
        shortCode: shortUrl.shortCode,
        originalUrl: shortUrl.originalUrl,
        shortUrl: `${process.env.APP_URL || 'http://localhost:3000'}/${shortUrl.shortCode}`,
        title: shortUrl.title,
        description: shortUrl.description,
        createdAt: shortUrl.createdAt,
        clickCount: shortUrl.clickCount,
        isActive: shortUrl.isActive
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating short URL:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
```

---

## 🗄️ Database Schema & Models

### Prisma Schema (`prisma/schema.prisma`)
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String?
  role          Role      @default(USER)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  shortUrls     ShortUrl[]
  sessions      Session[]
  accounts      Account[]
}

model ShortUrl {
  id               String    @id @default(cuid())
  shortCode        String    @unique
  originalUrl      String
  customCode       String?
  title            String?
  description      String?
  isActive         Boolean   @default(true)
  expiresAt        DateTime?
  clickCount       Int       @default(0)
  uniqueClickCount Int       @default(0)
  
  createdBy        String?
  user             User?     @relation(fields: [createdBy], references: [id])
  clicks           Click[]
  
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  @@index([shortCode])
  @@index([createdBy])
}

model Click {
  id          String    @id @default(cuid())
  shortUrlId  String
  userAgent   String?
  ipAddress   String
  country     String?
  city        String?
  referrer    String?
  clickedAt   DateTime  @default(now())
  
  shortUrl    ShortUrl  @relation(fields: [shortUrlId], references: [id], onDelete: Cascade)
  
  @@index([shortUrlId])
  @@index([clickedAt])
}

enum Role {
  USER
  ADMIN
}
```

---

## 🔄 Redirect & Analytics System

### Dynamic Route Handler (`src/app/[shortCode]/page.tsx`)
```typescript
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

    // Check if URL has expired
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
    // Don't catch NEXT_REDIRECT errors - they are normal Next.js behavior
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }
    console.error('Error processing redirect:', error)
    notFound()
  }
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
      }
    })

    // Update click count
    await prisma.shortUrl.update({
      where: { id: shortUrlId },
      data: {
        clickCount: {
          increment: 1
        },
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
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) return realIP
  if (cfConnectingIP) return cfConnectingIP
  
  return '127.0.0.1' // Fallback for development
}
```

---

## 🎨 Frontend Components

### URL Shortener Form (`src/components/url-shortener-form.tsx`)
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const urlFormSchema = z.object({
  originalUrl: z.string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL'),
  customCode: z.string()
    .optional()
    .refine((code) => !code || /^[a-zA-Z0-9-]{3,20}$/.test(code), {
      message: 'Custom code must be 3-20 characters, alphanumeric and hyphens only'
    })
})

export function UrlShortenerForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ShortenedUrlResult | null>(null)

  const form = useForm<UrlFormData>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: {
      originalUrl: '',
      customCode: ''
    }
  })

  const onSubmit = async (data: UrlFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to shorten URL')
      }

      const result = await response.json()
      
      setResult({
        shortCode: result.data.shortCode,
        shortUrl: `${window.location.origin}/${result.data.shortCode}`,
        originalUrl: result.data.originalUrl
      })

      toast.success('URL shortened successfully!')
      form.reset()
    } catch (error) {
      console.error('Error shortening URL:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to shorten URL')
    } finally {
      setIsLoading(false)
    }
  }

  // Component JSX here...
}
```

---

## 🔐 Authentication System

### NextAuth Configuration (`src/lib/auth.ts`)
```typescript
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
      }
      return session
    },
  },
}
```

---

## 📊 Analytics Implementation

### Analytics Data Processing
```typescript
// Get analytics for a specific URL
export async function getUrlAnalytics(shortCode: string, userId?: string) {
  const shortUrl = await prisma.shortUrl.findUnique({
    where: { shortCode },
    include: {
      clicks: {
        orderBy: { clickedAt: 'desc' },
        take: 1000 // Limit for performance
      }
    }
  })

  if (!shortUrl) {
    throw new Error('URL not found')
  }

  // Check if user owns this URL (for private analytics)
  if (shortUrl.createdBy && shortUrl.createdBy !== userId) {
    throw new Error('Unauthorized')
  }

  // Process analytics data
  const analytics = {
    totalClicks: shortUrl.clickCount,
    uniqueClicks: shortUrl.uniqueClickCount,
    
    // Time series data (last 30 days)
    timeSeriesData: await getTimeSeriesData(shortUrl.id),
    
    // Geographic distribution
    geographicData: await getGeographicData(shortUrl.id),
    
    // Top referrers
    topReferrers: await getTopReferrers(shortUrl.id),
    
    // Device/browser stats
    deviceStats: await getDeviceStats(shortUrl.id)
  }

  return analytics
}

async function getTimeSeriesData(shortUrlId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const clicks = await prisma.click.groupBy({
    by: ['clickedAt'],
    where: {
      shortUrlId,
      clickedAt: {
        gte: thirtyDaysAgo
      }
    },
    _count: {
      id: true
    },
    orderBy: {
      clickedAt: 'asc'
    }
  })

  // Group by day and format for charts
  const dailyData = clicks.reduce((acc, click) => {
    const date = click.clickedAt.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + click._count.id
    return acc
  }, {} as Record<string, number>)

  return Object.entries(dailyData).map(([date, clicks]) => ({
    date,
    clicks
  }))
}
```

---

## 🛡️ Security & Validation

### URL Validation (`src/lib/url-validator.ts`)
```typescript
export function validateAndNormalizeUrl(url: string): {
  isValid: boolean
  normalizedUrl?: string
  error?: string
} {
  try {
    // Basic cleanup
    url = url.trim()

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    const parsed = new URL(url)

    // Security checks
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS URLs are allowed'
      }
    }

    // Block localhost and private IPs in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsed.hostname.toLowerCase()
      
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.startsWith('172.16.')) {
        return {
          isValid: false,
          error: 'Private and local URLs are not allowed'
        }
      }
    }

    // Additional security checks
    if (parsed.hostname.length > 253) {
      return {
        isValid: false,
        error: 'Hostname is too long'
      }
    }

    return {
      isValid: true,
      normalizedUrl: parsed.toString()
    }

  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    }
  }
}
```

---

## ⚡ Performance Optimizations

### Database Indexing
```prisma
model ShortUrl {
  // ... other fields
  
  @@index([shortCode])        // Fast lookups for redirects
  @@index([createdBy])       // Fast user queries
  @@index([createdAt])       // Ordered listings
}

model Click {
  // ... other fields
  
  @@index([shortUrlId])      // Fast analytics queries
  @@index([clickedAt])       // Time-based analytics
  @@index([shortUrlId, clickedAt]) // Composite index for complex queries
}
```

### Caching Strategy
```typescript
// Example Redis caching for hot URLs
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedUrl(shortCode: string) {
  // Try cache first
  const cached = await redis.get(`url:${shortCode}`)
  if (cached) {
    return JSON.parse(cached)
  }

  // Fallback to database
  const url = await prisma.shortUrl.findUnique({
    where: { shortCode }
  })

  if (url) {
    // Cache for 1 hour
    await redis.setex(`url:${shortCode}`, 3600, JSON.stringify(url))
  }

  return url
}
```

---

## 🚀 Deployment Considerations

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/bitlytics"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-domain.com"

# App Configuration
APP_URL="https://your-domain.com"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Redis for caching
REDIS_URL="redis://localhost:6379"
```

### Production Optimizations
- Enable database connection pooling
- Implement rate limiting
- Add CDN for static assets  
- Use Redis for caching hot URLs
- Monitor with analytics tools
- Set up error tracking (Sentry)

---

This technical guide provides the core implementation details you need to understand and extend Bitlytics. Each section builds upon the previous ones to create a complete, production-ready URL shortener with analytics.
