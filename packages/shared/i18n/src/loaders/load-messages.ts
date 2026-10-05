import type { Locale } from '../config/locales.js';
import { namespaces } from '../config/namespaces.js';
import type { Messages } from '../types/messages.js';

/**
 * Loads every namespace of a locale. Resolved through the package's own `./messages/*`
 * export so it works from sources, from `dist/` and inside bundlers alike.
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  const entries = await Promise.all(
    namespaces.map(async (namespace) => {
      const module = (await import(`@template/i18n/messages/${locale}/${namespace}.json`, {
        with: { type: 'json' },
      })) as { default: unknown };
      return [namespace, module.default] as const;
    }),
  );
  return Object.fromEntries(entries) as unknown as Messages;
}
