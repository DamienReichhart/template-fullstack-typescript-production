import {
  appConfig,
  databaseConfig,
  defineConfig,
  defineProbeConfig,
  positiveInt,
  redisConfig,
} from '@template/config';
import { identityConfig } from '@template/identity-infrastructure';
import { notificationsConfig } from '@template/notifications-infrastructure';
import { z } from 'zod';

export const workerConfig = defineConfig(
  'worker',
  z.object({
    /** Jobs processed in parallel by each queue's worker in this process. */
    WORKER_CONCURRENCY: positiveInt().default(5),
  }),
);

export const workerProbeConfig = defineProbeConfig('WORKER_HEALTH_PORT');

/** Every config slice the worker reads. All are validated together at boot. */
export const workerConfigDefinitions = [
  appConfig,
  databaseConfig,
  redisConfig,
  identityConfig,
  notificationsConfig,
  workerConfig,
  workerProbeConfig,
] as const;
