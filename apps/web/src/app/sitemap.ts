import { locales } from '@template/i18n';
import type { MetadataRoute } from 'next';

import { INDEXABLE_ROUTES } from '@/shared/config/app-routes';
import { localizedUrl } from '@/shared/seo/build-metadata';

/** One entry per public page, with its alternates in every locale. */
export default function sitemap(): MetadataRoute.Sitemap {
  return INDEXABLE_ROUTES.flatMap((path) =>
    locales.map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency: 'monthly' as const,
      priority: path === '/' ? 1 : 0.5,
      alternates: {
        languages: Object.fromEntries(locales.map((other) => [other, localizedUrl(other, path)])),
      },
    })),
  );
}
