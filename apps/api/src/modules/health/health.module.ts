import { Module } from '@nestjs/common';
import { HealthModule as PlatformHealthModule } from '@template/health';

// Storage is reported, not required: its outage breaks uploads, it must not drain sign-ins.
const health = PlatformHealthModule.forHttp({
  dependencies: ['database', 'redis'],
  reported: ['storage'],
});

/** `/health/live` and `/health/ready`; also exports `ReadinessService` for the system ping. */
@Module({
  imports: [health],
  exports: [health],
})
export class HealthModule {}
