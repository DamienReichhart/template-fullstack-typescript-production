import type { EmailTemplate } from '@template/notifications-application';
import type { ReactElement } from 'react';

import { ResetPasswordEmail } from '../templates/emails/reset-password.email.tsx';
import { VerifyEmailEmail } from '../templates/emails/verify-email.email.tsx';
import { WelcomeEmail } from '../templates/emails/welcome.email.tsx';
import type { Translate } from '../templates/translate.ts';

export interface CatalogEntry {
  subject: string;
  element: ReactElement;
}

/** Maps each template kind to its subject and React Email component. */
export function buildEmail(
  template: EmailTemplate,
  t: Translate,
  appName: string,
  lang: string,
): CatalogEntry {
  switch (template.kind) {
    case 'welcome':
      return {
        subject: t('welcome.subject', { appName }),
        element: (
          <WelcomeEmail
            t={t}
            lang={lang}
            appName={appName}
            name={template.name}
            appUrl={template.appUrl}
          />
        ),
      };
    case 'verify-email':
      return {
        subject: t('verifyEmail.subject'),
        element: (
          <VerifyEmailEmail
            t={t}
            lang={lang}
            appName={appName}
            name={template.name}
            verificationUrl={template.verificationUrl}
            expiresInHours={template.expiresInHours}
          />
        ),
      };
    case 'reset-password':
      return {
        subject: t('resetPassword.subject'),
        element: (
          <ResetPasswordEmail
            t={t}
            lang={lang}
            appName={appName}
            name={template.name}
            resetUrl={template.resetUrl}
            expiresInMinutes={template.expiresInMinutes}
          />
        ),
      };
  }
}
