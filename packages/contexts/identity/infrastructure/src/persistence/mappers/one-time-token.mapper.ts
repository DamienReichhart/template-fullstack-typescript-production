import type { OneTimeToken as OneTimeTokenRecord } from '@template/database';
import { OneTimeToken, OneTimeTokenId, UserId } from '@template/identity-domain';

export const OneTimeTokenMapper = {
  toDomain(record: OneTimeTokenRecord): OneTimeToken {
    return OneTimeToken.reconstitute(OneTimeTokenId.from(record.id), {
      userId: UserId.from(record.userId),
      purpose: record.purpose,
      tokenHash: record.tokenHash,
      expiresAt: record.expiresAt,
      consumedAt: record.consumedAt,
      createdAt: record.createdAt,
    });
  },

  toPersistence(token: OneTimeToken): OneTimeTokenRecord {
    return {
      id: token.id.value,
      userId: token.userId.value,
      purpose: token.purpose,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      consumedAt: token.consumedAt,
      createdAt: token.createdAt,
    };
  },
};
