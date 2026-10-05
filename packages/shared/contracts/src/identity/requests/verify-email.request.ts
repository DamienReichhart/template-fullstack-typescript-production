import { z } from 'zod';

export const verifyEmailRequestSchema = z.object({
  token: z.string('validation.token.required').min(1, 'validation.token.required'),
});

export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
