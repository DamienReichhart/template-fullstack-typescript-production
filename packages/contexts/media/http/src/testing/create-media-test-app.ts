import {
  HttpStatus,
  Injectable,
  Module,
  type CanActivate,
  type DynamicModule,
  type ExecutionContext,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { CommonErrorCode } from '@template/contracts/common';
import { Clock } from '@template/ddd';
import {
  ApiProblemException,
  REQUIRE_VERIFIED_EMAIL_KEY,
  type AuthenticatedRequest,
} from '@template/http';
import {
  MediaApplicationModule,
  VideoStorage,
  VideoTranscoder,
  VideoTranscoding,
} from '@template/media-application';
import { createMediaTestKit, OWNER_ID } from '@template/media-application/testing';
import { VideoRepository } from '@template/media-domain';
import { createTestApp } from '@template/testing';
import request from 'supertest';

import { MediaHttpModule } from '../media-http.module.ts';

/** Header naming the caller, standing in for identity's cookie authentication. */
const CALLER = 'x-test-user';
/** `false` makes the caller's email unverified. */
const VERIFIED = 'x-test-verified';

/**
 * What identity's guards do, from headers: sets the caller and enforces
 * `@RequireVerifiedEmail()`. Media cannot import identity, so its tests bring their own.
 */
@Injectable()
class HeaderAuthenticationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const id = request.header(CALLER);
    if (!id)
      throw new ApiProblemException(HttpStatus.UNAUTHORIZED, CommonErrorCode.unauthenticated);
    request.user = { id, role: 'USER', emailVerified: request.header(VERIFIED) !== 'false' };
    const verifiedOnly = this.reflector.getAllAndOverride<boolean>(REQUIRE_VERIFIED_EMAIL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (verifiedOnly && !request.user.emailVerified) {
      throw new ApiProblemException(HttpStatus.FORBIDDEN, CommonErrorCode.forbidden);
    }
    return true;
  }
}

@Module({})
class FakeMediaInfrastructureModule {
  static with(kit: ReturnType<typeof createMediaTestKit>): DynamicModule {
    const bindings = [
      { provide: VideoRepository, useValue: kit.videos },
      { provide: VideoStorage, useValue: kit.storage },
      { provide: VideoTranscoder, useValue: kit.transcoder },
      { provide: VideoTranscoding, useValue: kit.transcoding },
      { provide: Clock, useValue: kit.clock },
    ];
    return {
      module: FakeMediaInfrastructureModule,
      providers: bindings,
      exports: bindings.map((b) => b.provide),
    };
  }
}

/**
 * The real media HTTP + application stack over in-memory adapters. `as(ownerId)` sends requests
 * as that caller (`OWNER_ID` by default).
 */
export async function createMediaTestApp() {
  const kit = createMediaTestKit();
  const app = await createTestApp({
    imports: [
      CqrsModule.forRoot(),
      MediaHttpModule.register({
        application: MediaApplicationModule.register({
          infrastructure: FakeMediaInfrastructureModule.with(kit),
        }),
      }),
    ],
    providers: [{ provide: APP_GUARD, useClass: HeaderAuthenticationGuard }],
  });
  const server = request(app.getHttpServer());
  const as = (ownerId = OWNER_ID, { verified = true } = {}) => ({
    get: (path: string) => server.get(path).set(CALLER, ownerId).set(VERIFIED, String(verified)),
    post: (path: string) => server.post(path).set(CALLER, ownerId).set(VERIFIED, String(verified)),
  });

  return { app, kit, server, as, close: () => app.close() };
}
