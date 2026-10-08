import { changeAvatarRequestSchema } from '@template/contracts/identity';
import { createZodDto } from '@template/http';

export class ChangeAvatarDto extends createZodDto(changeAvatarRequestSchema) {}
