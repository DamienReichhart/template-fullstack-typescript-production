import { Module } from '@nestjs/common';
import { HealthModule as PlatformHealthModule } from '@template/health';

import { workerProbeConfig } from '../config/worker.config.js';

/** Probe server on `WORKER_HEALTH_PORT`: `/live` and `/ready` (database + Redis). */
@Module({
  imports: [
    PlatformHealthModule.forProbe({
      dependencies: ['database', 'redis'],
      config: workerProbeConfig,
    }),
  ],
})
export class HealthModule {}
