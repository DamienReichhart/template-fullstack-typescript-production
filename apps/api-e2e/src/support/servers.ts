import { join } from 'node:path';

import type { Subprocess } from 'bun';

import { e2eEnv } from './env.ts';

const ROOT = join(import.meta.dir, '..', '..', '..', '..');
const STARTUP_TIMEOUT_MS = 60_000;

interface Service {
  name: string;
  cwd: string;
  readyUrl: string;
}

const SERVICES: Service[] = [
  { name: 'api', cwd: join(ROOT, 'apps', 'api'), readyUrl: `${e2eEnv.apiUrl}/health/ready` },
  {
    name: 'worker',
    cwd: join(ROOT, 'apps', 'worker'),
    readyUrl: `${e2eEnv.workerHealthUrl}/ready`,
  },
];

async function isReady(url: string): Promise<boolean> {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(1_000) })).ok;
  } catch {
    return false;
  }
}

async function waitUntilReady(service: Service, process: Subprocess): Promise<void> {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`${service.name} exited with code ${process.exitCode} during startup`);
    }
    if (await isReady(service.readyUrl)) return;
    await Bun.sleep(250);
  }
  throw new Error(
    `${service.name} not ready at ${service.readyUrl} after ${STARTUP_TIMEOUT_MS} ms`,
  );
}

/**
 * Reuses a service that already answers its readiness probe (e.g. `bunx nx dev api`),
 * otherwise starts it from source with the capture mail transport. Returns a stop function
 * for the processes it started.
 */
export async function ensureServers(): Promise<() => void> {
  const started: Subprocess[] = [];
  for (const service of SERVICES) {
    if (await isReady(service.readyUrl)) continue;
    const child = Bun.spawn(['bun', '--conditions=@template/source', 'src/main.ts'], {
      cwd: service.cwd,
      env: { ...process.env, MAIL_TRANSPORT: 'capture', LOG_LEVEL: 'warn' },
      stdout: 'ignore',
      stderr: 'inherit',
    });
    started.push(child);
    await waitUntilReady(service, child);
  }
  return () => {
    for (const child of started) child.kill('SIGTERM');
  };
}
