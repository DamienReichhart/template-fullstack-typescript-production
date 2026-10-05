'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useRouter } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';
import { LoadingState } from '@/shared/components/feedback/loading-state';

import { useCurrentUser } from '../../hooks/use-current-user';

/**
 * Renders its children for signed-in users only. The proxy already redirects requests
 * without a session cookie; this guard catches sessions that died meanwhile.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace({ pathname: AppRoutes.login, query: { returnTo: pathname } });
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !isAuthenticated) return <LoadingState />;
  return children;
}
