import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

interface Props {
  params: Promise<{ shortCode: string }>
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { shortCode } = await params

    const shortUrl = await prisma.shortUrl.findUnique({
      where: { shortCode },
      include: {
        clicks: {
          orderBy: { clickedAt: 'desc' },
          take: 10, // Get recent 10 clicks for preview
        },
        _count: {
          select: { clicks: true }
        }
      }
    })

    if (!shortUrl) {
      return NextResponse.json(
        { success: false, error: 'Short URL not found' },
        { status: 404 }
      )
    }

    // Calculate some basic analytics
    const totalClicks = shortUrl._count.clicks
    const uniqueClicks = await prisma.click.groupBy({
      by: ['ipAddress'],
      where: { shortUrlId: shortUrl.id },
      _count: true
    })

    const clicksByCountry = await prisma.click.groupBy({
      by: ['country'],
      where: { 
        shortUrlId: shortUrl.id,
        country: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })

    const clicksByReferrer = await prisma.click.groupBy({
      by: ['referrer'],
      where: { 
        shortUrlId: shortUrl.id,
        referrer: { not: null }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })

    // Get clicks by date for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const clicksByDate = await prisma.$queryRaw`
      SELECT 
        DATE(\"clickedAt\") as date,
        COUNT(*) as clicks
      FROM \"Click\"
      WHERE \"shortUrlId\" = ${shortUrl.id}
        AND \"clickedAt\" >= ${sevenDaysAgo}
      GROUP BY DATE(\"clickedAt\")
      ORDER BY date DESC
    ` as Array<{ date: Date; clicks: bigint }>

    const response = {
      success: true,
      data: {
        id: shortUrl.id,
        shortCode: shortUrl.shortCode,
        originalUrl: shortUrl.originalUrl,
        shortUrl: `${process.env.APP_URL || 'http://localhost:3000'}/${shortUrl.shortCode}`,
        title: shortUrl.title,
        description: shortUrl.description,
        customCode: shortUrl.customCode,
        isActive: shortUrl.isActive,
        expiresAt: shortUrl.expiresAt,
        createdAt: shortUrl.createdAt,
        updatedAt: shortUrl.updatedAt,
        analytics: {
          totalClicks,
          uniqueClicks: uniqueClicks.length,
          clicksByCountry: clicksByCountry.map(item => ({
            country: item.country,
            clicks: item._count.id
          })),
          clicksByReferrer: clicksByReferrer.map(item => ({
            referrer: item.referrer,
            clicks: item._count.id
          })),
          clicksByDate: clicksByDate.map(item => ({
            date: item.date,
            clicks: Number(item.clicks)
          })),
          recentClicks: shortUrl.clicks.map(click => ({
            id: click.id,
            ipAddress: click.ipAddress.replace(/\d+$/, 'xxx'), // Anonymize IP
            userAgent: click.userAgent,
            country: click.country,
            city: click.city,
            referrer: click.referrer,
            clickedAt: click.clickedAt
          }))
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching URL details:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { shortCode } = await params
    const body = await request.json()

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if the URL belongs to the authenticated user
    const existingUrl = await prisma.shortUrl.findUnique({
      where: { shortCode },
      include: { user: true }
    })

    if (!existingUrl) {
      return NextResponse.json(
        { success: false, error: 'Short URL not found' },
        { status: 404 }
      )
    }

    if (existingUrl.user?.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own URLs' },
        { status: 403 }
      )
    }

    const allowedUpdates = ['title', 'description', 'isActive'] as const
    const updates: Partial<{ title: string; description: string; isActive: boolean }> = {}

    // Only allow specific fields to be updated
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updates as any)[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedUrl = await prisma.shortUrl.update({
      where: { shortCode },
      data: updates
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUrl.id,
        shortCode: updatedUrl.shortCode,
        originalUrl: updatedUrl.originalUrl,
        shortUrl: `${process.env.APP_URL || 'http://localhost:3000'}/${updatedUrl.shortCode}`,
        title: updatedUrl.title,
        description: updatedUrl.description,
        isActive: updatedUrl.isActive,
        updatedAt: updatedUrl.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating URL:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { success: false, error: 'Short URL not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const { shortCode } = await params

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if the URL belongs to the authenticated user
    const existingUrl = await prisma.shortUrl.findUnique({
      where: { shortCode },
      include: { user: true }
    })

    if (!existingUrl) {
      return NextResponse.json(
        { success: false, error: 'Short URL not found' },
        { status: 404 }
      )
    }

    if (existingUrl.user?.email !== session.user.email) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own URLs' },
        { status: 403 }
      )
    }

    await prisma.shortUrl.delete({
      where: { shortCode }
    })

    return NextResponse.json({
      success: true,
      message: 'Short URL deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting URL:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { success: false, error: 'Short URL not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
