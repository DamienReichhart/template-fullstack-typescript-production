import { z } from 'zod';

import { passwordSchema } from '../../common/schemas/password.schema.js';

export const resetPasswordRequestSchema = z.object({
  token: z.string('validation.token.required').min(1, 'validation.token.required'),
  password: passwordSchema,
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
