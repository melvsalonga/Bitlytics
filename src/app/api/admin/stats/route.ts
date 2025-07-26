import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Calculate date boundaries
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch platform statistics
    const [
      totalUsers,
      totalUrls,
      totalClicks,
      newUsersToday,
      newUrlsToday,
      clicksToday,
      activeUsers
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Total URLs count
      prisma.shortUrl.count(),
      
      // Total clicks count
      prisma.click.count(),
      
      // New users today
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // New URLs today
      prisma.shortUrl.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Clicks today
      prisma.click.count({
        where: {
          clickedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      // Active users (users who have URLs or created URLs in last 7 days)
      prisma.user.count({
        where: {
          OR: [
            {
              shortUrls: {
                some: {
                  createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              }
            },
            {
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          ]
        }
      })
    ])

    // Determine system health based on basic metrics
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy'
    
    // Simple health check logic (can be expanded)
    const clickRate = totalUrls > 0 ? totalClicks / totalUrls : 0
    if (clickRate < 1) {
      systemHealth = 'warning'
    }
    if (totalUsers === 0 || totalUrls === 0) {
      systemHealth = 'critical'
    }

    const stats = {
      totalUsers,
      totalUrls,
      totalClicks,
      activeUsers,
      newUsersToday,
      newUrlsToday,
      clicksToday,
      systemHealth
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
