import { z } from 'zod';

import { defineConfig } from '../loader/config-definition.js';

export const databaseConfig = defineConfig(
  'database',
  z.object({
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/, error: 'must be a postgresql:// URL' }),
  }),
);
