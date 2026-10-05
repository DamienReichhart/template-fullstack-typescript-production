import { registerRequestSchema } from '@template/contracts/identity';
import { createZodDto } from '@template/http';

export class RegisterDto extends createZodDto(registerRequestSchema) {}
