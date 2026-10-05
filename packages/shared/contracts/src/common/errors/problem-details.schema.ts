import { z } from 'zod';

export const fieldErrorSchema = z.object({
  /** Dot-separated path of the invalid field, e.g. `password`. */
  path: z.string(),
  /** Translation key, e.g. `validation.password.tooShort`. */
  message: z.string(),
  /** Interpolation values for the translation, e.g. `{ minimum: 12 }`. */
  params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

/**
 * RFC 9457 problem details, extended with a stable machine-readable `code`.
 * Clients translate `code`; `title` and `detail` are for humans reading logs.
 */
export const problemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.string(),
  requestId: z.string().optional(),
  errors: z.array(fieldErrorSchema).optional(),
});

export type FieldError = z.infer<typeof fieldErrorSchema>;
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;
