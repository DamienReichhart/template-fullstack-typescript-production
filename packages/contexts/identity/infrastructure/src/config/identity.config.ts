import type { Provider } from '@nestjs/common';
import type { ConfigType } from '@template/config';
import { IdentitySettings } from '@template/identity-application';

import { identityConfig } from './identity-env.schema.js';

export type IdentityConfig = ConfigType<typeof identityConfig>;

/** Binds the application's `IdentitySettings` port to the validated environment. */
export const identitySettingsProvider: Provider = {
  provide: IdentitySettings,
  inject: [identityConfig.token],
  useFactory: (config: IdentityConfig): IdentitySettings => ({
    refreshTokenTtlDays: config.REFRESH_TOKEN_TTL_DAYS,
    emailVerificationTtlHours: config.EMAIL_VERIFICATION_TTL_HOURS,
    passwordResetTtlMinutes: config.PASSWORD_RESET_TTL_MINUTES,
  }),
};
