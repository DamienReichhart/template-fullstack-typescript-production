import { Link } from '@react-email/components';

import { EmailButton } from '../components/email-button.tsx';
import { EmailHeading, EmailParagraph } from '../components/email-text.tsx';
import { EmailLayout } from '../layouts/email-layout.tsx';
import type { Translate } from '../translate.ts';

export interface ResetPasswordEmailProps {
  t: Translate;
  lang: string;
  appName: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function ResetPasswordEmail({
  t,
  lang,
  appName,
  resetUrl,
  expiresInMinutes,
}: ResetPasswordEmailProps) {
  return (
    <EmailLayout
      lang={lang}
      appName={appName}
      preview={t('resetPassword.preview')}
      footer={t('layout.footer', { appName })}
    >
      <EmailHeading>{t('resetPassword.heading')}</EmailHeading>
      <EmailParagraph>{t('resetPassword.body', { minutes: expiresInMinutes })}</EmailParagraph>
      <EmailButton href={resetUrl}>{t('resetPassword.cta')}</EmailButton>
      <EmailParagraph muted>
        <Link href={resetUrl}>{resetUrl}</Link>
      </EmailParagraph>
      <EmailParagraph muted>{t('resetPassword.ignore')}</EmailParagraph>
    </EmailLayout>
  );
}
