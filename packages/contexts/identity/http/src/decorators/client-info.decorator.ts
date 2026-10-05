import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { ClientInfo } from '@template/identity-application';
import type { Request } from 'express';

/** The device and address a request comes from, recorded on the session it opens. */
export const Client = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ClientInfo => {
    const request = context.switchToHttp().getRequest<Request>();
    return {
      userAgent: request.headers['user-agent']?.slice(0, 512) ?? null,
      ipAddress: request.ip ?? null,
    };
  },
);
