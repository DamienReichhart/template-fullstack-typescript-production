import { Injectable } from '@nestjs/common';
import { PrismaTransactionHost } from '@template/database';
import {
  SessionRepository,
  type RefreshTokenHash,
  type Session,
  type UserId,
} from '@template/identity-domain';

import { SessionMapper } from '../mappers/session.mapper.js';

@Injectable()
export class PrismaSessionRepository extends SessionRepository {
  constructor(private readonly host: PrismaTransactionHost) {
    super();
  }

  async findByRefreshTokenHash(hash: RefreshTokenHash): Promise<Session | null> {
    const record = await this.host.tx.session.findFirst({
      where: { OR: [{ refreshTokenHash: hash.value }, { previousRefreshTokenHash: hash.value }] },
    });
    return record ? SessionMapper.toDomain(record) : null;
  }

  async save(session: Session): Promise<void> {
    const data = SessionMapper.toPersistence(session);
    await this.host.tx.session.upsert({ where: { id: data.id }, create: data, update: data });
  }

  async revokeAllForUser(userId: UserId, now: Date): Promise<void> {
    await this.host.tx.session.updateMany({
      where: { userId: userId.value, revokedAt: null },
      data: { revokedAt: now },
    });
  }

  async deleteEndedBefore(before: Date): Promise<number> {
    const { count } = await this.host.tx.session.deleteMany({
      where: { OR: [{ revokedAt: { lt: before } }, { expiresAt: { lt: before } }] },
    });
    return count;
  }
}
