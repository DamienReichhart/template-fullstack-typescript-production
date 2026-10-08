import { z } from 'zod';

import { defineConfig } from '../loader/config-definition.ts';
import { booleanFlag } from './env-helpers.ts';

const optionalUrl = () =>
  z
    .url({ protocol: /^https?$/, error: 'must be an http:// or https:// URL' })
    .optional()
    .or(z.literal('').transform(() => undefined));
const optionalSecret = () =>
  z
    .string()
    .optional()
    .transform((value) => value || undefined);

/**
 * The S3-compatible object storage (RustFS locally). Credentials are both set or both empty:
 * empty means the AWS default chain (instance role, web identity, …).
 */
export const storageConfig = defineConfig(
  'storage',
  z
    .object({
      S3_ENDPOINT: optionalUrl(),
      S3_PUBLIC_ENDPOINT: optionalUrl(),
      S3_REGION: z.string().min(1).default('us-east-1'),
      S3_ACCESS_KEY_ID: optionalSecret(),
      S3_SECRET_ACCESS_KEY: optionalSecret(),
      S3_FORCE_PATH_STYLE: booleanFlag(false),
      S3_BUCKET: z
        .string()
        .regex(/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/, 'must be a valid S3 bucket name'),
    })
    .refine((env) => Boolean(env.S3_ACCESS_KEY_ID) === Boolean(env.S3_SECRET_ACCESS_KEY), {
      path: ['S3_SECRET_ACCESS_KEY'],
      message: 'set S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY together, or neither',
    }),
);
