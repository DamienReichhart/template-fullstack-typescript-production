import { Module } from '@nestjs/common';

import { AdminModule } from './modules/admin/admin.module.ts';
import { ConfigModule } from './modules/config/config.module.ts';
import { CqrsModule } from './modules/cqrs/cqrs.module.ts';
import { DatabaseModule } from './modules/database/database.module.ts';
import { HealthModule } from './modules/health/health.module.ts';
import { HttpModule } from './modules/http/http.module.ts';
import { IdentityModule } from './modules/identity/identity.module.ts';
import { LoggerModule } from './modules/logger/logger.module.ts';
import { MessagingModule } from './modules/messaging/messaging.module.ts';
import { RedisModule } from './modules/redis/redis.module.ts';
import { StorageModule } from './modules/storage/storage.module.ts';
import { SystemModule } from './modules/system/system.module.ts';

/** Composition root of the api: platform first, then bounded contexts, then app features. */
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    RedisModule,
    StorageModule,
    MessagingModule,
    CqrsModule,
    HttpModule,
    HealthModule,
    IdentityModule,
    SystemModule,
    AdminModule,
  ],
})
export class AppModule {}
