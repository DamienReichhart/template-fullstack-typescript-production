'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { videoKeys } from '../api/videos.keys';
import { videoMutations } from '../api/videos.mutations';

export function useUploadVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: videoMutations.upload,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: videoKeys.all }),
  });
}
