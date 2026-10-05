/** URLs of web app pages that emails link to. */
export abstract class WebLinks {
  abstract home(locale: string): string;
  abstract verifyEmail(locale: string, token: string): string;
  abstract resetPassword(locale: string, token: string): string;
}
