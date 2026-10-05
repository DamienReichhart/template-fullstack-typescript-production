'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { SESSION_EXPIRED_EVENT } from '@/shared/api/api-client';

import { authKeys } from '../api/auth.keys';
import { currentUserQuery } from '../api/auth.queries';

export function useCurrentUser() {
  const queryClient = useQueryClient();
  const query = useQuery(currentUserQuery());

  // A 401 the api-client could not recover means the session is gone everywhere.
  useEffect(() => {
    const onExpired = () => queryClient.setQueryData(authKeys.currentUser(), null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [queryClient]);

  return {
    user: query.data ?? null,
    isAuthenticated: !!query.data,
    isLoading: query.isPending,
    error: query.error,
  };
}
