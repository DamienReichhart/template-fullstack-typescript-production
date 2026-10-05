import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { VerifyEmailView } from '@/features/auth';
import { getPageLocale } from '@/i18n/page-locale';
import { AppRoutes } from '@/shared/config/app-routes';
import { buildMetadata } from '@/shared/seo/build-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getPageLocale();
  const t = await getTranslations({ locale, namespace: 'seo.pages.verifyEmail' });
  return buildMetadata({
    locale,
    path: AppRoutes.verifyEmail,
    title: t('title'),
    description: t('description'),
    noIndex: true,
  });
}

/** The token arrives in the emailed link: `?token=…`. */
export default async function Page(props: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await props.searchParams;
  return <VerifyEmailView token={token ?? null} />;
}
