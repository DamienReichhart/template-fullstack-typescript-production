import { defineConfig, positiveInt } from '@template/config';
import { z } from 'zod';

export const identityConfig = defineConfig(
  'identity',
  z.object({
    JWT_ACCESS_SECRET: z
      .string()
      .min(32, 'must be at least 32 characters (openssl rand -base64 48)'),
    JWT_ISSUER: z.string().min(1).default('template-api'),
    JWT_ACCESS_TTL_SECONDS: positiveInt().default(900),
    REFRESH_TOKEN_TTL_DAYS: positiveInt().default(30),
    EMAIL_VERIFICATION_TTL_HOURS: positiveInt().default(24),
    PASSWORD_RESET_TTL_MINUTES: positiveInt().default(60),
  }),
);
