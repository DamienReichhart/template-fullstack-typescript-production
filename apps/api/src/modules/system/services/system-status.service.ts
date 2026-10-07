import { Inject, Injectable } from '@nestjs/common';
import { appConfig, type ConfigType } from '@template/config';
import type { PingResponse, ServiceStatus } from '@template/contracts/system';
import { ReadinessService, type DependencyStatus } from '@template/health';

import { APP_VERSION } from '../app-version.ts';

const toServiceStatus = (status: DependencyStatus | undefined): ServiceStatus =>
  status ? { status: status.status, latencyMs: status.latencyMs } : { status: 'down' };

/** What the "test connection" button shows: version, uptime and dependency health. */
@Injectable()
export class SystemStatusService {
  constructor(
    private readonly readiness: ReadinessService,
    @Inject(appConfig.token) private readonly app: ConfigType<typeof appConfig>,
  ) {}

  async ping(): Promise<PingResponse> {
    const dependencies = await this.readiness.dependencies();
    const services = {
      database: toServiceStatus(dependencies['database']),
      redis: toServiceStatus(dependencies['redis']),
      storage: toServiceStatus(dependencies['storage']),
    };
    return {
      status: Object.values(services).every((service) => service.status === 'up')
        ? 'ok'
        : 'degraded',
      version: APP_VERSION,
      environment: this.app.NODE_ENV,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      services,
    };
  }
}
