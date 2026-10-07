import { Module, type DynamicModule, type Provider, type Type } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import type { ConfigDefinition, ConfigType, defineProbeConfig } from '@template/config';

import { HealthController } from './controllers/health.controller.ts';
import { DependencyIndicator } from './indicators/dependency-indicator.ts';
import { PrismaIndicator } from './indicators/prisma.indicator.ts';
import { RedisIndicator } from './indicators/redis.indicator.ts';
import { StorageIndicator } from './indicators/storage.indicator.ts';
import { PROBE_PORT, ProbeServerLifecycle } from './probe/probe-server.lifecycle.ts';
import {
  DEPENDENCY_INDICATORS,
  ReadinessService,
  REPORTED_INDICATORS,
} from './readiness/readiness.service.ts';

export type Dependency = 'database' | 'redis' | 'storage';

const INDICATORS: Record<Dependency, Type<DependencyIndicator>> = {
  database: PrismaIndicator,
  redis: RedisIndicator,
  storage: StorageIndicator,
};

export interface DependencyOptions {
  /** The process cannot serve without these: readiness fails when one is down. */
  dependencies: readonly Dependency[];
  /**
   * Reported by `ReadinessService.dependencies()` (the system ping) but never failing
   * readiness: their outage degrades some features, it must not drain every request.
   */
  reported?: readonly Dependency[];
}

function readinessProviders({ dependencies, reported = [] }: DependencyOptions): Provider[] {
  const required = dependencies.map((dependency) => INDICATORS[dependency]);
  const optional = reported
    .filter((dependency) => !dependencies.includes(dependency))
    .map((dependency) => INDICATORS[dependency]);
  return [
    ...required,
    ...optional,
    {
      provide: DEPENDENCY_INDICATORS,
      inject: required,
      useFactory: (...instances: DependencyIndicator[]) => instances,
    },
    {
      provide: REPORTED_INDICATORS,
      inject: optional,
      useFactory: (...instances: DependencyIndicator[]) => instances,
    },
    ReadinessService,
  ];
}

type ProbeConfig = ReturnType<typeof defineProbeConfig>;

@Module({})
export class HealthModule {
  /** For HTTP runnables: `/health/live` and `/health/ready` controllers. */
  static forHttp(options: DependencyOptions): DynamicModule {
    return {
      module: HealthModule,
      imports: [TerminusModule],
      controllers: [HealthController],
      providers: readinessProviders(options),
      exports: [ReadinessService],
    };
  }

  /** For runnables without HTTP: a probe server on the port of `config`. */
  static forProbe(options: DependencyOptions & { config: ProbeConfig }): DynamicModule {
    const config: ConfigDefinition = options.config;
    return {
      module: HealthModule,
      imports: [TerminusModule],
      providers: [
        ...readinessProviders(options),
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
