import { Module } from '@nestjs/common';

import { ConfigModule } from './modules/config/config.module.ts';
import { CqrsModule } from './modules/cqrs/cqrs.module.ts';
import { DatabaseModule } from './modules/database/database.module.ts';
import { HealthModule } from './modules/health/health.module.ts';
import { IdentityModule } from './modules/identity/identity.module.ts';
import { LoggerModule } from './modules/logger/logger.module.ts';
import { MediaModule } from './modules/media/media.module.ts';
import { MessagingModule } from './modules/messaging/messaging.module.ts';
import { NotificationsModule } from './modules/notifications/notifications.module.ts';
import { RedisModule } from './modules/redis/redis.module.ts';
import { StorageModule } from './modules/storage/storage.module.ts';

/** Composition root of the worker: platform first, then one module per consumed context. */
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    RedisModule,
    StorageModule,
    MessagingModule,
    CqrsModule,
    HealthModule,
    IdentityModule,
    MediaModule,
    NotificationsModule,
  ],
})
export class WorkerModule {}
