'use client';

import { useMutation } from '@tanstack/react-query';

import { useSetCurrentUser } from '@/features/auth';

import { avatarMutations } from '../api/avatar.mutations';

export function useChangeAvatar() {
  const setCurrentUser = useSetCurrentUser();
  return useMutation({ mutationFn: avatarMutations.change, onSuccess: setCurrentUser });
}
