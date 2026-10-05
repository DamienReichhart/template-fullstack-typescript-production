import { loginRequestSchema } from '@template/contracts/identity';
import { createZodDto } from '@template/http';

export class LoginDto extends createZodDto(loginRequestSchema) {}
