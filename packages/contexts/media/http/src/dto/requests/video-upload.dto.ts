import { videoUploadRequestSchema } from '@template/contracts/media';
import { createZodDto } from '@template/http';

export class VideoUploadDto extends createZodDto(videoUploadRequestSchema) {}
