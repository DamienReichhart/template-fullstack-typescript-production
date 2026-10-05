import { defaultLocale, locales } from '@template/i18n';
import { defineRouting } from 'next-intl/routing';

/** Every page lives under `/<locale>/…`; the default locale is prefixed too (stable canonical URLs). */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeCookie: { name: 'tpl_locale', maxAge: 60 * 60 * 24 * 365 },
});
