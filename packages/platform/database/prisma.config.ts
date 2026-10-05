import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { defineConfig, env } from 'prisma/config';

// The monorepo keeps a single `.env` at the root; variables already set (CI, containers) win.
const rootEnv = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

// `PRISMA_TARGET=test` points the CLI at the integration/e2e database.
const urlVariable = process.env['PRISMA_TARGET'] === 'test' ? 'DATABASE_TEST_URL' : 'DATABASE_URL';

// `prisma generate` never connects: it must work in image builds without a database URL.
const generating = process.argv.includes('generate');

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: generating
      ? (process.env[urlVariable] ?? 'postgresql://unused@localhost/unused')
      : env(urlVariable),
  },
});
