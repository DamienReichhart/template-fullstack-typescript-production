import { RATE_LIMIT_KEY_PREFIX } from '@template/http';
import { Redis } from 'ioredis';

import { e2eEnv } from './env.ts';

/** One connection for the whole run: the mail outbox and rate-limit counters live in Redis. */
export const redis = new Redis(e2eEnv.redisUrl, { lazyConnect: true });

/**
 * Rate limits are per client IP and every test comes from 127.0.0.1: counters are reset
 * between tests, the way the database would be. The limits themselves stay on.
 */
export async function resetRateLimits(): Promise<void> {
  let cursor = '0';
  do {
    const [next, keys] = await redis.scan(
      cursor,
      'MATCH',
      `${RATE_LIMIT_KEY_PREFIX}:*`,
      'COUNT',
      500,
    );
    if (keys.length > 0) await redis.del(...keys);
    cursor = next;
  } while (cursor !== '0');
}
