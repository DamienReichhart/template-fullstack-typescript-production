import { forgotPasswordRequestSchema } from '@template/contracts/identity';
import { createZodDto } from '@template/http';

export class ForgotPasswordDto extends createZodDto(forgotPasswordRequestSchema) {}
