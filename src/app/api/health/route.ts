import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cacheManager } from '@/lib/redis'

export async function GET() {
  try {
    // Check database connectivity
    const dbCheck = await prisma.$queryRaw`SELECT 1 as result`
    
    // Check Redis connectivity
    const redisHealth = await cacheManager.getHealthStatus()
    
    // Get basic system stats
    const [userCount, urlCount, clickCount] = await Promise.all([
      prisma.user.count(),
      prisma.shortUrl.count(),
      prisma.click.count(),
    ])

    const health = {
      status: dbCheck && redisHealth.connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbCheck ? 'connected' : 'disconnected',
        users: userCount,
        urls: urlCount,
        clicks: clickCount
      },
      cache: {
        status: redisHealth.connected ? 'connected' : 'disconnected',
        memory: redisHealth.memory,
        keyCount: redisHealth.keyCount
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      }
    }

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'ok'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorHealth = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        status: 'disconnected'
      }
    }

    return NextResponse.json(errorHealth, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'failed'
      }
    })
  }
}
