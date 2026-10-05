'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authKeys } from '../api/auth.keys';
import { authMutations } from '../api/auth.mutations';

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authMutations.resetPassword,
    // Every session was revoked by the reset, this one included.
    onSuccess: () => queryClient.setQueryData(authKeys.currentUser(), null),
  });
}
