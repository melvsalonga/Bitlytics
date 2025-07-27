import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100%
  // of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Additional configuration
  environment: process.env.NODE_ENV,
  
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry server event:', event)
    }
    
    // Filter out database connection errors during startup
    if (event.exception?.values?.[0]?.type === 'PrismaClientInitializationError') {
      return null
    }
    
    return event
  },
  
  // Server-specific configuration
  integrations: [
    // Add additional server integrations here
  ],
})
