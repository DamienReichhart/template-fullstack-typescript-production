import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'identity:is-public';

/** Opens a route to anonymous callers. Every other route requires a valid access token. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
