/**
 * The migrator's one job, before each release: bring persistent state to what the release
 * expects, then exit. Both steps are idempotent, so running it on every deploy is safe.
 *  1. `prisma migrate deploy`: apply the pending migrations;
 *  2. provision the bucket: create it, apply CORS for `CORS_ORIGINS` and the lifecycle rules.
 *
 * The image is distroless: no shell, so the steps are chained here rather than with `&&`.
 * Paths are relative to this file, which sits at the same place in the image as in the repo.
 */
import { fileURLToPath } from 'node:url';

const repo = (path: string) => fileURLToPath(new URL(`../../../../${path}`, import.meta.url));

const prisma = Bun.spawnSync(
  ['bun', repo('node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
  { cwd: repo('packages/platform/database'), stdio: ['inherit', 'inherit', 'inherit'] },
);
if (prisma.exitCode !== 0) {
  console.error(`✖ prisma migrate deploy exited with ${prisma.exitCode}`);
  process.exit(prisma.exitCode || 1);
}

// Sets process.exitCode when provisioning fails.
await import('../../../../packages/platform/storage/src/scripts/provision-storage.ts');
