import { EmailButton } from '../components/email-button.js';
import { EmailHeading, EmailParagraph } from '../components/email-text.js';
import { EmailLayout } from '../layouts/email-layout.js';
import type { Translate } from '../translate.js';

export interface WelcomeEmailProps {
  t: Translate;
  lang: string;
  appName: string;
  name: string;
  appUrl: string;
}

export function WelcomeEmail({ t, lang, appName, name, appUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout
      lang={lang}
      appName={appName}
      preview={t('welcome.preview')}
      footer={t('layout.footer', { appName })}
    >
      <EmailHeading>{t('welcome.heading', { name })}</EmailHeading>
      <EmailParagraph>{t('welcome.body')}</EmailParagraph>
      <EmailButton href={appUrl}>{t('welcome.cta', { appName })}</EmailButton>
    </EmailLayout>
  );
}
