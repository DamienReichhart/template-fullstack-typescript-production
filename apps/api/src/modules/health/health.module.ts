import { Module } from '@nestjs/common';
import { HealthModule as PlatformHealthModule } from '@template/health';

const health = PlatformHealthModule.forHttp({ dependencies: ['database', 'redis'] });

/** `/health/live` and `/health/ready`; also exports `ReadinessService` for the system ping. */
@Module({
  imports: [health],
  exports: [health],
})
export class HealthModule {}
