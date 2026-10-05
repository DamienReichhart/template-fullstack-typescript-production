import { AggregateRoot } from '@template/ddd';

import type { UserId } from '../user/value-objects/user-id.value-object.ts';
import { InvalidOrExpiredTokenError } from './errors/invalid-or-expired-token.error.ts';
import { OneTimeTokenId } from './value-objects/one-time-token-id.value-object.ts';
import type { OneTimeTokenPurpose } from './value-objects/one-time-token-purpose.value-object.ts';

export interface OneTimeTokenProps {
  userId: UserId;
  purpose: OneTimeTokenPurpose;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
}

export interface IssueOneTimeTokenInput {
  userId: UserId;
  purpose: OneTimeTokenPurpose;
  tokenHash: string;
  expiresAt: Date;
  now: Date;
}

/** A single-use secret sent by email. Only its hash is kept; it works once, before expiry. */
export class OneTimeToken extends AggregateRoot<OneTimeTokenId, OneTimeTokenProps> {
  static issue({
    userId,
    purpose,
    tokenHash,
    expiresAt,
    now,
  }: IssueOneTimeTokenInput): OneTimeToken {
    return new OneTimeToken(OneTimeTokenId.create(), {
      userId,
      purpose,
      tokenHash,
      expiresAt,
      consumedAt: null,
      createdAt: now,
    });
  }

  static reconstitute(id: OneTimeTokenId, props: OneTimeTokenProps): OneTimeToken {
    return new OneTimeToken(id, props);
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get purpose(): OneTimeTokenPurpose {
    return this.props.purpose;
  }

  get tokenHash(): string {
    return this.props.tokenHash;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get consumedAt(): Date | null {
    return this.props.consumedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  consume(now: Date): void {
    if (this.props.consumedAt !== null || this.props.expiresAt <= now) {
      throw new InvalidOrExpiredTokenError();
    }
    this.props.consumedAt = now;
  }
}
