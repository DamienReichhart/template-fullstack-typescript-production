'use client';

import { useEffect, type ReactNode } from 'react';

import { useRouter } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { useCurrentUser } from '../../hooks/use-current-user';

/**
 * Sends signed-in users away from guest-only pages (login, register). Renders immediately:
 * guests should not wait for the session check to see the form.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace(AppRoutes.dashboard);
  }, [isAuthenticated, router]);

  return children;
}
