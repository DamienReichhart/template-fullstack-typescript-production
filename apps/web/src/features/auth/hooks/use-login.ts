'use client';

import { locales } from '@template/i18n';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

import { useRouter } from '@/i18n/navigation';

import { authKeys } from '../api/auth.keys';
import { authMutations } from '../api/auth.mutations';
import { safeReturnTo } from '../lib/safe-return-to';

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: authMutations.login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      router.replace(safeReturnTo(searchParams.get('returnTo'), locales));
    },
  });
}
