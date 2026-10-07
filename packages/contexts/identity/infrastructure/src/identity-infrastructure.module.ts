import { Module, type DynamicModule } from '@nestjs/common';
import { Clock, SystemClock } from '@template/ddd';
import {
  AccessTokenIssuer,
  AvatarStorage,
  IdentityHousekeeping,
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
import { identityMaintenanceQueue, mailQueue } from '@template/queue';

import { identitySettingsProvider } from './config/identity.config.ts';
import { BullMqIdentityHousekeeping } from './messaging/bullmq-identity-housekeeping.ts';
import { BullMqIdentityNotifier } from './messaging/bullmq-identity-notifier.ts';
import { PrismaOneTimeTokenRepository } from './persistence/repositories/prisma-one-time-token.repository.ts';
import { PrismaSessionRepository } from './persistence/repositories/prisma-session.repository.ts';
import { PrismaUserRepository } from './persistence/repositories/prisma-user.repository.ts';
import { Argon2PasswordHasher } from './security/hashing/argon2-password-hasher.ts';
import { CryptoSecureTokenGenerator } from './security/tokens/crypto-secure-token-generator.ts';
import { JwtAccessTokenIssuer } from './security/tokens/jwt-access-token-issuer.ts';
import { ObjectStorageAvatarStorage } from './storage/object-storage-avatar-storage.ts';

const ports = [
  UserRepository,
  SessionRepository,
  OneTimeTokenRepository,
  PasswordHasher,
  AccessTokenIssuer,
  SecureTokenGenerator,
  IdentityNotifier,
  IdentityHousekeeping,
  AvatarStorage,
  IdentitySettings,
  Clock,
];

/**
 * Binds every port of the identity application layer to a real adapter. Requires the
 * app to import `DatabaseModule`, `MessagingModule.forRoot()`, `StorageModule` and
 * `ConfigModule` with `identityConfig` and `storageConfig`.
 */
@Module({})
export class IdentityInfrastructureModule {
  static forRoot(): DynamicModule {
    return {
      module: IdentityInfrastructureModule,
      imports: [MessagingModule.registerQueues(mailQueue, identityMaintenanceQueue)],
      providers: [
        { provide: UserRepository, useClass: PrismaUserRepository },
        { provide: SessionRepository, useClass: PrismaSessionRepository },
        { provide: OneTimeTokenRepository, useClass: PrismaOneTimeTokenRepository },
        { provide: PasswordHasher, useClass: Argon2PasswordHasher },
        { provide: AccessTokenIssuer, useClass: JwtAccessTokenIssuer },
        { provide: SecureTokenGenerator, useClass: CryptoSecureTokenGenerator },
        { provide: IdentityNotifier, useClass: BullMqIdentityNotifier },
        { provide: IdentityHousekeeping, useClass: BullMqIdentityHousekeeping },
        { provide: AvatarStorage, useClass: ObjectStorageAvatarStorage },
        { provide: Clock, useClass: SystemClock },
        identitySettingsProvider,
      ],
      exports: ports,
    };
  }
}
