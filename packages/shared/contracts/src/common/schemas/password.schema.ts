import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Length-based policy (NIST SP 800-63B): long passphrases beat composition rules.
 * The upper bound protects the password hasher from oversized inputs.
 */
export const passwordSchema = z
  .string('validation.password.required')
  .min(PASSWORD_MIN_LENGTH, 'validation.password.tooShort')
  .max(PASSWORD_MAX_LENGTH, 'validation.password.tooLong');
