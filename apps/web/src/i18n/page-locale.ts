import type { Locale } from '@template/i18n';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { locale as rootLocale } from 'next/root-params';

import { routing } from './routing';

function narrow(locale: string | undefined): Locale {
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}

/**
 * The `[locale]` root param, typed. Works in any Server Component without prop drilling
 * and without `headers()`, so pages stay static.
 */
export async function getPageLocale(): Promise<Locale> {
  return narrow(await rootLocale());
}

/** Route handlers (`opengraph-image`, …) cannot read root params: they parse `params`. */
export async function localeFromParams(params: Promise<{ locale: string }>): Promise<Locale> {
  return narrow((await params).locale);
}
