import { z } from 'zod';

import { defineConfig } from '../loader/config-definition.ts';
import { booleanFlag, commaSeparatedList, port, positiveInt } from './env-helpers.ts';

export const httpConfig = defineConfig(
  'http',
  z.object({
    API_PORT: port().default(4000),
    API_PUBLIC_URL: z.url(),
    CORS_ORIGINS: commaSeparatedList(),
    SWAGGER_ENABLED: booleanFlag(false),
    THROTTLE_TTL_SECONDS: positiveInt().default(60),
    THROTTLE_LIMIT: positiveInt().default(100),
    TRUST_PROXY: booleanFlag(false),
  }),
);
