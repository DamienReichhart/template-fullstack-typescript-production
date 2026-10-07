import { Module, type DynamicModule } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@template/config';
import { Clock, UnitOfWork } from '@template/ddd';
import {
  AccessTokenIssuer,
  AvatarStorage,
  IdentityApplicationModule,
  IdentityHousekeeping,
  IdentityNotifier,
  IdentitySettings,
  PasswordHasher,
  SecureTokenGenerator,
} from '@template/identity-application';
import { createIdentityTestKit } from '@template/identity-application/testing';
import {
  OneTimeTokenRepository,
  SessionRepository,
  UserRepository,
} from '@template/identity-domain';
import { createTestApp } from '@template/testing';
import request from 'supertest';

import { identityCookieConfig } from '../cookies/cookie-options.ts';
import { IdentityHttpModule } from '../identity-http.module.ts';

@Module({})
class FakeIdentityInfrastructureModule {
  static with(kit: ReturnType<typeof createIdentityTestKit>): DynamicModule {
    const bindings = [
      { provide: UserRepository, useValue: kit.users },
      { provide: SessionRepository, useValue: kit.sessions },
      { provide: OneTimeTokenRepository, useValue: kit.tokens },
      { provide: PasswordHasher, useValue: kit.hasher },
      { provide: AccessTokenIssuer, useValue: kit.accessTokens },
      { provide: SecureTokenGenerator, useValue: kit.secureTokens },
      { provide: IdentityNotifier, useValue: kit.notifier },
      { provide: IdentityHousekeeping, useValue: kit.housekeeping },
      { provide: AvatarStorage, useValue: kit.avatars },
      { provide: IdentitySettings, useValue: kit.settings },
      { provide: Clock, useValue: kit.clock },
      { provide: UnitOfWork, useValue: kit.unitOfWork },
    ];
    return {
      module: FakeIdentityInfrastructureModule,
      providers: bindings,
      exports: bindings.map((b) => b.provide),
    };
  }
}

/**
 * The real identity HTTP + application stack over in-memory adapters, plus a cookie-aware
 * client that already holds a CSRF token.
 */
export async function createIdentityTestApp() {
  const kit = createIdentityTestKit();
  // Cookies carry real expiry dates: a clock in the past would make clients drop them.
  kit.clock.set(new Date());
  const app = await createTestApp({
    imports: [
      ConfigModule.forRoot({
        definitions: [identityCookieConfig],
        env: { COOKIE_SECURE: 'false' },
      }),
      CqrsModule.forRoot(),
      IdentityHttpModule.register({
        application: IdentityApplicationModule.register({
          infrastructure: FakeIdentityInfrastructureModule.with(kit),
        }),
      }),
    ],
  });

  const agent = request.agent(app.getHttpServer());
  const csrf = await agent.get('/api/v1/auth/csrf');
  const csrfToken = /tpl_csrf=([^;]+)/.exec(String(csrf.headers['set-cookie']))?.[1] ?? '';
  const post = (path: string) => agent.post(path).set('x-csrf-token', csrfToken);
  const put = (path: string) => agent.put(path).set('x-csrf-token', csrfToken);
  const del = (path: string) => agent.delete(path).set('x-csrf-token', csrfToken);

  return { app, kit, agent, post, put, del, close: () => app.close() };
}
