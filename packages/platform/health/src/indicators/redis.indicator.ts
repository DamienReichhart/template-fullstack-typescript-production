import { Injectable } from '@nestjs/common';
import { InjectRedis, type Redis } from '@template/redis';

import { DependencyIndicator } from './dependency-indicator.ts';
import { measure, type DependencyStatus } from './dependency-status.ts';

@Injectable()
export class RedisIndicator extends DependencyIndicator {
  readonly name = 'redis';

  constructor(@InjectRedis() private readonly redis: Redis) {
    super();
  }

  check(): Promise<DependencyStatus> {
    return measure(() => this.redis.ping());
  }
}
