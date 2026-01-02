/**
 * Redis Connection for BullMQ
 *
 * Connects to Upstash Redis for the job queue.
 * Upstash provides serverless Redis with pay-per-request pricing.
 */

import { Redis } from 'ioredis';

// Parse Upstash URL to get connection details
function parseUpstashUrl(url: string): { host: string; port: number } {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 6379,
  };
}

/**
 * Create a Redis connection for BullMQ
 * Uses Upstash Redis with TLS
 */
export function createRedisConnection(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL || '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || '';

  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required');
  }

  const { host } = parseUpstashUrl(url);

  // Create ioredis connection with Upstash credentials
  const connection = new Redis({
    host,
    port: 6379,
    password: token,
    tls: {
      rejectUnauthorized: false,
    },
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 3) {
        console.error('[Redis] Max retries reached');
        return null;
      }
      return Math.min(times * 200, 2000);
    },
  });

  connection.on('connect', () => {
    console.log('[Redis] Connected to Upstash');
  });

  connection.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

  return connection;
}

// Singleton connection for the application
let redisConnection: Redis | null = null;

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = createRedisConnection();
  }
  return redisConnection;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    console.log('[Redis] Connection closed');
  }
}

export default getRedisConnection;
