import { RequestMethod, VersioningType, type INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { httpConfig, type ConfigType } from '@template/config';
import { API_PREFIX, API_VERSION } from '@template/contracts/common';
import cookieParser from 'cookie-parser';

import type { OpenApiMetadata } from '../openapi/create-openapi-document.ts';
import { DOCS_PATH, setupSwagger } from '../openapi/setup-swagger.ts';
import { createCorsOptions } from '../security/cors.options.ts';
import { createHelmetMiddleware } from '../security/helmet.options.ts';

export interface HttpAppOptions extends OpenApiMetadata {
  /** Paths serving HTML tools (e.g. `/admin/queues`), given a CSP that allows their scripts. */
  uiPaths?: readonly string[];
}

/** `/api/v1/...` routing; health probes stay at the root (`/health/live`). */
export function configureRouting(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX, {
    exclude: [{ path: 'health/{*path}', method: RequestMethod.ALL }],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_VERSION });
}

/**
 * Everything an HTTP runnable needs before `listen()`: proxy trust, security headers,
 * cookies, CORS, routing, shutdown hooks and docs.
 */
export function configureHttpApp(
  app: NestExpressApplication,
  { uiPaths = [], ...metadata }: HttpAppOptions,
): void {
  const config = app.get<ConfigType<typeof httpConfig>>(httpConfig.token);

  app.set('trust proxy', config.TRUST_PROXY ? 1 : false);
  app.disable('x-powered-by');
  app.use(createHelmetMiddleware([`/${DOCS_PATH}`, ...uiPaths]));
  app.use(cookieParser());
  app.enableCors(createCorsOptions(config.CORS_ORIGINS));
  configureRouting(app);
  app.enableShutdownHooks();

  if (config.SWAGGER_ENABLED) setupSwagger(app, metadata);
}
