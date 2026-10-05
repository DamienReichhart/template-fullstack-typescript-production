import { formats, loadMessages } from '@template/i18n';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { locale as rootLocale } from 'next/root-params';

import { routing } from './routing';

/**
 * Locale resolution order:
 * 1. an explicit `getTranslations({ locale })` (route handlers such as `opengraph-image`);
 * 2. the `[locale]` root param — reads no headers, so pages stay statically rendered;
 * 3. the proxy's header, only reached outside `[locale]`.
 *
 * `params` is not destructured: `requestLocale` is a getter that calls `headers()` the
 * moment it is read, which would opt every page into dynamic rendering.
 */
export default getRequestConfig(async (params) => {
  const requested = params.locale ?? (await rootLocale()) ?? (await params.requestLocale);
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    messages: await loadMessages(locale),
    formats,
    timeZone: 'UTC',
  };
});
