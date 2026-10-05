'use client';

import { useMutation } from '@tanstack/react-query';

import { authMutations } from '../api/auth.mutations';

export function useForgotPassword() {
  return useMutation({ mutationFn: authMutations.forgotPassword });
}
