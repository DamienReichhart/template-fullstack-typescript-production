import { Module } from '@nestjs/common';

import { HealthModule } from '../health/health.module.ts';
import { SystemController } from './controllers/system.controller.ts';
import { SystemStatusService } from './services/system-status.service.ts';

/** `GET /api/v1/system/ping` (public) and `/ping/authenticated` (signed in, verified email). */
@Module({
  imports: [HealthModule],
  controllers: [SystemController],
  providers: [SystemStatusService],
})
export class SystemModule {}
