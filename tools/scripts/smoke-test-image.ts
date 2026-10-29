/**
 * Boots a production image against the docker compose infrastructure and waits until it reports
 * ready: the e2e suites run the apps from source, this proves the image that ships starts.
 *
 * It catches what a build cannot: a dependency pruned from the image, a file left out of it, a
 * config the production schema rejects, a probe that never answers.
 *  - api, worker, scheduler: `/ready` (Postgres, Redis, storage reachable) answers 200;
 *  - web: the home page renders;
 *  - migrator: `prisma migrate deploy` exits 0 against the database.
 *
 * Needs `bun run docker:up` and the root `.env`. The container shares the host network, so the
 * `.env` addresses (localhost) work unchanged; stop `bun run dev` first, it holds the same ports.
 *
 * Run: bun tools/scripts/smoke-test-image.ts <api|worker|scheduler|web|migrator> <image>
 */
import { $ } from 'bun';

const PROBES: Record<string, string> = {
  api: 'http://localhost:4000/health/ready',
  worker: 'http://localhost:4100/ready',
  scheduler: 'http://localhost:4200/ready',
  web: 'http://localhost:3000/',
};
const TIMEOUT_MS = 90_000;

function usage(): never {
  console.error(
    'Usage: bun tools/scripts/smoke-test-image.ts <api|worker|scheduler|web|migrator> <image>',
  );
  process.exit(2);
}

const [app, image] = process.argv.slice(2);
if (!app || !image) usage();

// Production settings, minus what needs a real secret or domain: emails stay in Redis.
const env = ['NODE_ENV=production', 'MAIL_TRANSPORT=capture'].map((pair) => `--env=${pair}`);
const runArgs = ['--network=host', '--env-file=.env', ...env];

if (app === 'migrator') {
  const { exitCode } = await $`docker run --rm ${runArgs} ${image}`.nothrow();
  console.log(
    exitCode === 0 ? `✔ ${image} applied the migrations` : `✘ ${image} exited with ${exitCode}`,
  );
  process.exit(exitCode);
}

const probe = PROBES[app];
if (!probe) usage();

const container = `smoke-${app}-${process.pid}`;
await $`docker run -d --name ${container} ${runArgs} ${image}`.quiet();

async function ready(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(3_000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function running(): Promise<boolean> {
  const state = await $`docker inspect -f {{.State.Running}} ${container}`.quiet().nothrow().text();
  return state.trim() === 'true';
}

let passed = false;
const deadline = Date.now() + TIMEOUT_MS;
while (Date.now() < deadline) {
  if (await ready(probe)) {
    passed = true;
    break;
  }
  if (!(await running())) break;
  await Bun.sleep(2_000);
}

if (passed) {
  console.log(`✔ ${image} is ready (${probe})`);
} else {
  console.error(`✘ ${image} did not become ready at ${probe} within ${TIMEOUT_MS / 1000}s. Logs:`);
  await $`docker logs ${container}`.nothrow();
}
await $`docker rm -f ${container}`.quiet().nothrow();
process.exit(passed ? 0 : 1);
