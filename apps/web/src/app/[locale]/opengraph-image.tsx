import { getTranslations } from 'next-intl/server';
import { ImageResponse } from 'next/og';

import { localeFromParams } from '@/i18n/page-locale';
import { OG_IMAGE_SIZE } from '@/shared/seo/og-image';

export const alt = 'Template';
export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

/** Social preview card, generated per locale at build time. */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await localeFromParams(params);
  const t = await getTranslations({ locale, namespace: 'seo.pages.landing' });
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 80,
        background: '#18181b',
        color: '#fafafa',
      }}
    >
      <div style={{ fontSize: 32, opacity: 0.7 }}>Template</div>
      <div style={{ fontSize: 64, fontWeight: 700, marginTop: 24 }}>{t('title')}</div>
    </div>,
    size,
  );
}
