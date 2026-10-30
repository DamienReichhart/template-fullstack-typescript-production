import { SetMetadata } from '@nestjs/common';

export const REQUIRE_VERIFIED_EMAIL_KEY = 'http:require-verified-email';

/**
 * Restricts a route to users whose email address is verified. Whatever guard the app installs
 * for it (identity's `EmailVerifiedGuard`) must honour it.
 */
export const RequireVerifiedEmail = () => SetMetadata(REQUIRE_VERIFIED_EMAIL_KEY, true);
