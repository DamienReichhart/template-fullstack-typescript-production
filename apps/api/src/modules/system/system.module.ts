import { Module } from '@nestjs/common';

import { HealthModule } from '../health/health.module.js';
import { SystemController } from './controllers/system.controller.js';
import { SystemStatusService } from './services/system-status.service.js';

/** `GET /api/v1/system/ping` (public) and `/ping/authenticated` (signed in, verified email). */
@Module({
  imports: [HealthModule],
  controllers: [SystemController],
  providers: [SystemStatusService],
})
export class SystemModule {}
