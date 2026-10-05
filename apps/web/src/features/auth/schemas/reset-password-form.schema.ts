import { resetPasswordRequestSchema } from '@template/contracts/identity';
import { z } from 'zod';

/** The reset contract without the token (read from the link) plus a confirmation field. */
export const resetPasswordFormSchema = resetPasswordRequestSchema
  .omit({ token: true })
  .extend({ confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.password.mismatch',
  });

export type ResetPasswordFormValues = z.input<typeof resetPasswordFormSchema>;
