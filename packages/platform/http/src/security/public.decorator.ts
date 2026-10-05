import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'http:is-public';

/**
 * Opens a route to anonymous callers. Whatever authentication guard the app installs must
 * honour it; every other route is private by default.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
