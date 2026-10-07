import { describe, expect, it } from 'bun:test';

import { InvalidAvatarError } from './errors/invalid-avatar.error.ts';
import { AvatarChangedEvent } from './events/avatar-changed.event.ts';
import { EmailVerifiedEvent } from './events/email-verified.event.ts';
import { PasswordChangedEvent } from './events/password-changed.event.ts';
import { UserRegisteredEvent } from './events/user-registered.event.ts';
import { User } from './user.aggregate.ts';
import { AVATAR_MAX_BYTES, AvatarImage } from './value-objects/avatar-image.value-object.ts';
import { Email } from './value-objects/email.value-object.ts';
import { PasswordHash } from './value-objects/password-hash.value-object.ts';

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

  it('sets, replaces and removes its avatar, recording each previous key once', () => {
    const user = register();
    user.pullDomainEvents();
    expect(user.avatarKey).toBeNull();

    user.changeAvatar('identity/avatars/u/1.png', now);
    user.changeAvatar('identity/avatars/u/1.png', now);
    user.changeAvatar('identity/avatars/u/2.png', later);
    user.changeAvatar(null, later);
    user.changeAvatar(null, later);

    expect(user.avatarKey).toBeNull();
    expect(user.updatedAt).toEqual(later);
    expect(user.pullDomainEvents()).toEqual([
      new AvatarChangedEvent(user.id.value, 'identity/avatars/u/1.png', null, now),
      new AvatarChangedEvent(
        user.id.value,
        'identity/avatars/u/2.png',
        'identity/avatars/u/1.png',
        later,
      ),
      new AvatarChangedEvent(user.id.value, null, 'identity/avatars/u/2.png', later),
    ]);
  });
});

describe('AvatarImage', () => {
  it('accepts PNG, JPEG and WebP pictures up to 5 MiB', () => {
    expect(AvatarImage.create('image/webp', AVATAR_MAX_BYTES).size).toBe(AVATAR_MAX_BYTES);
  });

  it.each([
    ['content-type', 'image/svg+xml', 100],
    ['content-type', 'image/gif', 100],
    ['empty', 'image/png', 0],
    ['too-large', 'image/png', AVATAR_MAX_BYTES + 1],
  ] as const)('refuses a %s violation (%s, %d bytes)', (reason, contentType, size) => {
    expect(() => AvatarImage.create(contentType, size)).toThrow(new InvalidAvatarError(reason));
  });
});
