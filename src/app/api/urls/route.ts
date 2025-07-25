import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateShortCode, isValidCustomCode, isReservedCode } from '@/lib/short-code'
import { validateAndNormalizeUrl } from '@/lib/url-validator'

const createUrlSchema = z.object({
  originalUrl: z.string().min(1, 'URL is required').url('Invalid URL format'),
  customCode: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    const body = await request.json()
    const validatedData = createUrlSchema.parse(body)

    // Validate and normalize the URL
    const { isValid, normalizedUrl, error } = validateAndNormalizeUrl(validatedData.originalUrl)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: error || 'Invalid URL' },
        { status: 400 }
      )
    }

    let shortCode: string

    // Handle custom code if provided
    if (validatedData.customCode) {
      const customCode = validatedData.customCode.trim()

      // Validate custom code format
      if (!isValidCustomCode(customCode)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Custom code must be 3-20 characters long and contain only letters, numbers, and hyphens' 
          },
          { status: 400 }
        )
      }

      // Check if code is reserved
      if (isReservedCode(customCode)) {
        return NextResponse.json(
          { success: false, error: 'This custom code is reserved and cannot be used' },
          { status: 400 }
        )
      }

      // Check if custom code already exists
      const existingUrl = await prisma.shortUrl.findUnique({
        where: { shortCode: customCode }
      })

      if (existingUrl) {
        return NextResponse.json(
          { success: false, error: 'This custom code is already taken' },
          { status: 409 }
        )
      }

      shortCode = customCode
    } else {
      // Generate unique short code
      let attempts = 0
      const maxAttempts = 10

      do {
        shortCode = generateShortCode()
        attempts++

        const existing = await prisma.shortUrl.findUnique({
          where: { shortCode }
        })

        if (!existing) break

        if (attempts >= maxAttempts) {
          return NextResponse.json(
            { success: false, error: 'Failed to generate unique short code. Please try again.' },
            { status: 500 }
          )
        }
      } while (attempts < maxAttempts)
    }

    // Check if URL already exists for this user (optional feature)
    // For now, we'll allow duplicate URLs but with different short codes

    // Create the short URL in database
    const shortUrl = await prisma.shortUrl.create({
      data: {
        shortCode,
        originalUrl: normalizedUrl!,
        customCode: validatedData.customCode || null,
        title: validatedData.title || null,
        description: validatedData.description || null,
        createdBy: session?.user?.id || null, // Associate with user if authenticated
      }
    })

    // Return success response
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

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid input data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Short code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
    const skip = (page - 1) * limit

    // TODO: Add user filtering when authentication is implemented
    // For now, return all URLs (this should be restricted in production)
    
    const [urls, total] = await Promise.all([
      prisma.shortUrl.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { clicks: true }
          }
        }
      }),
      prisma.shortUrl.count()
    ])

    const urlsWithFullPath = urls.map(url => ({
      ...url,
      shortUrl: `${process.env.APP_URL || 'http://localhost:3000'}/${url.shortCode}`,
      totalClicks: url._count.clicks
    }))

    return NextResponse.json({
      success: true,
      data: urlsWithFullPath,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching URLs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
