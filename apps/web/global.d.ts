import type { formats, Locale, Messages } from '@template/i18n';

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
    Formats: typeof formats;
  }
}
