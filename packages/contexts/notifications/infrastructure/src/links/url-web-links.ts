import { WebLinks } from '@template/notifications-application';

/** Builds absolute links to the localised pages of the web app (`/<locale>/...`). */
export class UrlWebLinks extends WebLinks {
  private readonly base: string;

  constructor(webAppUrl: string) {
    super();
    this.base = webAppUrl.replace(/\/+$/, '');
  }

  home(locale: string): string {
    return `${this.base}/${locale}`;
  }

  verifyEmail(locale: string, token: string): string {
    return `${this.base}/${locale}/verify-email?token=${encodeURIComponent(token)}`;
  }

  resetPassword(locale: string, token: string): string {
    return `${this.base}/${locale}/reset-password?token=${encodeURIComponent(token)}`;
  }
}
