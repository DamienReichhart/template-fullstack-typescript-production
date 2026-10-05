import { z } from 'zod';

import { emailSchema } from '../../common/schemas/email.schema.ts';
import { preferredLocaleSchema } from '../../common/schemas/locale.schema.ts';
import { passwordSchema } from '../../common/schemas/password.schema.ts';

export const registerRequestSchema = z.object({
  name: z
    .string('validation.name.required')
    .trim()
    .min(1, 'validation.name.required')
    .max(100, 'validation.name.tooLong'),
  email: emailSchema,
  password: passwordSchema,
  /** Language of the emails sent to this user. */
  locale: preferredLocaleSchema,
});

export type RegisterRequest = z.input<typeof registerRequestSchema>;
