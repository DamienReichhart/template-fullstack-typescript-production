import { z } from 'zod';

import { defineConfig } from '../loader/config-definition.ts';

export const appConfig = defineConfig(
  'app',
  z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  }),
);
