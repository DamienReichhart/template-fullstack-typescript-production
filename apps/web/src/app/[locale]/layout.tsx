import { locales } from '@template/i18n';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { getPageLocale } from '@/i18n/page-locale';
import { siteConfig } from '@/shared/config/site.config';
import { AppProviders } from '@/shared/providers/app-providers';

import '@/styles/globals.css';

/** Every locale is prerendered; any other first segment 404s at the router. */
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPageLocale();
  const t = await getTranslations({ locale, namespace: 'seo.default' });
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    applicationName: siteConfig.name,
  };
}

/** Root layout: it sits under `[locale]` so `next/root-params` can expose the locale. */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getPageLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen">
        <NextIntlClientProvider>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
