import { z } from 'zod';

import { defineConfig } from '../loader/config-definition.ts';

export const redisConfig = defineConfig(
  'redis',
  z.object({
    REDIS_URL: z.url({ protocol: /^rediss?$/, error: 'must be a redis:// or rediss:// URL' }),
  }),
);
