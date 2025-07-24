import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const shortUrlId = searchParams.get('shortUrlId');

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '24h' ? 1 : 
                    timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 7;
    
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Base where clause
    const whereClause: {
      clickedAt: { gte: Date };
      shortUrlId?: string;
    } = {
      clickedAt: {
        gte: startDate,
      },
    };

    // Filter by specific short URL if provided
    if (shortUrlId) {
      whereClause.shortUrlId = shortUrlId;
    }

    // Get total clicks in time range
    const totalClicks = await prisma.click.count({
      where: whereClause,
    });

    // Get unique clicks (approximate - by IP)
    const uniqueClicks = await prisma.click.groupBy({
      by: ['ipAddress'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Get clicks over time (grouped by day)
    const clicksOverTime = await prisma.click.groupBy({
      by: ['clickedAt'],
      where: whereClause,
      _count: {
        id: true,
      },
      orderBy: {
        clickedAt: 'asc',
      },
    });

    // Process clicks over time data
    const dailyClicks = clicksOverTime.reduce((acc, click) => {
      const date = new Date(click.clickedAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + click._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Fill in missing dates with 0 clicks
    const filledDailyClicks = [];
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
        .toISOString().split('T')[0];
      filledDailyClicks.unshift({
        date,
        clicks: dailyClicks[date] || 0,
      });
    }

    // Get top countries
    const topCountries = await prisma.click.groupBy({
      by: ['country'],
      where: {
        ...whereClause,
        country: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get top referrers
    const topReferrers = await prisma.click.groupBy({
      by: ['referrer'],
      where: {
        ...whereClause,
        referrer: {
          not: null,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get device/browser stats from user agent
    const userAgents = await prisma.click.findMany({
      where: whereClause,
      select: {
        userAgent: true,
      },
    });

    // Basic user agent parsing for device types
    const deviceStats = userAgents.reduce((acc, { userAgent }) => {
      if (!userAgent) return acc;
      
      const ua = userAgent.toLowerCase();
      let deviceType = 'Unknown';
      
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        deviceType = 'Mobile';
      } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceType = 'Tablet';
      } else if (ua.includes('mozilla') || ua.includes('chrome') || ua.includes('safari')) {
        deviceType = 'Desktop';
      }
      
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const response = {
      totalClicks,
      uniqueClicks: uniqueClicks.length,
      clicksOverTime: filledDailyClicks,
      topCountries: topCountries.map(item => ({
        country: item.country || 'Unknown',
        clicks: item._count.id,
      })),
      topReferrers: topReferrers.map(item => ({
        referrer: item.referrer || 'Direct',
        clicks: item._count.id,
      })),
      deviceStats: Object.entries(deviceStats).map(([device, clicks]) => ({
        device,
        clicks,
      })),
      timeRange,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
