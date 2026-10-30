import { DomainError } from '@template/ddd';

/** No Video under that id belongs to the caller. Another User's Video is not found either. */
export class VideoNotFoundError extends DomainError {
  constructor(videoId: string) {
    super(`Video ${videoId} does not exist`);
  }
}
