import type { User as UserRecord } from '@template/database';
import { Email, PasswordHash, User, UserId } from '@template/identity-domain';

export const UserMapper = {
  toDomain(record: UserRecord): User {
    return User.reconstitute(UserId.from(record.id), {
      email: Email.create(record.email),
      name: record.name,
      passwordHash: PasswordHash.fromHash(record.passwordHash),
      role: record.role,
      locale: record.locale,
      emailVerifiedAt: record.emailVerifiedAt,
      avatarKey: record.avatarKey,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  },

  toPersistence(user: User): UserRecord {
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      passwordHash: user.passwordHash.value,
      role: user.role,
      locale: user.locale,
      emailVerifiedAt: user.emailVerifiedAt,
      avatarKey: user.avatarKey,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
