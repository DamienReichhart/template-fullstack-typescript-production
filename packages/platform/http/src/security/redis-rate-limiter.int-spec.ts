import { afterAll, beforeEach, describe, expect, it } from 'bun:test';
import { createRedisConnection } from '@template/redis';

import { RedisRateLimiter } from './redis-rate-limiter.ts';

const redis = createRedisConnection(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
  db: 15,
});
const limiter = new RedisRateLimiter(redis, 'test-rate-limit');

describe('RedisRateLimiter (integration)', () => {
  beforeEach(async () => {
    await redis.flushdb();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('counts hits within the window and reports the remaining budget', async () => {
    await limiter.hit('k', 3, 60);
    const result = await limiter.hit('k', 3, 60);
    expect(result).toMatchObject({ hits: 2, remaining: 1, blocked: false });
    expect(result.resetInSeconds).toBeGreaterThan(0);
  });

  it('blocks once the limit is exceeded and keeps blocking during the block period', async () => {
    for (let i = 0; i < 3; i++) await limiter.hit('k', 3, 60);
    expect((await limiter.hit('k', 3, 60)).blocked).toBe(true);
    expect((await limiter.hit('k', 3, 60)).blocked).toBe(true);
  });

  it('keeps separate budgets per key', async () => {
    for (let i = 0; i < 4; i++) await limiter.hit('a', 3, 60);
    expect((await limiter.hit('b', 3, 60)).blocked).toBe(false);
  });
});
