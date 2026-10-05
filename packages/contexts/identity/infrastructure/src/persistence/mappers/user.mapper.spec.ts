import { describe, expect, it } from 'bun:test';
import type { User as UserRecord } from '@template/database';

import { UserMapper } from './user.mapper.js';

const record: UserRecord = {
  id: '0199b0a0-0000-7000-8000-000000000001',
  email: 'ada@example.com',
  name: 'Ada',
  passwordHash: 'hash',
  role: 'ADMIN',
  locale: 'fr',
  emailVerifiedAt: new Date('2026-01-02T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

describe('UserMapper', () => {
  it('round-trips a record through the domain without loss', () => {
    expect(UserMapper.toPersistence(UserMapper.toDomain(record))).toEqual(record);
  });

  it('rebuilds the aggregate without recording events', () => {
    expect(UserMapper.toDomain(record).pullDomainEvents()).toHaveLength(0);
  });
});
