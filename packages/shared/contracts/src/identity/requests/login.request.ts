import { z } from 'zod';

import { emailSchema } from '../../common/schemas/email.schema.js';

/** No length policy on login: an old password must still be able to sign in. */
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string('validation.password.required').min(1, 'validation.password.required'),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
