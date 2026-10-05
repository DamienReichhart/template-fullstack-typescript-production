import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { defineConfig, env } from 'prisma/config';

// The monorepo keeps a single `.env` at the root; variables already set (CI, containers) win.
const rootEnv = fileURLToPath(new URL('../../../.env', import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

// `PRISMA_TARGET=test` points the CLI at the integration/e2e database.
const urlVariable = process.env['PRISMA_TARGET'] === 'test' ? 'DATABASE_TEST_URL' : 'DATABASE_URL';

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env(urlVariable),
  },
});
