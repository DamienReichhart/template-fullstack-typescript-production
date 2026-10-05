import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { defaultLocale, locales } from './config/locales.ts';
import { namespaces } from './config/namespaces.ts';
import { loadMessages } from './loaders/load-messages.ts';

const MESSAGES_DIR = join(import.meta.dir, '..', 'messages');

function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function readCatalog(locale: string, namespace: string): unknown {
  return JSON.parse(readFileSync(join(MESSAGES_DIR, locale, `${namespace}.json`), 'utf8'));
}

describe('message catalogs', () => {
  it('declares exactly the namespaces present on disk', () => {
    for (const locale of locales) {
      const files = readdirSync(join(MESSAGES_DIR, locale)).map((file) =>
        file.replace('.json', ''),
      );
      expect(files.sort()).toEqual([...namespaces].sort());
    }
  });

  for (const locale of locales.filter((l) => l !== defaultLocale)) {
    for (const namespace of namespaces) {
      it(`${locale}/${namespace}.json has the same keys as ${defaultLocale}`, () => {
        const reference = keyPaths(readCatalog(defaultLocale, namespace)).sort();
        expect(keyPaths(readCatalog(locale, namespace)).sort()).toEqual(reference);
      });
    }
  }

  it('loads every namespace of a locale', async () => {
    const messages = await loadMessages('fr');
    expect(Object.keys(messages).sort()).toEqual([...namespaces].sort());
    expect(messages.auth.login.submit).toBe('Se connecter');
  });
});
