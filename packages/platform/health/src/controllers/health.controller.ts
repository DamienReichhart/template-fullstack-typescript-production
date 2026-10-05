import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheck, type HealthCheckResult } from '@nestjs/terminus';
import { Public, SkipRateLimit } from '@template/http';

import { ReadinessService } from '../readiness/readiness.service.js';

/** Kubernetes-style probes, outside `/api/v1`: `/health/live` and `/health/ready`. */
@Controller({ path: 'health', version: VERSION_NEUTRAL })
@Public()
@SkipRateLimit()
export class HealthController {
  constructor(private readonly readiness: ReadinessService) {}

  /** The process is up. Never checks dependencies: a DB outage must not restart every pod. */
  @Get('live')
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /** The process can serve traffic: every dependency answers. */
  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.readiness.check();
  }
}
