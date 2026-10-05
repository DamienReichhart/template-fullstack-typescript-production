import { afterEach, describe, expect, it } from 'bun:test';

import type { DependencyStatus } from '../indicators/dependency-status.ts';
import { ProbeServer } from './probe-server.ts';

let server: ProbeServer | undefined;

async function start(dependencies: Record<string, DependencyStatus>) {
  server = new ProbeServer({ port: 0, dependencies: async () => dependencies });
  const port = await server.start();
  return (path: string) => fetch(`http://localhost:${port}${path}`);
}

describe('ProbeServer', () => {
  afterEach(async () => {
    await server?.stop();
  });

  it('answers liveness without checking dependencies', async () => {
    const get = await start({ redis: { status: 'down' } });
    const response = await get('/live');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('is ready when every dependency is up', async () => {
    const get = await start({ redis: { status: 'up', latencyMs: 1 } });
    expect((await get('/ready')).status).toBe(200);
  });

  it('is not ready when a dependency is down', async () => {
    const get = await start({ redis: { status: 'up' }, database: { status: 'down' } });
    const response = await get('/ready');
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ dependencies: { database: { status: 'down' } } });
  });

  it('returns 404 for unknown paths', async () => {
    const get = await start({});
    expect((await get('/metrics')).status).toBe(404);
  });
});
