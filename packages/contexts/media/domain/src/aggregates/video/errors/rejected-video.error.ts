import { DomainError } from '@template/ddd';

import type { VideoFailureReason } from '../value-objects/video-failure-reason.value-object.ts';

export type RejectedVideoReason = Exclude<VideoFailureReason, 'processing-failed'>;

/** The Source was received but can never become a Video: retrying would fail the same way. */
export class RejectedVideoError extends DomainError {
  constructor(readonly reason: RejectedVideoReason) {
    super(`Rejected video: ${reason}`);
  }
}
