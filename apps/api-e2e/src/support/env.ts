/** Where the suite finds the running stack. Values come from the root `.env`. */
export const e2eEnv = {
  apiUrl: process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.API_PORT ?? 4000}`,
  workerHealthUrl: `http://localhost:${process.env.WORKER_HEALTH_PORT ?? 4100}`,
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  databaseUrl: process.env.DATABASE_URL ?? '',
  storage: {
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    bucket: process.env.S3_BUCKET ?? 'template',
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    region: process.env.S3_REGION ?? 'us-east-1',
  },
};
