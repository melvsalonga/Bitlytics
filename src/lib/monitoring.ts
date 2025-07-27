import * as Sentry from '@sentry/nextjs'

// Custom error classes for better error tracking
export class ValidationError extends Error {
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    if (field) {
      this.message = `${field}: ${message}`
    }
  }
}

export class DatabaseError extends Error {
  constructor(message: string, operation?: string) {
    super(message)
    this.name = 'DatabaseError'
    if (operation) {
      this.message = `Database ${operation}: ${message}`
    }
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

// Analytics tracking functions
export const analytics = {
  // Track URL shortening events
  trackUrlShortened: (data: {
    shortCode: string
    originalUrl: string
    customCode?: string
    userId?: string
  }) => {
    if (typeof window !== 'undefined') {
      // Client-side tracking
      Sentry.addBreadcrumb({
        message: 'URL shortened',
        category: 'user_action',
        data,
        level: 'info',
      })
    }
  },

  // Track URL clicks
  trackUrlClick: (data: {
    shortCode: string
    originalUrl: string
    userAgent?: string
    country?: string
    referrer?: string
  }) => {
    Sentry.addBreadcrumb({
      message: 'URL clicked',
      category: 'user_action',
      data,
      level: 'info',
    })
  },

  // Track user authentication
  trackUserAuth: (data: {
    action: 'login' | 'register' | 'logout'
    method?: string
    userId?: string
  }) => {
    Sentry.addBreadcrumb({
      message: `User ${data.action}`,
      category: 'auth',
      data,
      level: 'info',
    })

    // Set user context for error tracking
    if (data.action === 'login' && data.userId) {
      Sentry.setUser({ id: data.userId })
    } else if (data.action === 'logout') {
      Sentry.setUser(null)
    }
  },

  // Track API performance
  trackApiCall: (data: {
    endpoint: string
    method: string
    duration: number
    status: number
    userId?: string
  }) => {
    const transaction = Sentry.startTransaction({
      name: `${data.method} ${data.endpoint}`,
      op: 'http',
    })

    transaction.setData('duration', data.duration)
    transaction.setData('status', data.status)
    transaction.setData('userId', data.userId)

    transaction.finish()
  },

  // Track errors with context
  trackError: (error: Error, context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value)
        })
      }
      
      scope.setLevel('error')
      Sentry.captureException(error)
    })
  },

  // Track performance metrics
  trackPerformance: (data: {
    metric: string
    value: number
    unit: string
    tags?: Record<string, string>
  }) => {
    Sentry.addBreadcrumb({
      message: `Performance: ${data.metric}`,
      category: 'performance',
      data: {
        value: data.value,
        unit: data.unit,
        ...data.tags,
      },
      level: 'info',
    })
  },
}

// Server-side monitoring utilities
export const monitoring = {
  // Measure function execution time
  measureTime: async <T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    const startTime = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - startTime
      
      analytics.trackPerformance({
        metric: name,
        value: duration,
        unit: 'ms',
      })
      
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      
      analytics.trackError(error as Error, {
        function: name,
        duration,
      })
      
      throw error
    }
  },

  // Health check utilities
  checkDatabaseHealth: async () => {
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', timestamp: new Date().toISOString() }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  },

  // Memory usage tracking
  getMemoryUsage: () => {
    const usage = process.memoryUsage()
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
      rss: Math.round(usage.rss / 1024 / 1024),
    }
  },

  // System uptime
  getUptime: () => {
    return {
      process: Math.round(process.uptime()),
      system: Math.round(require('os').uptime()),
    }
  },
}

// Error boundary helper for React components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: fallback || (({ error, resetError }) => (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4 text-center">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    )),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true)
      scope.setContext('errorInfo', errorInfo)
    },
  })
}
