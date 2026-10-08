import { DomainError } from '@template/ddd';

/** No Avatar upload of this User under that id: never sent, already used, or expired. */
export class AvatarUploadNotFoundError extends DomainError {
  constructor(uploadId: string) {
    super(`No avatar upload ${uploadId}`);
  }
}
