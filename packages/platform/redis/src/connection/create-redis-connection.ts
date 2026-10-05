import { Redis, type RedisOptions } from 'ioredis';

/**
 * Creates an ioredis client from a `redis://` URL. `maxRetriesPerRequest: null` is required
 * by BullMQ workers and keeps commands queued while Redis restarts instead of failing them.
 */
export function createRedisConnection(url: string, options: RedisOptions = {}): Redis {
  return new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    ...options,
  });
}
