import { Module, type DynamicModule } from '@nestjs/common';
import { appConfig, type ConfigType } from '@template/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { createPinoOptions } from './options/pino-options.factory.ts';

export interface LoggerModuleOptions {
  /** Added to every log line as `service`, e.g. `api`, `worker`. */
  service: string;
}

/**
 * Structured JSON logs in production, pretty single lines in development.
 * Apps call `app.useLogger(app.get(Logger))` so Nest's own logs go through pino too.
 */
@Module({})
export class LoggerModule {
  static forRoot({ service }: LoggerModuleOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        PinoLoggerModule.forRootAsync({
          inject: [appConfig.token],
          useFactory: (app: ConfigType<typeof appConfig>) =>
            createPinoOptions({
              service,
              level: app.LOG_LEVEL,
              pretty: app.NODE_ENV === 'development',
            }),
        }),
      ],
      exports: [PinoLoggerModule],
    };
  }
}
