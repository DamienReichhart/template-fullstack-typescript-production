import 'reflect-metadata';

import {
  VersioningType,
  type INestApplication,
  type ModuleMetadata,
  type Provider,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ProblemDetailsFilter } from '@template/http';
import cookieParser from 'cookie-parser';
import { API_PREFIX, API_VERSION } from '@template/contracts/common';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

export interface TestAppOptions extends Pick<
  ModuleMetadata,
  'imports' | 'controllers' | 'providers'
> {
  /** Replace providers by token, e.g. `[{ provide: CommandBus, useValue: fakeBus }]`. */
  overrides?: { provide: unknown; useValue: unknown }[];
}

/**
 * An in-process HTTP app wired like production (`/api/v1` routes, problem details, Zod
 * validation and serialisation, cookies) without Redis or Postgres. For controller tests.
 */
export async function createTestApp(options: TestAppOptions): Promise<INestApplication> {
  const providers: Provider[] = [
    ...(options.providers ?? []),
    { provide: APP_FILTER, useClass: ProblemDetailsFilter },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  ];
  let builder = Test.createTestingModule({
    imports: [DiscoveryModule, ...(options.imports ?? [])],
    controllers: options.controllers ?? [],
    providers,
  });
  for (const override of options.overrides ?? []) {
    builder = builder.overrideProvider(override.provide).useValue(override.useValue);
  }

  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({ logger: false });
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: API_VERSION });
  await app.init();
  return app;
}
