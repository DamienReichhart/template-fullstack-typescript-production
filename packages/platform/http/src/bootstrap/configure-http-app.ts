import { RequestMethod, VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { httpConfig, type ConfigType } from '@template/config';
import { API_PREFIX, API_VERSION } from '@template/contracts/common';
import cookieParser from 'cookie-parser';

import type { OpenApiMetadata } from '../openapi/create-openapi-document.js';
import { DOCS_PATH, setupSwagger } from '../openapi/setup-swagger.js';
import { createCorsOptions } from '../security/cors.options.js';
import { createHelmetMiddleware } from '../security/helmet.options.js';

/**
 * Everything an HTTP runnable needs before `listen()`: proxy trust, security headers,
 * cookies, CORS, `/api/v1` routing (health probes excluded), shutdown hooks and docs.
 */
export function configureHttpApp(app: NestExpressApplication, metadata: OpenApiMetadata): void {
  const config = app.get<ConfigType<typeof httpConfig>>(httpConfig.token);

  app.set('trust proxy', config.TRUST_PROXY ? 1 : false);
  app.disable('x-powered-by');
  app.use(createHelmetMiddleware(DOCS_PATH));
  app.use(cookieParser());
  app.enableCors(createCorsOptions(config.CORS_ORIGINS));
  app.setGlobalPrefix(API_PREFIX, {
    exclude: [{ path: 'health/{*path}', method: RequestMethod.ALL }],
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_VERSION });
  app.enableShutdownHooks();

  if (config.SWAGGER_ENABLED) setupSwagger(app, metadata);
}
