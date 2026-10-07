/** No staged upload under that id and scope: never uploaded, already claimed, or expired. */
export class UploadNotFoundError extends Error {
  constructor(readonly uploadId: string) {
    super(`No staged upload ${uploadId}`);
    this.name = 'UploadNotFoundError';
  }
}

export type UploadRejection = 'empty' | 'too-large' | 'content-type' | 'content-mismatch';

/** The staged file breaks the rules it is claimed under. It has been deleted. */
export class UploadRejectedError extends Error {
  constructor(
    readonly uploadId: string,
    readonly reason: UploadRejection,
  ) {
    super(`Upload ${uploadId} rejected: ${reason}`);
    this.name = 'UploadRejectedError';
  }
}
