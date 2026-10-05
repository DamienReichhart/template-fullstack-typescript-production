/**
 * The web app is presentation only (docs/adr: "the frontend holds no business logic").
 *
 * ESLint already bans Server Actions, but a rule can be disabled inline; this check cannot.
 * It fails on:
 *  - a `'use server'` directive anywhere in apps/web/src (Server Actions);
 *  - a `route.*` file under apps/web/src/app (Route Handlers: an API belongs in apps/api).
 * Metadata routes (robots.ts, sitemap.ts, manifest.ts, opengraph-image.tsx, …) are rendering,
 * not endpoints, and stay allowed.
 *
 * Run: bun run check:server-logic
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const WEB_SRC = join(ROOT, 'apps', 'web', 'src');
const APP_DIR = join(WEB_SRC, 'app');
const SOURCE = /\.(?:[cm]?[jt]sx?)$/;
const ROUTE_HANDLER = /^route\.(?:[cm]?[jt]sx?)$/;
const USE_SERVER = /^\s*(['"])use server\1\s*;?\s*$/m;

const errors: string[] = [];

function walk(dir: string, visit: (file: string) => void): void {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, visit);
    else visit(path);
  }
}

walk(WEB_SRC, (file) => {
  if (!SOURCE.test(file)) return;
  const name = relative(ROOT, file);
  if (USE_SERVER.test(readFileSync(file, 'utf8'))) {
    errors.push(`${name}: 'use server' (Server Actions are not allowed; call the api instead)`);
  }
  if (file.startsWith(APP_DIR) && ROUTE_HANDLER.test(file.split('/').pop() ?? '')) {
    errors.push(`${name}: Route Handler (endpoints belong in apps/api)`);
  }
});

if (errors.length > 0) {
  console.error(`✖ Server logic found in the web app (${errors.length}):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log('✔ No server logic in the web app');
