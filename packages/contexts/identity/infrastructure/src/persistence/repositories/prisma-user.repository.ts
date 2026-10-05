import { Injectable } from '@nestjs/common';
import { Prisma, PrismaTransactionHost } from '@template/database';
import {
  EmailAlreadyTakenError,
  UserRepository,
  type Email,
  type User,
  type UserId,
} from '@template/identity-domain';

import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  constructor(private readonly host: PrismaTransactionHost) {
    super();
  }

  async findById(id: UserId): Promise<User | null> {
    const record = await this.host.tx.user.findUnique({ where: { id: id.value } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const record = await this.host.tx.user.findUnique({ where: { email: email.value } });
    return record ? UserMapper.toDomain(record) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    return (await this.host.tx.user.count({ where: { email: email.value } })) > 0;
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    try {
      await this.host.tx.user.upsert({ where: { id: data.id }, create: data, update: data });
    } catch (error) {
      // Two registrations racing past the existence check: the unique index decides.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EmailAlreadyTakenError();
      }
      throw error;
    }
  }
}
