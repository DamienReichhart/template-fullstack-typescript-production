import { avatarUploadRequestSchema } from '@template/contracts/identity';
import { createZodDto } from '@template/http';

export class AvatarUploadDto extends createZodDto(avatarUploadRequestSchema) {}
