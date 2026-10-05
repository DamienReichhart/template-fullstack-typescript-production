/** What to say, to whom, in which language. Rendering decides how it looks. */
export type EmailTemplate =
  | { kind: 'welcome'; locale: string; name: string; appUrl: string }
  | {
      kind: 'verify-email';
      locale: string;
      name: string;
      verificationUrl: string;
      expiresInHours: number;
    }
  | {
      kind: 'reset-password';
      locale: string;
      name: string;
      resetUrl: string;
      expiresInMinutes: number;
    };

export type EmailTemplateKind = EmailTemplate['kind'];
