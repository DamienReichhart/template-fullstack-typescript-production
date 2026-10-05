import { verifyEmailRequestSchema } from '@template/contracts/identity';
import { createZodDto } from '@template/http';

export class VerifyEmailDto extends createZodDto(verifyEmailRequestSchema) {}
