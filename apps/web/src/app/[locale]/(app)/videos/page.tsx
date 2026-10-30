import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { VideosView } from '@/features/videos';
import { getPageLocale } from '@/i18n/page-locale';
import { AppRoutes } from '@/shared/config/app-routes';
import { buildMetadata } from '@/shared/seo/build-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPageLocale();
  const t = await getTranslations({ locale, namespace: 'seo.pages.videos' });
  return buildMetadata({
    locale,
    path: AppRoutes.videos,
    title: t('title'),
    description: t('description'),
    noIndex: true,
  });
}

export default async function VideosPage() {
  return <VideosView />;
}
