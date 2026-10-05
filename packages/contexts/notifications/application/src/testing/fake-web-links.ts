import { WebLinks } from '../ports/web-links.port.ts';

export class FakeWebLinks extends WebLinks {
  home(locale: string): string {
    return `https://app.test/${locale}`;
  }

  verifyEmail(locale: string, token: string): string {
    return `https://app.test/${locale}/verify-email?token=${token}`;
  }

  resetPassword(locale: string, token: string): string {
    return `https://app.test/${locale}/reset-password?token=${token}`;
  }
}
