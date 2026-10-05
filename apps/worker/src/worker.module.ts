import { Module } from '@nestjs/common';

import { ConfigModule } from './modules/config/config.module.js';
import { CqrsModule } from './modules/cqrs/cqrs.module.js';
import { DatabaseModule } from './modules/database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { LoggerModule } from './modules/logger/logger.module.js';
import { MessagingModule } from './modules/messaging/messaging.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { RedisModule } from './modules/redis/redis.module.js';

/** Composition root of the worker: platform first, then one module per consumed context. */
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    RedisModule,
    MessagingModule,
    CqrsModule,
    HealthModule,
    IdentityModule,
    NotificationsModule,
  ],
})
export class WorkerModule {}
