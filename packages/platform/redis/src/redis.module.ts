import { Injectable, Module, type DynamicModule, type OnApplicationShutdown } from '@nestjs/common';
import { redisConfig, type ConfigType } from '@template/config';
import type { Redis } from 'ioredis';

import { createRedisConnection } from './connection/create-redis-connection.js';
import { InjectRedis, REDIS_CLIENT } from './redis.tokens.js';

@Injectable()
class RedisLifecycle implements OnApplicationShutdown {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}

export interface RedisModuleOptions {
  /** Shown in `CLIENT LIST`, e.g. `api`. Makes production debugging a lot easier. */
  connectionName: string;
}

@Module({})
export class RedisModule {
  static forRoot({ connectionName }: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      global: true,
      providers: [
        {
          provide: REDIS_CLIENT,
          inject: [redisConfig.token],
          useFactory: (config: ConfigType<typeof redisConfig>) =>
            createRedisConnection(config.REDIS_URL, { connectionName }),
        },
        RedisLifecycle,
      ],
      exports: [REDIS_CLIENT],
    };
  }
}
