import { AppRoutes } from '@/shared/config/app-routes';

/**
 * Accepts only same-site, locale-less app paths (`/dashboard`) as post-login destinations,
 * so `?returnTo=` can never send users to another origin (open redirect).
 */
export function safeReturnTo(raw: string | null | undefined, locales: readonly string[]): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\'))
    return AppRoutes.dashboard;
  const [, first, ...rest] = raw.split('/');
  const path = first && locales.includes(first) ? `/${rest.join('/')}` : raw;
  return path === '/' || path === '' ? AppRoutes.dashboard : path;
}
