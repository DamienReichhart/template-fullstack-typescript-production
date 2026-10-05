import {
  OneTimeTokenRepository,
  type OneTimeToken,
  type OneTimeTokenPurpose,
  type UserId,
} from '@template/identity-domain';

export class InMemoryOneTimeTokenRepository extends OneTimeTokenRepository {
  readonly tokens = new Map<string, OneTimeToken>();

  async findByHash(tokenHash: string, purpose: OneTimeTokenPurpose): Promise<OneTimeToken | null> {
    return (
      [...this.tokens.values()].find(
        (token) => token.tokenHash === tokenHash && token.purpose === purpose,
      ) ?? null
    );
  }

  async save(token: OneTimeToken): Promise<void> {
    this.tokens.set(token.id.value, token);
  }

  async consumeAllFor(userId: UserId, purpose: OneTimeTokenPurpose, now: Date): Promise<void> {
    for (const token of this.tokens.values()) {
      if (
        token.userId.equals(userId) &&
        token.purpose === purpose &&
        token.consumedAt === null &&
        token.expiresAt > now
      ) {
        token.consume(now);
      }
    }
  }

  async deleteEndedBefore(before: Date): Promise<number> {
    let deleted = 0;
    for (const [id, token] of this.tokens) {
      if ((token.consumedAt ?? token.expiresAt) < before) {
        this.tokens.delete(id);
        deleted++;
      }
    }
    return deleted;
  }

  /** Test helper: the tokens of one user and purpose, oldest first. */
  issuedFor(userId: UserId, purpose: OneTimeTokenPurpose): OneTimeToken[] {
    return [...this.tokens.values()].filter(
      (token) => token.userId.equals(userId) && token.purpose === purpose,
    );
  }
}
