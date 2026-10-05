import { registerRequestSchema } from '@template/contracts/identity';
import { z } from 'zod';

/** The registration contract plus a confirmation field that never leaves the browser. */
export const registerFormSchema = registerRequestSchema
  .omit({ locale: true })
  .extend({ confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'validation.password.mismatch',
  });

export type RegisterFormValues = z.input<typeof registerFormSchema>;
