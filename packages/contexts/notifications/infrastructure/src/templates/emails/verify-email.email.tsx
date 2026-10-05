import { Link } from '@react-email/components';

import { EmailButton } from '../components/email-button.tsx';
import { EmailHeading, EmailParagraph } from '../components/email-text.tsx';
import { EmailLayout } from '../layouts/email-layout.tsx';
import type { Translate } from '../translate.ts';

export interface VerifyEmailEmailProps {
  t: Translate;
  lang: string;
  appName: string;
  name: string;
  verificationUrl: string;
  expiresInHours: number;
}

export function VerifyEmailEmail({
  t,
  lang,
  appName,
  name,
  verificationUrl,
  expiresInHours,
}: VerifyEmailEmailProps) {
  return (
    <EmailLayout
      lang={lang}
      appName={appName}
      preview={t('verifyEmail.preview')}
      footer={t('layout.footer', { appName })}
    >
      <EmailHeading>{t('verifyEmail.heading', { name })}</EmailHeading>
      <EmailParagraph>{t('verifyEmail.body', { hours: expiresInHours })}</EmailParagraph>
      <EmailButton href={verificationUrl}>{t('verifyEmail.cta')}</EmailButton>
      <EmailParagraph muted>
        <Link href={verificationUrl}>{verificationUrl}</Link>
      </EmailParagraph>
      <EmailParagraph muted>{t('verifyEmail.ignore')}</EmailParagraph>
    </EmailLayout>
  );
}
