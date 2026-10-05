import { SetMetadata } from '@nestjs/common';

export const REQUIRE_VERIFIED_EMAIL_KEY = 'identity:require-verified-email';

/** Restricts a route to users whose email address is verified. */
export const RequireVerifiedEmail = () => SetMetadata(REQUIRE_VERIFIED_EMAIL_KEY, true);
