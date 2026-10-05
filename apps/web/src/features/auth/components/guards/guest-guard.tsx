'use client';

import { useEffect, type ReactNode } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { AppRoutes, isGuestOnlyRoute } from '@/shared/config/app-routes';

import { useCurrentUser } from '../../hooks/use-current-user';

/**
 * Sends signed-in users away from guest-only pages (login, register, forgot password), by the
 * same rule as the proxy. Pages that merely share the auth layout (email verification,
 * password reset) stay put: signed-in users open those links too. Renders immediately:
 * guests should not wait for the session check to see the form.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const guestOnly = isGuestOnlyRoute(usePathname());

  useEffect(() => {
    if (guestOnly && isAuthenticated) router.replace(AppRoutes.dashboard);
  }, [guestOnly, isAuthenticated, router]);

  return children;
}
