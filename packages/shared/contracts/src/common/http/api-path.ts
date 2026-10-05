export const API_PREFIX = 'api';
export const API_VERSION = '1';

/** Builds the absolute API path of an endpoint, e.g. `apiPath('auth', 'login')` → `/api/v1/auth/login`. */
export function apiPath(...segments: string[]): string {
  return `/${[API_PREFIX, `v${API_VERSION}`, ...segments].filter(Boolean).join('/')}`;
}
