import { z } from 'zod';

import { emailSchema } from '../../common/schemas/email.schema.ts';

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
