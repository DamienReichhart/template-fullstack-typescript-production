/**
 * Enforces the folder conventions described in docs/architecture/conventions.md.
 *
 * A convention nobody checks is a suggestion. Every rule below fails with the exact
 * offending path so the fix is obvious. Rules only apply to folders that exist, so the
 * script stays green while the repository grows.
 *
 * Run: bun run check:structure
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dir, '..', '..');
const errors: string[] = [];

const rel = (path: string) => relative(ROOT, path);
const isDir = (path: string) => existsSync(path) && statSync(path).isDirectory();
const entries = (path: string) => (isDir(path) ? readdirSync(path) : []);
const dirs = (path: string) => entries(path).filter((name) => isDir(join(path, name)));
const fail = (path: string, message: string) => errors.push(`${rel(path)}: ${message}`);

function requireFiles(dir: string, files: string[]) {
  for (const file of files) {
    if (!existsSync(join(dir, file))) fail(dir, `missing ${file}`);
  }
}

function onlyAllow(dir: string, allowed: string[], label: string) {
  for (const name of entries(dir)) {
    if (!allowed.includes(name))
      fail(join(dir, name), `not allowed in ${label} (allowed: ${allowed.join(', ')})`);
  }
}

/** Nest runnables: src/ holds main.ts, the root module, modules/ and scripts/ — nothing else. */
const NEST_APPS: Record<string, string> = {
  api: 'app.module.ts',
  worker: 'worker.module.ts',
  scheduler: 'scheduler.module.ts',
};

for (const [app, rootModule] of Object.entries(NEST_APPS)) {
  const src = join(ROOT, 'apps', app, 'src');
  if (!isDir(src)) continue;
  onlyAllow(src, ['main.ts', rootModule, 'modules', 'scripts'], `apps/${app}/src`);
  for (const mod of dirs(join(src, 'modules'))) {
    requireFiles(join(src, 'modules', mod), [`${mod}.module.ts`]);
  }
}

/** Bounded contexts: README + GLOSSARY, fixed layer names, one module per Nest layer. */
const LAYERS = ['domain', 'application', 'infrastructure', 'http', 'jobs'];
const contextsRoot = join(ROOT, 'packages', 'contexts');
const contextNames = dirs(contextsRoot);

for (const context of contextNames) {
  const contextDir = join(contextsRoot, context);
  requireFiles(contextDir, ['README.md', 'GLOSSARY.md']);
  onlyAllow(contextDir, ['README.md', 'GLOSSARY.md', 'docs', ...LAYERS], `context ${context}`);

  for (const layer of LAYERS.filter((l) => l !== 'domain')) {
    const src = join(contextDir, layer, 'src');
    if (isDir(src)) requireFiles(src, ['index.ts', `${context}-${layer}.module.ts`]);
  }

  const domainSrc = join(contextDir, 'domain', 'src');
  if (isDir(domainSrc)) {
    onlyAllow(domainSrc, ['index.ts', 'aggregates', 'services'], `${context} domain/src`);
    for (const aggregate of dirs(join(domainSrc, 'aggregates'))) {
      requireFiles(join(domainSrc, 'aggregates', aggregate), [
        'index.ts',
        `${aggregate}.aggregate.ts`,
      ]);
    }
  }

  const appSrc = join(contextDir, 'application', 'src');
  for (const [slot, kind] of [
    ['commands', 'command'],
    ['queries', 'query'],
  ] as const) {
    for (const name of dirs(join(appSrc, slot))) {
      requireFiles(join(appSrc, slot, name), [
        `${name}.${kind}.ts`,
        `${name}.handler.ts`,
        `${name}.handler.spec.ts`,
      ]);
    }
  }
}

/** Platform: a Nest-aware package exposes src/<package>.module.ts. */
const platformRoot = join(ROOT, 'packages', 'platform');
for (const pkg of dirs(platformRoot)) {
  const manifest = join(platformRoot, pkg, 'package.json');
  if (!existsSync(manifest)) continue;
  const { dependencies = {}, peerDependencies = {} } = JSON.parse(readFileSync(manifest, 'utf8'));
  if ('@nestjs/common' in { ...dependencies, ...peerDependencies }) {
    requireFiles(join(platformRoot, pkg, 'src'), ['index.ts', `${pkg}.module.ts`]);
  }
}

/** Queue contracts: queues/<queue>/<queue>.queue.ts + <queue>.jobs.ts. */
const queuesDir = join(ROOT, 'packages', 'platform', 'queue', 'src', 'queues');
for (const queue of dirs(queuesDir)) {
  requireFiles(join(queuesDir, queue), [`${queue}.queue.ts`, `${queue}.jobs.ts`]);
}

/** Contracts mirror contexts and API modules; api-client mirrors contracts. */
const apiModules = dirs(join(ROOT, 'apps', 'api', 'src', 'modules'));
const contractsSrc = join(ROOT, 'packages', 'shared', 'contracts', 'src');
const contractAreas = dirs(contractsSrc).filter((name) => name !== 'common');
for (const area of contractAreas) {
  if (!contextNames.includes(area) && !apiModules.includes(area)) {
    fail(
      join(contractsSrc, area),
      'contract folders must be named after a bounded context or an api module',
    );
  }
  requireFiles(join(contractsSrc, area), ['index.ts', `${area}.routes.ts`]);
}
const endpointsDir = join(ROOT, 'packages', 'frontend', 'api-client', 'src', 'endpoints');
for (const file of entries(endpointsDir)) {
  const area = file.replace(/\.endpoints\.ts$/, '');
  if (!file.endsWith('.endpoints.ts') || !contractAreas.includes(area)) {
    fail(join(endpointsDir, file), 'endpoint files must be <contracts-folder>.endpoints.ts');
  }
}

/** i18n: every locale holds the same namespaces. */
const messagesDir = join(ROOT, 'packages', 'shared', 'i18n', 'messages');
const locales = dirs(messagesDir);
const reference = locales[0];
if (reference) {
  const expected = entries(join(messagesDir, reference)).sort().join(',');
  for (const locale of locales) {
    if (entries(join(messagesDir, locale)).sort().join(',') !== expected) {
      fail(join(messagesDir, locale), `namespaces differ from ${reference}/`);
    }
  }
}

/** Web features: index.ts is the only import surface. */
const featuresDir = join(ROOT, 'apps', 'web', 'src', 'features');
const features = dirs(featuresDir);
for (const feature of features) requireFiles(join(featuresDir, feature), ['index.ts']);

/** E2E suites mirror what they test. */
function mirror(dir: string, allowed: string[], label: string) {
  for (const name of dirs(dir)) {
    if (name !== 'support' && !allowed.includes(name))
      fail(join(dir, name), `must match a ${label}`);
  }
}
mirror(join(ROOT, 'apps', 'api-e2e', 'src'), apiModules, 'folder in apps/api/src/modules');
mirror(join(ROOT, 'apps', 'web-e2e', 'src'), features, 'folder in apps/web/src/features');

if (errors.length > 0) {
  console.error(`✖ Structure check failed (${errors.length}):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  console.error('\nSee docs/architecture/conventions.md');
  process.exit(1);
}
console.log('✔ Structure check passed');
