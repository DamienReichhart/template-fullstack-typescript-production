import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEnvConfig } from '@next/env';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

// One `.env` for the whole monorepo, at the root. Next already loaded (and cached) the app
// folder's env files, hence the forced reload.
loadEnvConfig(ROOT, process.env.NODE_ENV !== 'production', console, true);

/**
 * Workspace packages are compiled by Next from their TypeScript sources, like the rest of
 * the app: no package build in the dev loop. Turbopack has no custom export conditions, so
 * each `@template/source` export is turned into an explicit alias.
 */
function workspaceSourceAliases(packages: readonly string[]): Record<string, string> {
  const aliases: Record<string, string> = {};
  for (const name of packages) {
    const dir = realpathSync(join(ROOT, 'node_modules', name));
    const { exports } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
      exports: Record<string, unknown>;
    };
    for (const [subpath, target] of Object.entries(exports)) {
      const source =
        typeof target === 'object' && target
          ? (target as Record<string, string>)['@template/source']
          : undefined;
      if (!source) continue;
      const specifier = subpath === '.' ? name : `${name}/${subpath.slice(2)}`;
      const toAlias = (file: string) => `./${relative(process.cwd(), file)}`;
      if (!source.includes('*')) {
        aliases[specifier] = toAlias(join(dir, source));
        continue;
      }
      const [prefix = '', suffix = ''] = source.split('*');
      const base = join(dir, prefix);
      const walk = (folder: string): void => {
        for (const entry of readdirSync(folder)) {
          const file = join(folder, entry);
          if (statSync(file).isDirectory()) walk(file);
          else if (file.endsWith(suffix) && !file.includes('.spec.')) {
            aliases[specifier.replace('*', relative(base, file).slice(0, -suffix.length))] =
              toAlias(file);
          }
        }
      };
      if (existsSync(base)) walk(base);
    }
  }
  return aliases;
}

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: ROOT,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // The root layout lives under `[locale]` (for `next/root-params`), so URLs matching no
    // route need a layout-free 404: app/global-not-found.tsx.
    globalNotFound: true,
  },
  turbopack: {
    root: ROOT,
    resolveAlias: workspaceSourceAliases([
      '@template/ui',
      '@template/api-client',
      '@template/contracts',
      '@template/i18n',
    ]),
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
