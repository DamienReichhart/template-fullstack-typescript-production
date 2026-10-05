import { z } from 'zod';

import { emailSchema } from '../../common/schemas/email.schema.js';

export const resendVerificationRequestSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationRequest = z.infer<typeof resendVerificationRequestSchema>;
