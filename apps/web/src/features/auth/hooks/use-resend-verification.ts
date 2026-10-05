'use client';

import { useMutation } from '@tanstack/react-query';

import { authMutations } from '../api/auth.mutations';

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authMutations.resendVerification({ email }),
  });
}
