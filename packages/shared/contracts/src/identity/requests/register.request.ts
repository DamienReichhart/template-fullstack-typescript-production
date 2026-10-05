import { z } from 'zod';

import { emailSchema } from '../../common/schemas/email.schema.js';
import { passwordSchema } from '../../common/schemas/password.schema.js';

export const registerRequestSchema = z.object({
  name: z
    .string('validation.name.required')
    .trim()
    .min(1, 'validation.name.required')
    .max(100, 'validation.name.tooLong'),
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
