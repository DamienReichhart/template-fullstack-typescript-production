import { booleanFlag, defineConfig, type ConfigType } from '@template/config';
import { apiPath } from '@template/contracts/common';
import { IdentityRoutes } from '@template/contracts/identity';
import type { CookieOptions } from 'express';
import { z } from 'zod';

export const identityCookieConfig = defineConfig(
  'identity-cookies',
  z.object({
    /** Parent domain shared by web and API in production; omitted (host-only) for localhost. */
    COOKIE_DOMAIN: z.string().optional(),
    COOKIE_SECURE: booleanFlag(true),
  }),
);

export type IdentityCookieConfig = ConfigType<typeof identityCookieConfig>;

/** The refresh token is only ever sent to the auth endpoints that need it. */
export const REFRESH_COOKIE_PATH = apiPath(IdentityRoutes.auth.controller);

export function baseCookieOptions(config: IdentityCookieConfig): CookieOptions {
  const domain =
    config.COOKIE_DOMAIN && config.COOKIE_DOMAIN !== 'localhost' ? config.COOKIE_DOMAIN : undefined;
  return { secure: config.COOKIE_SECURE, sameSite: 'lax', domain };
}
