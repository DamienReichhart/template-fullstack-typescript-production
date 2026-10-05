import { AuthCookies } from '@template/contracts/common';
import { hasLocale } from 'next-intl';
import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';

import { routing } from './i18n/routing';
import { AppRoutes, isGuestOnlyRoute, isProtectedRoute } from './shared/config/app-routes';

const handleI18n = createIntlMiddleware(routing);

/**
 * Runs before every page request: locale negotiation (next-intl) and UX redirects based on
 * the readable session-hint cookie. This is routing only; the API remains the sole authority
 * on authentication (the hint is never trusted for data access).
 */
export default function proxy(request: NextRequest) {
  const [, locale, ...rest] = request.nextUrl.pathname.split('/');
  if (locale && hasLocale(routing.locales, locale)) {
    const path = `/${rest.join('/')}`;
    const signedIn = request.cookies.has(AuthCookies.sessionHint);

    if (!signedIn && isProtectedRoute(path)) {
      const login = new URL(`/${locale}${AppRoutes.login}`, request.url);
      login.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(login);
    }
    if (signedIn && isGuestOnlyRoute(path)) {
      return NextResponse.redirect(new URL(`/${locale}${AppRoutes.dashboard}`, request.url));
    }
  }
  return handleI18n(request);
}

export const config = {
  // Pages only: skip Next internals, metadata routes and files with an extension.
  matcher: ['/((?!_next|_vercel|sitemap.xml|robots.txt|manifest.webmanifest|.*\\..*).*)'],
};
