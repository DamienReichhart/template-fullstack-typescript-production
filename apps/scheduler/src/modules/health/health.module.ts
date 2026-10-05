import { Module } from '@nestjs/common';
import { HealthModule as PlatformHealthModule } from '@template/health';

import { schedulerProbeConfig } from '../config/scheduler.config.js';

/** Probe server on `SCHEDULER_HEALTH_PORT`: `/live` and `/ready` (Redis). */
@Module({
  imports: [
    PlatformHealthModule.forProbe({ dependencies: ['redis'], config: schedulerProbeConfig }),
  ],
})
export class HealthModule {}
