import { FixedClock, ImmediateUnitOfWork } from '@template/ddd';
import { Email, PasswordHash, User } from '@template/identity-domain';

import type { IdentitySettings } from '../ports/configuration/identity-settings.port.ts';
import { SessionIssuer } from '../services/session-issuer.service.ts';
import { VerificationEmailSender } from '../services/verification-email.sender.ts';
import { FakeAccessTokenIssuer } from './fakes/fake-access-token-issuer.ts';
import { FakeIdentityNotifier } from './fakes/fake-identity-notifier.ts';
import { FakePasswordHasher } from './fakes/fake-password-hasher.ts';
import { FakeSecureTokenGenerator } from './fakes/fake-secure-token-generator.ts';
import { RecordingEventBus } from './fakes/recording-event-bus.ts';
import { InMemoryOneTimeTokenRepository } from './repositories/in-memory-one-time-token.repository.ts';
import { InMemorySessionRepository } from './repositories/in-memory-session.repository.ts';
import { InMemoryUserRepository } from './repositories/in-memory-user.repository.ts';

/**
 * Every port of the identity application layer, faked and wired together.
 * `createIdentityTestKit()` per test keeps tests independent.
 */
export function createIdentityTestKit() {
  const clock = new FixedClock();
  const settings: IdentitySettings = {
    refreshTokenTtlDays: 30,
    emailVerificationTtlHours: 24,
    passwordResetTtlMinutes: 60,
  };
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  const tokens = new InMemoryOneTimeTokenRepository();
  const hasher = new FakePasswordHasher();
  const accessTokens = new FakeAccessTokenIssuer(clock);
  const secureTokens = new FakeSecureTokenGenerator();
  const notifier = new FakeIdentityNotifier();
  const eventBus = new RecordingEventBus();
  const unitOfWork = new ImmediateUnitOfWork();
  const sessionIssuer = new SessionIssuer(sessions, accessTokens, secureTokens, settings, clock);
  const verificationSender = new VerificationEmailSender(
    tokens,
    secureTokens,
    notifier,
    settings,
    unitOfWork,
    clock,
  );

  /** Persists a registered user (events already pulled) with password `password`. */
  async function givenUser(
    overrides: { email?: string; verified?: boolean; password?: string } = {},
  ) {
    const user = User.register({
      email: Email.create(overrides.email ?? 'ada@example.com'),
      name: 'Ada',
      passwordHash: PasswordHash.fromHash(
        `hashed:${overrides.password ?? 'correct horse battery'}`,
      ),
      locale: 'en',
      now: clock.now(),
    });
    if (overrides.verified) user.verifyEmail(clock.now());
    user.pullDomainEvents();
    await users.save(user);
    return user;
  }

  return {
    clock,
    settings,
    users,
    sessions,
    tokens,
    hasher,
    accessTokens,
    secureTokens,
    notifier,
    eventBus,
    unitOfWork,
    sessionIssuer,
    verificationSender,
    givenUser,
  };
}

export type IdentityTestKit = ReturnType<typeof createIdentityTestKit>;
