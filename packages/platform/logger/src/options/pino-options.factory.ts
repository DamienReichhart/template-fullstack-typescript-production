import type { Params } from 'nestjs-pino';

import { resolveRequestId } from '../request-context/request-id.ts';
import { REDACTED_PATHS } from './redaction.ts';

export interface PinoOptionsInput {
  service: string;
  level: string;
  pretty: boolean;
}

export function createPinoOptions({ service, level, pretty }: PinoOptionsInput): Params {
  return {
    pinoHttp: {
      level,
      base: { service },
      redact: { paths: REDACTED_PATHS, censor: '[REDACTED]' },
      genReqId: resolveRequestId,
      customAttributeKeys: { reqId: 'requestId' },
      autoLogging: {
        ignore: (request) => request.url?.startsWith('/health') ?? false,
      },
      serializers: {
        req: (request: { id: string; method: string; url: string }) => ({
          id: request.id,
          method: request.method,
          url: request.url,
        }),
        res: (response: { statusCode: number }) => ({ statusCode: response.statusCode }),
      },
      transport: pretty
        ? {
            target: 'pino-pretty',
            options: { singleLine: true, translateTime: 'SYS:HH:MM:ss.l', ignore: 'pid,hostname' },
          }
        : undefined,
    },
  };
}
