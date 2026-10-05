import type auth from '../../messages/en/auth.json';
import type common from '../../messages/en/common.json';
import type dashboard from '../../messages/en/dashboard.json';
import type emails from '../../messages/en/emails.json';
import type errors from '../../messages/en/errors.json';
import type marketing from '../../messages/en/marketing.json';
import type seo from '../../messages/en/seo.json';
import type system from '../../messages/en/system.json';
import type validation from '../../messages/en/validation.json';

/** English is the reference catalog: other locales must match its shape (parity test). */
export interface Messages {
  common: typeof common;
  auth: typeof auth;
  dashboard: typeof dashboard;
  marketing: typeof marketing;
  system: typeof system;
  validation: typeof validation;
  errors: typeof errors;
  emails: typeof emails;
  seo: typeof seo;
}
