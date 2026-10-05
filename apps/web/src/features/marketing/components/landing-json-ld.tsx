import { useLocale, useTranslations } from 'next-intl';

import { siteConfig } from '@/shared/config/site.config';
import { localizedUrl } from '@/shared/seo/build-metadata';
import { JsonLd } from '@/shared/seo/json-ld';

/** schema.org description of the site for rich search results. */
export function LandingJsonLd() {
  const t = useTranslations('seo.pages.landing');
  const locale = useLocale();
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteConfig.name,
        url: localizedUrl(locale, '/'),
        description: t('description'),
        inLanguage: locale,
      }}
    />
  );
}
