import { z } from 'zod';

import { emailSchema } from '../../common/schemas/email.schema.js';

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
