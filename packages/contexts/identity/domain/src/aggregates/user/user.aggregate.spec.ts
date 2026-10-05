import { describe, expect, it } from 'bun:test';

import { EmailVerifiedEvent } from './events/email-verified.event.js';
import { PasswordChangedEvent } from './events/password-changed.event.js';
import { UserRegisteredEvent } from './events/user-registered.event.js';
import { User } from './user.aggregate.js';
import { Email } from './value-objects/email.value-object.js';
import { PasswordHash } from './value-objects/password-hash.value-object.js';

const now = new Date('2026-01-01T00:00:00.000Z');
const later = new Date('2026-01-02T00:00:00.000Z');

const register = () =>
  User.register({
    email: Email.create('ada@example.com'),
    name: '  Ada Lovelace ',
    passwordHash: PasswordHash.fromHash('hash'),
    locale: 'fr',
    now,
  });

describe('User', () => {
  it('registers as an unverified USER and records UserRegistered', () => {
    const user = register();
    expect(user.role).toBe('USER');
    expect(user.name).toBe('Ada Lovelace');
    expect(user.isEmailVerified).toBe(false);

    const [event] = user.pullDomainEvents();
    expect(event).toBeInstanceOf(UserRegisteredEvent);
    expect(event).toMatchObject({ email: 'ada@example.com', locale: 'fr', userId: user.id.value });
  });

  it('verifies its email once, then ignores further verifications', () => {
    const user = register();
    user.pullDomainEvents();

    user.verifyEmail(later);
    user.verifyEmail(new Date('2026-02-01T00:00:00.000Z'));

    expect(user.emailVerifiedAt).toEqual(later);
    const events = user.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(EmailVerifiedEvent);
  });

  it('changes its password and records PasswordChanged', () => {
    const user = register();
    user.pullDomainEvents();

    user.changePassword(PasswordHash.fromHash('new-hash'), later);

    expect(user.passwordHash.value).toBe('new-hash');
    expect(user.updatedAt).toEqual(later);
    expect(user.pullDomainEvents()[0]).toBeInstanceOf(PasswordChangedEvent);
  });
});
