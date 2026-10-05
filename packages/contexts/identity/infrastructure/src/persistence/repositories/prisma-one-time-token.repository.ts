import { Injectable } from '@nestjs/common';
import { PrismaTransactionHost } from '@template/database';
import {
  OneTimeTokenRepository,
  type OneTimeToken,
  type OneTimeTokenPurpose,
  type UserId,
} from '@template/identity-domain';

import { OneTimeTokenMapper } from '../mappers/one-time-token.mapper.ts';

@Injectable()
export class PrismaOneTimeTokenRepository extends OneTimeTokenRepository {
  constructor(private readonly host: PrismaTransactionHost) {
    super();
  }

  async findByHash(tokenHash: string, purpose: OneTimeTokenPurpose): Promise<OneTimeToken | null> {
    const record = await this.host.tx.oneTimeToken.findFirst({ where: { tokenHash, purpose } });
    return record ? OneTimeTokenMapper.toDomain(record) : null;
  }

  async save(token: OneTimeToken): Promise<void> {
    const data = OneTimeTokenMapper.toPersistence(token);
    await this.host.tx.oneTimeToken.upsert({ where: { id: data.id }, create: data, update: data });
  }

  async consumeAllFor(userId: UserId, purpose: OneTimeTokenPurpose, now: Date): Promise<void> {
    await this.host.tx.oneTimeToken.updateMany({
      where: { userId: userId.value, purpose, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now },
    });
  }

  async deleteEndedBefore(before: Date): Promise<number> {
    const { count } = await this.host.tx.oneTimeToken.deleteMany({
      where: { OR: [{ consumedAt: { lt: before } }, { expiresAt: { lt: before } }] },
    });
    return count;
  }
}
