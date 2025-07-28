import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '24h' ? 1 : 
                    timeRange === '7d' ? 7 : 
                    timeRange === '30d' ? 30 : 
                    timeRange === '90d' ? 90 : 7;
    
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get all URLs with their click counts
    const urlsWithClicks = await prisma.shortUrl.findMany({
      include: {
        _count: {
          select: {
            clicks: {
              where: {
                clickedAt: {
                  gte: startDate,
                },
              },
            },
          },
        },
        clicks: {
          where: {
            clickedAt: {
              gte: startDate,
            },
          },
          select: {
            clickedAt: true,
            country: true,
            city: true,
            referrer: true,
            ipAddress: true,
          },
          orderBy: {
            clickedAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Process the data to include analytics for each URL
    const urlAnalytics = urlsWithClicks.map(url => {
      const clicks = url.clicks;
      
      // Calculate unique clicks by IP
      const uniqueIPs = new Set(clicks.map(click => click.ipAddress));
      
      // Group clicks by date
      const clicksByDate = clicks.reduce((acc, click) => {
        const date = new Date(click.clickedAt).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Top countries for this URL
      const countryCounts = clicks.reduce((acc, click) => {
        const country = click.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCountries = Object.entries(countryCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({ country, clicks: count }));

      // Top referrers for this URL
      const referrerCounts = clicks.reduce((acc, click) => {
        const referrer = click.referrer || 'Direct';
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topReferrers = Object.entries(referrerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([referrer, count]) => ({ referrer, clicks: count }));

      return {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`,
        createdAt: url.createdAt,
        totalClicks: url._count.clicks,
        uniqueClicks: uniqueIPs.size,
        clicksOverTime: Object.entries(clicksByDate).map(([date, clicks]) => ({
          date,
          clicks,
        })),
        topCountries,
        topReferrers,
        recentClicks: clicks.slice(0, 10).map(click => ({
          clickedAt: click.clickedAt,
          country: click.country,
          city: click.city,
          referrer: click.referrer,
        })),
      };
    });

    return NextResponse.json({
      urls: urlAnalytics,
      timeRange,
      totalUrls: urlAnalytics.length,
    });
  } catch (error) {
    console.error('URL Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URL analytics data' },
      { status: 500 }
    );
  }
}
