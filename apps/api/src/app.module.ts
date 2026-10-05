import { Module } from '@nestjs/common';

import { AdminModule } from './modules/admin/admin.module.js';
import { ConfigModule } from './modules/config/config.module.js';
import { CqrsModule } from './modules/cqrs/cqrs.module.js';
import { DatabaseModule } from './modules/database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { HttpModule } from './modules/http/http.module.js';
import { IdentityModule } from './modules/identity/identity.module.js';
import { LoggerModule } from './modules/logger/logger.module.js';
import { MessagingModule } from './modules/messaging/messaging.module.js';
import { RedisModule } from './modules/redis/redis.module.js';
import { SystemModule } from './modules/system/system.module.js';

/** Composition root of the api: platform first, then bounded contexts, then app features. */
@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    RedisModule,
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
