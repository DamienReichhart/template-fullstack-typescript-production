import { Module } from '@nestjs/common';
import { HealthModule as PlatformHealthModule } from '@template/health';

import { workerProbeConfig } from '../config/worker.config.ts';

/** Probe server on `WORKER_HEALTH_PORT`: `/live` and `/ready` (database + Redis; storage reported). */
@Module({
  imports: [
    PlatformHealthModule.forProbe({
      dependencies: ['database', 'redis'],
      reported: ['storage'],
      config: workerProbeConfig,
    }),
  ],
})
export class HealthModule {}
