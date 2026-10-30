import { DomainError } from '@template/ddd';

export type InvalidVideoReason = 'empty' | 'too-large' | 'content-type' | 'content-mismatch';

/** The file is not one a User may upload as a Video: wrong format, too big, or not what it claims. */
export class InvalidVideoError extends DomainError {
  constructor(readonly reason: InvalidVideoReason) {
    super(`Invalid video: ${reason}`);
  }
}
