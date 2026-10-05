import type { Redis } from '@template/redis';

/**
 * Atomic fixed-window counter with a block period once the limit is exceeded.
 * Returns [hits, windowTtlMs, blocked (0|1), blockTtlMs].
 */
const HIT_SCRIPT = `
local hitsKey = KEYS[1]
local blockKey = KEYS[2]
local windowMs = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local blockMs = tonumber(ARGV[3])

local blockTtl = redis.call('PTTL', blockKey)
if blockTtl > 0 then
  return { tonumber(redis.call('GET', hitsKey) or '0'), redis.call('PTTL', hitsKey), 1, blockTtl }
end

local hits = redis.call('INCR', hitsKey)
if hits == 1 then
  redis.call('PEXPIRE', hitsKey, windowMs)
end
local windowTtl = redis.call('PTTL', hitsKey)

if hits > limit then
  redis.call('SET', blockKey, '1', 'PX', blockMs)
  return { hits, windowTtl, 1, blockMs }
end
return { hits, windowTtl, 0, 0 }
`;

export interface RateLimitResult {
  hits: number;
  limit: number;
  remaining: number;
  blocked: boolean;
  /** Seconds until the counter (or the block) resets. */
  resetInSeconds: number;
}

/** Redis key prefix of every rate-limit counter (end-to-end suites reset them between tests). */
export const RATE_LIMIT_KEY_PREFIX = 'rate-limit';

/** Counters live in Redis so every API replica enforces the same budget. */
export class RedisRateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly prefix = RATE_LIMIT_KEY_PREFIX,
  ) {}

  async hit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const base = `${this.prefix}:${key}`;
    const windowMs = windowSeconds * 1000;
    const [hits, windowTtl, blocked, blockTtl] = (await this.redis.eval(
      HIT_SCRIPT,
      2,
      `${base}:hits`,
      `${base}:block`,
      windowMs,
      limit,
      windowMs,
    )) as [number, number, number, number];

    return {
      hits,
      limit,
      remaining: Math.max(0, limit - hits),
      blocked: blocked === 1,
      resetInSeconds: Math.max(1, Math.ceil((blocked === 1 ? blockTtl : windowTtl) / 1000)),
    };
  }
}
