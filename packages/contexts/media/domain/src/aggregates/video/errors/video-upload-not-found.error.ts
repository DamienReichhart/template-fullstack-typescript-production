import { DomainError } from '@template/ddd';

/** No Video upload of this User under that id: never sent, already used, or expired. */
export class VideoUploadNotFoundError extends DomainError {
  constructor(uploadId: string) {
    super(`No video upload ${uploadId}`);
  }
}
