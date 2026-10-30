import { afterEach, describe, expect, it } from 'bun:test';
import type { VideoResponse } from '@template/contracts/media';
import { cleanup, screen } from '@testing-library/react';

import type { QueryClient } from '@tanstack/react-query';

import { renderWithProviders } from '@/shared/testing/render-with-providers';

import { videoKeys } from '../api/videos.keys';
import { VideoList } from './video-list';

const base = {
  failureReason: null,
  url: null,
  width: null,
  height: null,
  durationSeconds: null,
  createdAt: '2026-01-01T09:30:00.000Z',
} as const;

const videos: VideoResponse[] = [
  {
    ...base,
    id: '0199b0a0-0000-7000-8000-000000000003',
    status: 'READY',
    url: 'http://localhost:9000/template/media/videos/u/v3?X-Amz-Signature=s',
    width: 1080,
    height: 1920,
    durationSeconds: 12.5,
  },
  { ...base, id: '0199b0a0-0000-7000-8000-000000000002', status: 'PROCESSING' },
  {
    ...base,
    id: '0199b0a0-0000-7000-8000-000000000001',
    status: 'FAILED',
    failureReason: 'too-long',
  },
];

afterEach(cleanup);

const seeded = (list: VideoResponse[]) => ({
  seed: (queryClient: QueryClient) => queryClient.setQueryData(videoKeys.list(), { videos: list }),
});

describe('VideoList', () => {
  it('plays Ready videos, shows conversion progress and why a video failed', async () => {
    await renderWithProviders(<VideoList />, seeded(videos));

    const player = screen.getByLabelText('Video sent on Jan 1, 2026, 9:30 AM');
    expect(player.tagName).toBe('VIDEO');
    expect(player.getAttribute('src')).toBe(videos[0]?.url ?? '');
    expect(player.hasAttribute('playsinline')).toBe(true);
    expect(screen.getByText('Converting…')).toBeTruthy();
    expect(screen.getByText('This video is longer than 10 minutes.')).toBeTruthy();
  });

  it('says when there is no video yet', async () => {
    await renderWithProviders(<VideoList />, seeded([]));

    expect(screen.getByText('You have not sent any video yet.')).toBeTruthy();
  });

  it('speaks French', async () => {
    await renderWithProviders(<VideoList />, { ...seeded(videos), locale: 'fr' });

    expect(screen.getByText('Conversion…')).toBeTruthy();
    expect(screen.getByText('Cette vidéo dure plus de 10 minutes.')).toBeTruthy();
  });
});
