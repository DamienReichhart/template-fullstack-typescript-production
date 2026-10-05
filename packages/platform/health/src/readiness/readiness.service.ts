import { Inject, Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  HealthIndicatorService,
  type HealthCheckResult,
} from '@nestjs/terminus';

import { DependencyIndicator } from '../indicators/dependency-indicator.ts';
import type { DependencyStatus } from '../indicators/dependency-status.ts';

export const DEPENDENCY_INDICATORS = Symbol.for('template:dependency-indicators');

/** Answers "can this process do its job right now?" from its dependency indicators. */
@Injectable()
export class ReadinessService {
  constructor(
    @Inject(DEPENDENCY_INDICATORS) private readonly indicators: DependencyIndicator[],
    private readonly healthCheck: HealthCheckService,
    private readonly healthIndicator: HealthIndicatorService,
  ) {}

  /** Status of every dependency, keyed by name. Used by `/health/ready` and the system ping. */
  async dependencies(): Promise<Record<string, DependencyStatus>> {
    const results = await Promise.all(
      this.indicators.map(async (indicator) => [indicator.name, await indicator.check()] as const),
    );
    return Object.fromEntries(results);
  }

  /** Terminus-formatted readiness; throws a 503 when a dependency is down. */
  check(): Promise<HealthCheckResult> {
    return this.healthCheck.check(
      this.indicators.map((indicator) => async () => {
        const { status, ...details } = await indicator.check();
        const session = this.healthIndicator.check(indicator.name);
        return status === 'up' ? session.up(details) : session.down(details);
      }),
    );
  }
}
