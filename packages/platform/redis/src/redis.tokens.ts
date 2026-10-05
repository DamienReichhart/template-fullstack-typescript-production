import { Inject } from '@nestjs/common';

/** The shared ioredis client for caches, rate limiting and ad-hoc commands. */
export const REDIS_CLIENT = Symbol.for('template:redis-client');

export const InjectRedis = (): ParameterDecorator & PropertyDecorator => Inject(REDIS_CLIENT);
