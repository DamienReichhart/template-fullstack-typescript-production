import { appConfig, databaseConfig, httpConfig, redisConfig } from '@template/config';
import { identityCookieConfig } from '@template/identity-http';
import { identityConfig } from '@template/identity-infrastructure';

/** Every config slice the api reads. All are validated together at boot. */
export const apiConfigDefinitions = [
  appConfig,
  httpConfig,
  databaseConfig,
  redisConfig,
  identityConfig,
  identityCookieConfig,
] as const;
