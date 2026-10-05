import { z } from 'zod';

import { emailSchema } from '../../common/schemas/email.schema.ts';

export const resendVerificationRequestSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationRequest = z.infer<typeof resendVerificationRequestSchema>;
