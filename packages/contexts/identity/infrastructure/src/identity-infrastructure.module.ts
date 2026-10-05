import { Module, type DynamicModule } from '@nestjs/common';
import { Clock, SystemClock } from '@template/ddd';
import {
  AccessTokenIssuer,
  IdentityNotifier,
  IdentitySettings,
  PasswordHasher,
  SecureTokenGenerator,
} from '@template/identity-application';
import {
  OneTimeTokenRepository,
  SessionRepository,
  UserRepository,
} from '@template/identity-domain';
import { MessagingModule } from '@template/messaging';
import { mailQueue } from '@template/queue';

import { identitySettingsProvider } from './config/identity.config.js';
import { BullMqIdentityNotifier } from './messaging/bullmq-identity-notifier.js';
import { PrismaOneTimeTokenRepository } from './persistence/repositories/prisma-one-time-token.repository.js';
import { PrismaSessionRepository } from './persistence/repositories/prisma-session.repository.js';
import { PrismaUserRepository } from './persistence/repositories/prisma-user.repository.js';
import { Argon2PasswordHasher } from './security/hashing/argon2-password-hasher.js';
import { CryptoSecureTokenGenerator } from './security/tokens/crypto-secure-token-generator.js';
import { JwtAccessTokenIssuer } from './security/tokens/jwt-access-token-issuer.js';

const ports = [
  UserRepository,
  SessionRepository,
  OneTimeTokenRepository,
  PasswordHasher,
  AccessTokenIssuer,
  SecureTokenGenerator,
  IdentityNotifier,
  IdentitySettings,
  Clock,
];

/**
 * Binds every port of the identity application layer to a real adapter. Requires the
 * app to import `DatabaseModule`, `MessagingModule.forRoot()` and `ConfigModule` with
 * `identityConfig`.
 */
@Module({})
export class IdentityInfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: IdentityInfrastructureModule,
      imports: [MessagingModule.registerQueues(mailQueue)],
      providers: [
        { provide: UserRepository, useClass: PrismaUserRepository },
        { provide: SessionRepository, useClass: PrismaSessionRepository },
        { provide: OneTimeTokenRepository, useClass: PrismaOneTimeTokenRepository },
        { provide: PasswordHasher, useClass: Argon2PasswordHasher },
        { provide: AccessTokenIssuer, useClass: JwtAccessTokenIssuer },
        { provide: SecureTokenGenerator, useClass: CryptoSecureTokenGenerator },
        { provide: IdentityNotifier, useClass: BullMqIdentityNotifier },
        { provide: Clock, useClass: SystemClock },
        identitySettingsProvider,
      ],
      exports: ports,
    };
  }
}
