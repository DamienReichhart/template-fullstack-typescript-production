'use client';

import { useQuery } from '@tanstack/react-query';

import { videosQuery } from '../api/videos.queries';

export function useVideos() {
  return useQuery(videosQuery());
}
