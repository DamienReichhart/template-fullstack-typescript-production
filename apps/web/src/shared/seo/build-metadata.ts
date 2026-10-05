import { defaultLocale, locales, type Locale } from '@template/i18n';
import type { Metadata } from 'next';

import { siteConfig } from '../config/site.config';

export interface PageMetadataInput {
  locale: Locale;
  /** Locale-less path, e.g. `/login`. */
  path: string;
  title: string;
  description: string;
  /** Private or transient pages (dashboard, token links) stay out of search engines. */
  noIndex?: boolean;
}

export const localizedUrl = (locale: string, path: string): string =>
  `${siteConfig.url}/${locale}${path === '/' ? '' : path}`;

/** Canonical URL, hreflang alternates, Open Graph and robots for one localized page. */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = localizedUrl(locale, path);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          locales.map((candidate) => [candidate, localizedUrl(candidate, path)]),
        ),
        'x-default': localizedUrl(defaultLocale, path),
      },
    },
    openGraph: { type: 'website', url, title, description, siteName: siteConfig.name, locale },
    twitter: { card: 'summary_large_image', title, description },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
