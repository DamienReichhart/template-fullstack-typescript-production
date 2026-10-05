import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

const ROOT = join(import.meta.dirname, '..', '..');
// The root .env, like every other project; variables already set (CI) take precedence.
if (existsSync(join(ROOT, '.env'))) process.loadEnvFile(join(ROOT, '.env'));

const CI = Boolean(process.env.CI);
const webUrl = process.env.WEB_APP_URL ?? 'http://localhost:3000';
const apiUrl = process.env.API_PUBLIC_URL ?? 'http://localhost:4000';
const workerPort = process.env.WORKER_HEALTH_PORT ?? '4100';
const backendEnv = { ...process.env, MAIL_TRANSPORT: 'capture', LOG_LEVEL: 'warn' } as Record<
  string,
  string
>;

/**
 * Drives the real stack: api, worker (emails land in the capture outbox) and web. Locally,
 * servers that are already running are reused; CI starts everything and serves the
 * production build of the web app, which is what ships.
 */
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.e2e-spec.ts',
  outputDir: './test-results',
  // Rate limits are per client IP: one worker, counters reset between tests.
  fullyParallel: false,
  workers: 1,
  // A retry hides a flake; a trace explains it.
  retries: 0,
  forbidOnly: CI,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: webUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Images with a system Chromium (sandboxes, some CI runners) point at it here.
        launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
      },
    },
  ],
  webServer: [
    {
      name: 'api',
      command: 'bun --conditions=@template/source src/main.ts',
      cwd: join(ROOT, 'apps', 'api'),
      url: `${apiUrl}/health/ready`,
      env: backendEnv,
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
    {
      name: 'worker',
      command: 'bun --conditions=@template/source src/main.ts',
      cwd: join(ROOT, 'apps', 'worker'),
      url: `http://localhost:${workerPort}/ready`,
      env: backendEnv,
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
    {
      name: 'web',
      // The package scripts pin NODE_ENV=production: the root .env says development.
      command: CI ? 'bun run build && bun run start' : 'bun --bun next dev --port 3000',
      cwd: join(ROOT, 'apps', 'web'),
      url: `${webUrl}/robots.txt`,
      reuseExistingServer: !CI,
      timeout: 180_000,
    },
  ],
});
