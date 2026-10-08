import { HttpStatus, Injectable } from '@nestjs/common';
import { CommonErrorCode } from '@template/contracts/common';
import { IdentityErrorCode } from '@template/contracts/identity';
import { DomainErrorMapper, type MappedError } from '@template/http';
import {
  AvatarUploadNotFoundError,
  EmailAlreadyTakenError,
  EmailNotVerifiedError,
  InvalidAvatarError,
  InvalidCredentialsError,
  InvalidEmailError,
  InvalidOrExpiredTokenError,
  RefreshTokenAlreadyRotatedError,
  RefreshTokenReuseDetectedError,
  SessionExpiredError,
  SessionRevokedError,
  UserNotFoundError,
} from '@template/identity-domain';

const MAPPINGS: [new (...args: never[]) => Error, MappedError][] = [
  [
    EmailAlreadyTakenError,
    { status: HttpStatus.CONFLICT, code: IdentityErrorCode.emailAlreadyTaken },
  ],
  [
    InvalidCredentialsError,
    { status: HttpStatus.UNAUTHORIZED, code: IdentityErrorCode.invalidCredentials },
  ],
  [
    EmailNotVerifiedError,
    { status: HttpStatus.FORBIDDEN, code: IdentityErrorCode.emailNotVerified },
  ],
  [
    SessionExpiredError,
    { status: HttpStatus.UNAUTHORIZED, code: IdentityErrorCode.sessionExpired },
  ],
  [
    SessionRevokedError,
    { status: HttpStatus.UNAUTHORIZED, code: IdentityErrorCode.sessionRevoked },
  ],
  [
    RefreshTokenReuseDetectedError,
    { status: HttpStatus.UNAUTHORIZED, code: IdentityErrorCode.sessionRevoked },
  ],
  [
    RefreshTokenAlreadyRotatedError,
    { status: HttpStatus.CONFLICT, code: IdentityErrorCode.sessionRefreshConflict },
  ],
  [
    InvalidOrExpiredTokenError,
    { status: HttpStatus.BAD_REQUEST, code: IdentityErrorCode.invalidOrExpiredToken },
  ],
  [InvalidAvatarError, { status: HttpStatus.BAD_REQUEST, code: IdentityErrorCode.avatarInvalid }],
  [
    AvatarUploadNotFoundError,
    { status: HttpStatus.BAD_REQUEST, code: IdentityErrorCode.avatarUploadNotFound },
  ],
  [UserNotFoundError, { status: HttpStatus.UNAUTHORIZED, code: CommonErrorCode.unauthenticated }],
  [InvalidEmailError, { status: HttpStatus.BAD_REQUEST, code: CommonErrorCode.validationFailed }],
];

/** Translates identity domain errors into HTTP problems (discovered by the global filter). */
@Injectable()
export class IdentityErrorMapper extends DomainErrorMapper {
  map(error: unknown): MappedError | undefined {
    return MAPPINGS.find(([type]) => error instanceof type)?.[1];
  }
}
