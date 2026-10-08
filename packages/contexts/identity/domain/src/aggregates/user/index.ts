export { AvatarUploadNotFoundError } from './errors/avatar-upload-not-found.error.ts';
export { EmailAlreadyTakenError } from './errors/email-already-taken.error.ts';
export { EmailNotVerifiedError } from './errors/email-not-verified.error.ts';
export { InvalidCredentialsError } from './errors/invalid-credentials.error.ts';
export { InvalidAvatarError, type InvalidAvatarReason } from './errors/invalid-avatar.error.ts';
export { InvalidEmailError } from './errors/invalid-email.error.ts';
export { UserNotFoundError } from './errors/user-not-found.error.ts';
export { AvatarChangedEvent } from './events/avatar-changed.event.ts';
export { EmailVerifiedEvent } from './events/email-verified.event.ts';
export { PasswordChangedEvent } from './events/password-changed.event.ts';
export { PasswordResetRequestedEvent } from './events/password-reset-requested.event.ts';
export { UserRegisteredEvent } from './events/user-registered.event.ts';
export { UserRepository } from './repositories/user.repository.ts';
export { User, type RegisterUserInput, type UserProps } from './user.aggregate.ts';
export {
  AVATAR_CONTENT_TYPES,
  AVATAR_MAX_BYTES,
  AvatarImage,
  type AvatarContentType,
} from './value-objects/avatar-image.value-object.ts';
export { Email } from './value-objects/email.value-object.ts';
export { PasswordHash } from './value-objects/password-hash.value-object.ts';
export { UserId } from './value-objects/user-id.value-object.ts';
export { isUserRole, UserRoles, type UserRole } from './value-objects/user-role.value-object.ts';
