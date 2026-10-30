import { queryOptions } from '@tanstack/react-query';

import { api } from '@/shared/api/api-client';

import { videoKeys } from './videos.keys';

/** How often the list is refreshed while a video converts: conversion takes minutes. */
export const PROCESSING_POLL_MS = 5_000;

/** The signed-in user's videos, refreshed until none is converting any more. */
export const videosQuery = () =>
  queryOptions({
    queryKey: videoKeys.list(),
    queryFn: () => api.media.listVideos(),
    refetchInterval: (query) =>
      query.state.data?.videos.some((video) => video.status === 'PROCESSING')
        ? PROCESSING_POLL_MS
        : false,
  });
