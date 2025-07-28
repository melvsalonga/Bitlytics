import Redis from 'ioredis';

let redis: Redis | null = null;

/**
 * Initialize Redis connection
 * Supports both local Redis and Redis Cloud
 */
function createRedisConnection(): Redis {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    // Use Redis URL (for production environments like Redis Cloud)
    return new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });
  }

  // Use individual Redis configuration (for local development)
  return new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 10000,
    commandTimeout: 5000,
  });
}

/**
 * Get Redis connection instance (singleton pattern)
 */
export function getRedisClient(): Redis {
  if (!redis) {
    redis = createRedisConnection();
    
    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('ready', () => {
      console.log('Redis ready for operations');
    });
  }

  return redis;
}

/**
 * Cache utilities for URL shortener
 */
export class CacheManager {
  private redis: Redis;
  
  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Cache a URL mapping with TTL
   */
  async cacheUrl(shortCode: string, originalUrl: string, userId?: string, ttl: number = 3600): Promise<void> {
    try {
      const urlData = {
        originalUrl,
        userId: userId || null,
        cachedAt: new Date().toISOString(),
      };

      await this.redis.setex(
        `url:${shortCode}`,
        ttl,
        JSON.stringify(urlData)
      );

      // Also cache reverse mapping for analytics
      if (userId) {
        await this.redis.sadd(`user:${userId}:urls`, shortCode);
      }
    } catch (error) {
      console.error('Error caching URL:', error);
      // Don't throw error, fallback to database
    }
  }

  /**
   * Get cached URL mapping
   */
  async getCachedUrl(shortCode: string): Promise<{ originalUrl: string; userId?: string } | null> {
    try {
      const cached = await this.redis.get(`url:${shortCode}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Error getting cached URL:', error);
      return null;
    }
  }

  /**
   * Cache analytics data for quick access
   */
  async cacheAnalytics(key: string, data: any, ttl: number = 300): Promise<void> {
    try {
      await this.redis.setex(
        `analytics:${key}`,
        ttl,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Error caching analytics:', error);
    }
  }

  /**
   * Get cached analytics data
   */
  async getCachedAnalytics(key: string): Promise<any | null> {
    try {
      const cached = await this.redis.get(`analytics:${key}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Error getting cached analytics:', error);
      return null;
    }
  }

  /**
   * Increment click counter in cache
   */
  async incrementClickCount(shortCode: string): Promise<number> {
    try {
      return await this.redis.incr(`clicks:${shortCode}`);
    } catch (error) {
      console.error('Error incrementing click count:', error);
      return 0;
    }
  }

  /**
   * Get click count from cache
   */
  async getClickCount(shortCode: string): Promise<number> {
    try {
      const count = await this.redis.get(`clicks:${shortCode}`);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting click count:', error);
      return 0;
    }
  }

  /**
   * Cache popular URLs for quick access
   */
  async cachePopularUrls(urls: any[], ttl: number = 600): Promise<void> {
    try {
      await this.redis.setex(
        'popular:urls',
        ttl,
        JSON.stringify(urls)
      );
    } catch (error) {
      console.error('Error caching popular URLs:', error);
    }
  }

  /**
   * Get cached popular URLs
   */
  async getCachedPopularUrls(): Promise<any[] | null> {
    try {
      const cached = await this.redis.get('popular:urls');
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('Error getting cached popular URLs:', error);
      return null;
    }
  }

  /**
   * Invalidate cache for a specific URL
   */
  async invalidateUrl(shortCode: string): Promise<void> {
    try {
      await this.redis.del(`url:${shortCode}`);
      await this.redis.del(`clicks:${shortCode}`);
    } catch (error) {
      console.error('Error invalidating URL cache:', error);
    }
  }

  /**
   * Clear all cached data (use with caution)
   */
  async clearCache(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{ connected: boolean; memory?: string; keyCount?: number }> {
    try {
      const ping = await this.redis.ping();
      const info = await this.redis.info('memory');
      const keyCount = await this.redis.dbsize();
      
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : 'unknown';

      return {
        connected: ping === 'PONG',
        memory,
        keyCount,
      };
    } catch (error) {
      console.error('Error getting cache health:', error);
      return { connected: false };
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
