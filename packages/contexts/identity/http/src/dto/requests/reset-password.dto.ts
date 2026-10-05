import { resetPasswordRequestSchema } from '@template/contracts/identity';
import { createZodDto } from '@template/http';

export class ResetPasswordDto extends createZodDto(resetPasswordRequestSchema) {}
