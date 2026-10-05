import { z } from 'zod';

import { defineConfig } from '../loader/config-definition.ts';
import { port } from './env-helpers.ts';

/** Health-probe port of a non-HTTP runnable, read from an app-specific variable. */
export function defineProbeConfig(portVariable: `${string}_HEALTH_PORT`) {
  return defineConfig(
    'probe',
    z
      .object({ [portVariable]: port() })
      .transform((env) => ({ port: env[portVariable] as number })),
  );
}
