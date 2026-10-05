import { describe, expect, it } from 'bun:test';
import type { ReadinessService } from '@template/health';

import { SystemStatusService } from './system-status.service.js';

const readiness = (database: 'up' | 'down') =>
  ({
    dependencies: async () => ({
      database: { status: database, latencyMs: 2 },
      redis: { status: 'up', latencyMs: 1 },
    }),
  }) as unknown as ReadinessService;

describe('SystemStatusService', () => {
  it('reports ok with the latency of each dependency when everything is up', async () => {
    const ping = await new SystemStatusService(readiness('up'), {
      NODE_ENV: 'test',
      LOG_LEVEL: 'info',
    }).ping();

    expect(ping).toMatchObject({
      status: 'ok',
      environment: 'test',
      services: { database: { status: 'up', latencyMs: 2 }, redis: { status: 'up', latencyMs: 1 } },
    });
    expect(ping.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('reports degraded when a dependency is down', async () => {
    const ping = await new SystemStatusService(readiness('down'), {
      NODE_ENV: 'test',
      LOG_LEVEL: 'info',
    }).ping();
    expect(ping.status).toBe('degraded');
  });
});
