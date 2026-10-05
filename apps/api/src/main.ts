import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { httpConfig, type ConfigType } from '@template/config';
import { configureHttpApp } from '@template/http';
import { Logger } from '@template/logger';

import { AppModule } from './app.module.js';
import { BULL_BOARD_PATH } from './modules/admin/admin.module.js';
import { APP_VERSION } from './modules/system/app-version.js';

async function bootstrap(): Promise<void> {
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
