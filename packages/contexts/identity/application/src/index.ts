export { ChangeAvatarCommand } from './commands/change-avatar/change-avatar.command.ts';
export { DeleteAvatarFileCommand } from './commands/delete-avatar-file/delete-avatar-file.command.ts';
export { LoginCommand } from './commands/login/login.command.ts';
export { LogoutCommand } from './commands/logout/logout.command.ts';
export {
  PurgeExpiredSessionsCommand,
  type PurgeResult,
} from './commands/purge-expired-sessions/purge-expired-sessions.command.ts';
export { RefreshSessionCommand } from './commands/refresh-session/refresh-session.command.ts';
export { RegisterUserCommand } from './commands/register-user/register-user.command.ts';
export { RequestPasswordResetCommand } from './commands/request-password-reset/request-password-reset.command.ts';
export { RemoveAvatarCommand } from './commands/remove-avatar/remove-avatar.command.ts';
export { RequestAvatarUploadCommand } from './commands/request-avatar-upload/request-avatar-upload.command.ts';
export { ResendEmailVerificationCommand } from './commands/resend-email-verification/resend-email-verification.command.ts';
export { ResetPasswordCommand } from './commands/reset-password/reset-password.command.ts';
export { VerifyEmailCommand } from './commands/verify-email/verify-email.command.ts';
export {
  IdentityApplicationModule,
  type IdentityApplicationModuleOptions,
} from './identity-application.module.ts';
export { IdentitySettings } from './ports/configuration/identity-settings.port.ts';
export { IdentityHousekeeping } from './ports/maintenance/identity-housekeeping.port.ts';
export { IdentityNotifier, type Recipient } from './ports/notifications/identity-notifier.port.ts';
export {
  AccessTokenIssuer,
  InvalidAccessTokenError,
  type AccessTokenClaims,
  type IssuedAccessToken,
} from './ports/security/access-token-issuer.port.ts';
export { PasswordHasher } from './ports/security/password-hasher.port.ts';
export {
  SecureTokenGenerator,
  type GeneratedToken,
} from './ports/security/secure-token-generator.port.ts';
export { AvatarStorage, type AvatarUploadTicket } from './ports/storage/avatar-storage.port.ts';
export { CurrentUserViews } from './services/current-user-views.service.ts';
export { SessionIssuer } from './services/session-issuer.service.ts';
export { VerificationEmailSender } from './services/verification-email.sender.ts';
export { GetCurrentUserQuery } from './queries/get-current-user/get-current-user.query.ts';
export type { AuthSessionView } from './views/auth-session.view.ts';
export type { ClientInfo } from './views/client-info.ts';
export { toCurrentUserView, type CurrentUserView } from './views/current-user.view.ts';
