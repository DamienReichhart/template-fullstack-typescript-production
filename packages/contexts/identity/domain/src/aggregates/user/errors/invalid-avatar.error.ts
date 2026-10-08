import { DomainError } from '@template/ddd';

export type InvalidAvatarReason = 'empty' | 'too-large' | 'content-type' | 'content-mismatch';

/** The picture is not one a User may show: wrong format, too big, or not what it claims. */
export class InvalidAvatarError extends DomainError {
  constructor(readonly reason: InvalidAvatarReason) {
    super(`Invalid avatar: ${reason}`);
  }
}
