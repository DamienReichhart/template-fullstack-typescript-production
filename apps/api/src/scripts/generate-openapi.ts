/**
 * Writes `apps/api/openapi.json` from the controllers and Zod DTOs, without connecting to
 * Postgres or Redis (Nest preview mode). CI fails when the committed file is stale.
 *
 * Run: bunx nx run api:openapi
 */
import 'reflect-metadata';

import { writeFileSync } from 'node:fs';

import { NestFactory } from '@nestjs/core';
import { configureRouting, createOpenApiDocument } from '@template/http';

import { AppModule } from '../app.module.js';
import { APP_VERSION } from '../modules/system/app-version.js';

const app = await NestFactory.create(AppModule, { preview: true, logger: false });
configureRouting(app);
const document = createOpenApiDocument(app, {
  title: 'Template API',
  version: APP_VERSION,
  description: 'Generated from the Zod contracts of @template/contracts.',
});

const target = new URL('../../openapi.json', import.meta.url);
writeFileSync(target, `${JSON.stringify(document, null, 2)}\n`);
console.log(`OpenAPI document written to ${target.pathname}`);
await app.close();
