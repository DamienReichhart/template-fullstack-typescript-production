import { resendVerificationRequestSchema } from '@template/contracts/identity';
import { createZodDto } from '@template/http';

export class ResendVerificationDto extends createZodDto(resendVerificationRequestSchema) {}
