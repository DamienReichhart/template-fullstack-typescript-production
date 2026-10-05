import { defaultLocale } from '@template/i18n';
import type { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = { title: '404', robots: { index: false } };

/**
 * URLs that match no route at all (the proxy prefixes every page path, so this is rare).
 * It renders outside any layout and locale, hence no translations.
 */
export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale}>
      <body className="flex min-h-screen items-center justify-center">
        <a href={`/${defaultLocale}`} className="underline">
          Page not found. Back to home
        </a>
      </body>
    </html>
  );
}
