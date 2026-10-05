import { createHttpClient, identityEndpoints, systemEndpoints } from '@template/api-client';

import { publicEnv } from '../config/public-env';

/** Dispatched when a 401 cannot be recovered by a refresh. The auth feature listens to it. */
export const SESSION_EXPIRED_EVENT = 'template:session-expired';

const http = createHttpClient({
  baseUrl: publicEnv.NEXT_PUBLIC_API_URL,
  onSessionExpired: () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  },
});

/** Every API call of the web app goes through these endpoint groups. */
export const api = {
  identity: identityEndpoints(http),
  system: systemEndpoints(http),
  /** False when nobody can be signed in: no need to ask the api. */
  hasSessionHint: () => http.hasSessionHint(),
};
