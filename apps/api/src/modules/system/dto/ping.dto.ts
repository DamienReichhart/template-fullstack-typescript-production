import { authenticatedPingResponseSchema, pingResponseSchema } from '@template/contracts/system';
import { createZodDto } from '@template/http';

export class PingDto extends createZodDto(pingResponseSchema) {}

export class AuthenticatedPingDto extends createZodDto(authenticatedPingResponseSchema) {}
