import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { httpConfig, type ConfigType } from '@template/config';
import { configureHttpApp } from '@template/http';
import { Logger } from '@template/logger';

import { BULL_BOARD_PATH } from './modules/admin/admin.module.ts';
import { APP_VERSION } from './modules/system/app-version.ts';

async function bootstrap(): Promise<void> {
  // Imported here so an invalid environment is reported by the catch below, not as a stack trace.
  const { AppModule } = await import('./app.module.ts');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  configureHttpApp(app, {
    title: 'Template API',
    version: APP_VERSION,
    uiPaths: [BULL_BOARD_PATH],
  });

  const { API_PORT } = app.get<ConfigType<typeof httpConfig>>(httpConfig.token);
  await app.listen(API_PORT);
  app.get(Logger).log(`API listening on :${API_PORT}`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
