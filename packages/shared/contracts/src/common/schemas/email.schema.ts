import { z } from 'zod';

/** Emails are normalised (trimmed, lower-cased) before format validation. */
export const emailSchema = z
  .string('validation.email.required')
  .trim()
  .toLowerCase()
  .max(254, 'validation.email.tooLong')
  .pipe(z.email('validation.email.invalid'));
