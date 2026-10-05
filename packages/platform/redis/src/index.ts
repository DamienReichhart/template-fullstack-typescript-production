export { createRedisConnection } from './connection/create-redis-connection.ts';
export { RedisModule, type RedisModuleOptions } from './redis.module.ts';
export { InjectRedis, REDIS_CLIENT } from './redis.tokens.ts';
export type { Redis } from 'ioredis';
