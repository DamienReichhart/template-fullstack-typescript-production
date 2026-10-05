import { isApiError } from '@template/api-client';
import type { CurrentUserResponse } from '@template/contracts/identity';
import { queryOptions } from '@tanstack/react-query';

import { api } from '@/shared/api/api-client';

import { authKeys } from './auth.keys';

/**
 * The signed-in user, or `null` when nobody is signed in (a 401 is an answer, not an error).
 * Visitors without the session hint cookie are answered locally: no request, no 401 noise.
 */
export const currentUserQuery = () =>
  queryOptions({
    queryKey: authKeys.currentUser(),
    queryFn: async (): Promise<CurrentUserResponse | null> => {
      if (!api.hasSessionHint()) return null;
      try {
        return await api.identity.me();
      } catch (error) {
        if (isApiError(error) && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
  });
