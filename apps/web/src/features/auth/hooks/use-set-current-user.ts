'use client';

import type { CurrentUserResponse } from '@template/contracts/identity';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { authKeys } from '../api/auth.keys';

/** Replaces the cached signed-in user with the one an api call just returned. */
export function useSetCurrentUser() {
  const queryClient = useQueryClient();
  return useCallback(
    (user: CurrentUserResponse) => queryClient.setQueryData(authKeys.currentUser(), user),
    [queryClient],
  );
}
