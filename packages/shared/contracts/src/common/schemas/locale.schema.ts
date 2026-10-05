import { defaultLocale, locales } from '@template/i18n';
import { z } from 'zod';

export const localeSchema = z.enum(locales);

/** Optional on input; falls back to the default locale. */
export const preferredLocaleSchema = localeSchema.default(defaultLocale);
