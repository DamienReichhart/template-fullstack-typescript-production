import { Module } from '@nestjs/common';
import { RedisModule as PlatformRedisModule } from '@template/redis';

/** Shared client: readiness probe and the `capture` mail transport. */
@Module({
  imports: [PlatformRedisModule.forRoot({ connectionName: 'worker' })],
})
export class RedisModule {}
