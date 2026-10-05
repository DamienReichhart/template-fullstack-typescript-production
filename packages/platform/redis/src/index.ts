export { createRedisConnection } from './connection/create-redis-connection.js';
export { RedisModule, type RedisModuleOptions } from './redis.module.js';
export { InjectRedis, REDIS_CLIENT } from './redis.tokens.js';
export type { Redis } from 'ioredis';
