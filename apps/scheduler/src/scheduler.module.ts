import { Module } from '@nestjs/common';

import { ConfigModule } from './modules/config/config.module.ts';
import { HealthModule } from './modules/health/health.module.ts';
import { IdentityModule } from './modules/identity/identity.module.ts';
import { LoggerModule } from './modules/logger/logger.module.ts';
import { MessagingModule } from './modules/messaging/messaging.module.ts';
import { RedisModule } from './modules/redis/redis.module.ts';

/** Composition root of the scheduler: platform first, then one module per scheduling context. */
@Module({
  imports: [ConfigModule, LoggerModule, RedisModule, MessagingModule, HealthModule, IdentityModule],
})
export class SchedulerModule {}
