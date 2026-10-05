import { Module } from '@nestjs/common';

import { ConfigModule } from './modules/config/config.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { LoggerModule } from './modules/logger/logger.module.js';
import { MessagingModule } from './modules/messaging/messaging.module.js';
import { RedisModule } from './modules/redis/redis.module.js';

/** Composition root of the scheduler: platform first, then one module per scheduling context. */
@Module({
  imports: [ConfigModule, LoggerModule, RedisModule, MessagingModule, HealthModule, IdentityModule],
})
export class SchedulerModule {}
