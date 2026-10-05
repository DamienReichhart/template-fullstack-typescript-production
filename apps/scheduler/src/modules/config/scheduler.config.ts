import { appConfig, defineProbeConfig, redisConfig } from '@template/config';

export const schedulerProbeConfig = defineProbeConfig('SCHEDULER_HEALTH_PORT');

/** The scheduler only talks to Redis: no database, no secrets of any context. */
export const schedulerConfigDefinitions = [appConfig, redisConfig, schedulerProbeConfig] as const;
