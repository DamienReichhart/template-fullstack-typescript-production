import { Module } from '@nestjs/common';
import { RedisModule as PlatformRedisModule } from '@template/redis';

@Module({
  imports: [PlatformRedisModule.forRoot({ connectionName: 'scheduler' })],
})
export class RedisModule {}
