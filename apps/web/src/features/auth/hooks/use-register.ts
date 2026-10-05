'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { authKeys } from '../api/auth.keys';
import { authMutations } from '../api/auth.mutations';
import type { RegisterFormValues } from '../schemas/register-form.schema';

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  return useMutation({
    mutationFn: ({ name, email, password }: RegisterFormValues) =>
      authMutations.register({ name, email, password, locale }),
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser(), user);
      router.replace(AppRoutes.dashboard);
    },
  });
}
