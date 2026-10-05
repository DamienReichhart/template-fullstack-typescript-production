'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authKeys } from '../api/auth.keys';
import { authMutations } from '../api/auth.mutations';

export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      await authMutations.verifyEmail({ token });
      // If this browser is signed in, rotate the session so the access token says "verified".
      await authMutations.refreshSession().catch(() => false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.all }),
  });
}
