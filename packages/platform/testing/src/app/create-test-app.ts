import 'reflect-metadata';

import {
  VersioningType,
  type INestApplication,
  type ModuleMetadata,
  type Provider,
} from '@nestjs/common';
import { APP_FILTER, DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ProblemDetailsFilter } from '@template/http';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';

export interface TestAppOptions extends Pick<
  ModuleMetadata,
  'imports' | 'controllers' | 'providers'
> {
  /** Replace providers by token, e.g. `[{ provide: CommandBus, useValue: fakeBus }]`. */
  overrides?: { provide: unknown; useValue: unknown }[];
}

/**
 * An in-process HTTP app wired like production (problem details, Zod validation,
 * cookies, URI versioning) without Redis or Postgres. For controller-level tests.
 */
export async function createTestApp(options: TestAppOptions): Promise<INestApplication> {
  const providers: Provider[] = [
    ...(options.providers ?? []),
    { provide: APP_FILTER, useClass: ProblemDetailsFilter },
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
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  await app.init();
  return app;
}
