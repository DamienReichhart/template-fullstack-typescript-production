import { Module, type DynamicModule, type Provider, type Type } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import type { ConfigDefinition, ConfigType, defineProbeConfig } from '@template/config';

import { HealthController } from './controllers/health.controller.ts';
import { DependencyIndicator } from './indicators/dependency-indicator.ts';
import { PrismaIndicator } from './indicators/prisma.indicator.ts';
import { RedisIndicator } from './indicators/redis.indicator.ts';
import { PROBE_PORT, ProbeServerLifecycle } from './probe/probe-server.lifecycle.ts';
import { DEPENDENCY_INDICATORS, ReadinessService } from './readiness/readiness.service.ts';

export type Dependency = 'database' | 'redis';

const INDICATORS: Record<Dependency, Type<DependencyIndicator>> = {
  database: PrismaIndicator,
  redis: RedisIndicator,
};

function readinessProviders(dependencies: readonly Dependency[]): Provider[] {
  const indicators = dependencies.map((dependency) => INDICATORS[dependency]);
  return [
    ...indicators,
    {
      provide: DEPENDENCY_INDICATORS,
      inject: indicators,
      useFactory: (...instances: DependencyIndicator[]) => instances,
    },
    ReadinessService,
  ];
}

type ProbeConfig = ReturnType<typeof defineProbeConfig>;

@Module({})
export class HealthModule {
  /** For HTTP runnables: `/health/live` and `/health/ready` controllers. */
  static forHttp(options: { dependencies: readonly Dependency[] }): DynamicModule {
    return {
      module: HealthModule,
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: readinessProviders(options.dependencies),
      exports: [ReadinessService],
    };
  }

  /** For runnables without HTTP: a probe server on the port of `config`. */
  static forProbe(options: {
    dependencies: readonly Dependency[];
    config: ProbeConfig;
  }): DynamicModule {
    const config: ConfigDefinition = options.config;
    return {
      module: HealthModule,
      imports: [TerminusModule],
      providers: [
        ...readinessProviders(options.dependencies),
        {
          provide: PROBE_PORT,
          inject: [config.token],
          useFactory: (probe: ConfigType<ProbeConfig>) => probe.port,
        },
        ProbeServerLifecycle,
      ],
      exports: [ReadinessService],
    };
  }
}
