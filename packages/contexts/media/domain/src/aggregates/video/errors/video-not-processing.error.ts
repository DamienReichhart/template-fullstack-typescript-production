import { DomainError } from '@template/ddd';

import type { VideoStatus } from '../value-objects/video-status.value-object.ts';

/** A Video becomes Ready or Failed once: it is no longer Processing. */
export class VideoNotProcessingError extends DomainError {
  constructor(videoId: string, status: VideoStatus) {
    super(`Video ${videoId} is ${status}, not PROCESSING`);
  }
}
