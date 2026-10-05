import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { Logger } from '@template/logger';

async function bootstrap(): Promise<void> {
  // Imported here so an invalid environment is reported by the catch below, not as a stack trace.
  const { WorkerModule } = await import('./worker.module.js');
  const app = await NestFactory.createApplicationContext(WorkerModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();
  app.get(Logger).log('Worker started: consuming queues', 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
