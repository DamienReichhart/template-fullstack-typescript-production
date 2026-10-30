/**
 * Builds and boots docker-compose.prod.yaml, all but cloudflared (it needs a real tunnel), then
 * asks nginx for each route the way cloudflared forwards it, by Host header: the web app, the
 * api's readiness (Postgres, Redis, storage) and the object storage.
 *
 * It catches what booting one image cannot: an address that no longer matches nginx.conf or
 * pg_hba.conf, a path a read-only container cannot write, an .env key a service is not given,
 * a migrator that leaves the database or the bucket behind.
 *
 * Needs the root `.env` (`cp .env.example .env`) and a Linux host: nginx is reached on its fixed
 * address (NGINX_IP). Leaves nothing behind (`down -v`), the images aside (tag `smoke`).
 *
 * Run: bun tools/scripts/smoke-test-stack.ts
 */
import { request } from 'node:http';

import { $ } from 'bun';

const COMPOSE = ['-f', 'docker-compose.prod.yaml'];
const SERVICES = [
  'database',
  'redis',
  's3',
  'migrator',
  'api',
  'worker',
  'scheduler',
  'web',
  'nginx',
];
const ROUTES = [
  { host: 'example.test', path: '/robots.txt' },
  { host: 'api.example.test', path: '/health/ready' },
  { host: 's3.example.test', path: '/health' },
];

// Bun loaded the root .env. Production-only values it leaves empty; emails stay in Redis.
const redisPassword = 'smoke-test-password';
const env = {
  ...process.env,
  IMAGE_TAG: 'smoke',
  REDIS_PASSWORD: redisPassword,
  REDIS_URL: `redis://:${redisPassword}@${process.env['REDIS_IP']}:6379`,
  CLOUDFLARE_TUNNEL_TOKEN: 'unused',
  MAIL_TRANSPORT: 'capture',
};
const nginx = process.env['NGINX_IP'];
if (!nginx) {
  console.error('✘ NGINX_IP is not set: copy .env.example to .env first.');
  process.exit(2);
}

function get(host: string, path: string): Promise<number> {
  return new Promise((resolve) => {
    const req = request(
      { host: nginx, port: 8080, path, headers: { host }, timeout: 5_000 },
      (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      },
    );
    req.on('timeout', () => req.destroy());
    req.on('error', () => resolve(0));
    req.end();
  });
}

let passed = false;
try {
  const up = await $`docker compose ${COMPOSE} up -d --build --wait --wait-timeout 300 ${SERVICES}`
    .env(env)
    .nothrow();
  if (up.exitCode === 0) {
    passed = true;
    for (const { host, path } of ROUTES) {
      const status = await get(host, path);
      const ok = status === 200;
      passed &&= ok;
      console.log(`${ok ? '✔' : '✘'} ${host}${path} answered ${status || 'nothing'}`);
    }
  }
  if (!passed) {
    console.error('✘ The production stack is not healthy. Logs:');
    await $`docker compose ${COMPOSE} logs --no-color --tail=100`.env(env).nothrow();
  }
} finally {
  await $`docker compose ${COMPOSE} down -v`.env(env).quiet().nothrow();
}
console.log(passed ? '✔ The production stack serves every route' : '✘ Smoke test failed');
process.exit(passed ? 0 : 1);
