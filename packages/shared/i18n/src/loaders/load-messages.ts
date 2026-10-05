import type { Locale } from '../config/locales.ts';
import { namespaces } from '../config/namespaces.ts';
import type { Messages } from '../types/messages.ts';

/**
 * Loads every namespace of a locale.
 *
 * The specifier is a relative template on purpose: bundlers (Turbopack, webpack) can only
 * enumerate dynamic imports whose static prefix is a relative path. It resolves from `src/`
 * and from `dist/src/` alike because the build emits `messages/` into `dist/`.
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  const entries = await Promise.all(
    namespaces.map(async (namespace) => {
      const module = (await import(`../../messages/${locale}/${namespace}.json`, {
        with: { type: 'json' },
      })) as { default: unknown };
      return [namespace, module.default] as const;
    }),
  );
  return Object.fromEntries(entries) as unknown as Messages;
}
