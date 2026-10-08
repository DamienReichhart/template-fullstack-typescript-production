import 'reflect-metadata';

import { describe, expect, it } from 'bun:test';
import { TerminusModule } from '@nestjs/terminus';
import { Test } from '@nestjs/testing';

import type { DependencyIndicator } from '../indicators/dependency-indicator.ts';
import type { DependencyStatus } from '../indicators/dependency-status.ts';
import {
  DEPENDENCY_INDICATORS,
  ReadinessService,
  REPORTED_INDICATORS,
} from './readiness.service.ts';

const indicator = (name: string, status: DependencyStatus['status']): DependencyIndicator => ({
  name,
  check: async () => ({ status }),
});

async function readiness(required: DependencyIndicator[], reported: DependencyIndicator[]) {
  const moduleRef = await Test.createTestingModule({
    imports: [TerminusModule],
    providers: [
      ReadinessService,
      { provide: DEPENDENCY_INDICATORS, useValue: required },
      { provide: REPORTED_INDICATORS, useValue: reported },
    ],
  }).compile();
  return moduleRef.get(ReadinessService);
}

describe('ReadinessService', () => {
  it('stays ready when only a reported dependency is down, and still reports it', async () => {
    const service = await readiness([indicator('database', 'up')], [indicator('storage', 'down')]);

    await expect(service.check()).resolves.toMatchObject({ status: 'ok' });
    expect(await service.required()).toEqual({ database: { status: 'up' } });
    expect(await service.dependencies()).toEqual({
      database: { status: 'up' },
      storage: { status: 'down' },
    });
  });

  it('is not ready when a required dependency is down', async () => {
    const service = await readiness([indicator('database', 'down')], []);
    await expect(service.check()).rejects.toThrow();
  });
});
