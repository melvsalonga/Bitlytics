import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user data summary before deletion
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shortUrls: { select: { id: true } },
        sessions: { select: { id: true } },
        accounts: { select: { id: true } },
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete user data in correct order (foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete clicks for user's URLs (cascade will handle this, but being explicit)
      await tx.click.deleteMany({
        where: {
          shortUrl: {
            createdBy: userId
          }
        }
      })

      // Delete short URLs
      await tx.shortUrl.deleteMany({
        where: { createdBy: userId }
      })

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId }
      })

      // Delete accounts
      await tx.account.deleteMany({
        where: { userId }
      })

      // Delete blacklisted IPs created by user
      await tx.blacklistedIP.updateMany({
        where: { createdBy: userId },
        data: { createdBy: null }
      })

      // Finally delete user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    // Log the data deletion for compliance
    console.log(`GDPR Data deletion completed for user ${userId}:`, {
      shortUrls: userData.shortUrls.length,
      sessions: userData.sessions.length,
      accounts: userData.accounts.length,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'All your data has been permanently deleted from our systems.',
      deletedData: {
        shortUrls: userData.shortUrls.length,
        sessions: userData.sessions.length,
        accounts: userData.accounts.length,
      }
    })

  } catch (error) {
    console.error('Error deleting user data:', error)
    return NextResponse.json(
      { error: 'Failed to delete user data' },
      { status: 500 }
    )
  }
}

// Export user data for GDPR compliance
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get all user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        shortUrls: {
          include: {
            clicks: {
              select: {
                ipAddress: true,
                userAgent: true,
                referrer: true,
                clickedAt: true,
                country: true,
                city: true,
              }
            }
          }
        },
        sessions: {
          select: {
            sessionToken: true,
            expires: true,
          }
        },
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
            type: true,
          }
        },
      }
    })

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data from export
    const exportData = {
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      shortUrls: userData.shortUrls.map(url => ({
        id: url.id,
        shortCode: url.shortCode,
        originalUrl: url.originalUrl,
        title: url.title,
        description: url.description,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        clicks: url.clicks.map(click => ({
          // Hash IP addresses for privacy
          ipAddress: hashIP(click.ipAddress),
          userAgent: click.userAgent,
          referrer: click.referrer,
          clickedAt: click.clickedAt,
          country: click.country,
          city: click.city,
        }))
      })),
      accounts: userData.accounts,
      exportedAt: new Date().toISOString(),
    }

    return NextResponse.json(exportData)

  } catch (error) {
    console.error('Error exporting user data:', error)
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    )
  }
}

// Simple hash function for IP addresses in exports
function hashIP(ip: string): string {
  // Simple hash to anonymize IP while keeping some structure
  return `${ip.split('.').map(part => 'xxx').join('.')}`
}
