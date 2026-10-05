import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { LandingView } from '@/features/marketing';
import { getPageLocale } from '@/i18n/page-locale';
import { AppRoutes } from '@/shared/config/app-routes';
import { buildMetadata } from '@/shared/seo/build-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPageLocale();
  const t = await getTranslations({ locale, namespace: 'seo.pages.landing' });
  return buildMetadata({
    locale,
    path: AppRoutes.home,
    title: t('title'),
    description: t('description'),
  });
}

export default async function LandingPage() {
  return <LandingView />;
}
