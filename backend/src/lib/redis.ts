import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
    // Only create Redis client if REDIS_URL is configured
    if (!process.env.REDIS_URL) {
        console.warn('REDIS_URL not configured. Caching disabled.');
        return null;
    }

    if (!redis) {
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        redis.on('error', (err) => {
            console.error('Redis error:', err);
        });
    }

    return redis;
}

export async function disconnectRedis() {
    if (redis) {
        await redis.quit();
        redis = null;
    }
}
