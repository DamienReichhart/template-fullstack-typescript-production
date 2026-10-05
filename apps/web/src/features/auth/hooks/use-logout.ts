'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useRouter } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { authMutations } from '../api/auth.mutations';

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authMutations.logout,
    // Signed out locally even if the API is unreachable: cookies expire on their own.
    onSettled: () => {
      queryClient.clear();
      router.replace(AppRoutes.login);
    },
  });
}
