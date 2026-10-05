/** Where the suite finds the running stack. Values come from the root `.env`. */
export const e2eEnv = {
  apiUrl: process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}`,
  workerHealthUrl: `http://localhost:${process.env.WORKER_HEALTH_PORT ?? 4100}`,
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  databaseUrl: process.env.DATABASE_URL ?? '',
};
