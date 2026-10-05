/** Business durations of the identity context, bound from configuration by infrastructure. */
export abstract class IdentitySettings {
  abstract readonly refreshTokenTtlDays: number;
  abstract readonly emailVerificationTtlHours: number;
  abstract readonly passwordResetTtlMinutes: number;
}
