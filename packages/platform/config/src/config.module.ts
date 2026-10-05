import { Module, type DynamicModule } from '@nestjs/common';

import type { ConfigDefinition } from './loader/config-definition.js';
import { loadConfig, type EnvSource } from './loader/load-env.js';

export interface ConfigModuleOptions {
  /** Every config slice the app needs. Validated together when the module is created. */
  definitions: readonly ConfigDefinition[];
  /** Defaults to `process.env`. */
  env?: EnvSource;
}

@Module({})
export class ConfigModule {
  static forRoot({ definitions, env }: ConfigModuleOptions): DynamicModule {
    const values = loadConfig(definitions, env) as Record<string, unknown>;
    const providers = definitions.map((definition) => ({
      provide: definition.token,
      useValue: values[definition.key],
    }));
    return {
      module: ConfigModule,
      global: true,
      providers,
      exports: providers.map((provider) => provider.provide),
    };
  }
}
