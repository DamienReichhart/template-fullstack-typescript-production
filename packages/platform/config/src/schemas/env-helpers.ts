import { z } from 'zod';

export const port = () => z.coerce.number().int().min(1).max(65_535);
export const positiveInt = () => z.coerce.number().int().positive();
export const booleanFlag = (fallback: boolean) =>
  z
    .stringbool()
    .optional()
    .transform((value) => value ?? fallback);
export const commaSeparatedList = () =>
  z.string().transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  );
