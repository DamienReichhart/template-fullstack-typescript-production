import { uploadVideoRequestSchema } from '@template/contracts/media';
import { createZodDto } from '@template/http';

export class UploadVideoDto extends createZodDto(uploadVideoRequestSchema) {}
