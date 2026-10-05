import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { DashboardView } from '@/features/dashboard';
import { getPageLocale } from '@/i18n/page-locale';
import { AppRoutes } from '@/shared/config/app-routes';
import { buildMetadata } from '@/shared/seo/build-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPageLocale();
  const t = await getTranslations({ locale, namespace: 'seo.pages.dashboard' });
  return buildMetadata({
    locale,
    path: AppRoutes.dashboard,
    title: t('title'),
    description: t('description'),
    noIndex: true,
  });
}

export default async function DashboardPage() {
  return <DashboardView />;
}
