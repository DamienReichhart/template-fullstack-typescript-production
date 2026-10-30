import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { renderWithProviders } from '@/shared/testing/render-with-providers';

import { UploadVideoCard } from './upload-video-card';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const uploadId = '0199b0a0-0000-4000-8000-0000000000aa';
const video = {
  id: '0199b0a0-0000-7000-8000-0000000000bb',
  status: 'PROCESSING',
  failureReason: null,
  url: null,
  width: null,
  height: null,
  durationSeconds: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

let fetchMock: ReturnType<typeof mock>;

beforeEach(() => {
  fetchMock = mock(async (url: string, init?: RequestInit) => {
    if (url.endsWith('/videos/uploads')) {
      return json(
        {
          uploadId,
          url: 'http://localhost:9000/template',
          fields: { key: `staging/media/videos/u/${uploadId}`, 'Content-Type': 'video/quicktime' },
          expiresAt: '2026-01-01T01:00:00.000Z',
        },
        201,
      );
    }
    if (url === 'http://localhost:9000/template') return new Response(null, { status: 204 });
    if (url.endsWith('/videos') && init?.method === 'POST') return json(video, 201);
    return json({ type: 'about:blank', title: 'Not Found', status: 404, code: 'NOT_FOUND' }, 404);
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(cleanup);

describe('UploadVideoCard', () => {
  it('sends the video to storage without credentials, then turns it into a video', async () => {
    await renderWithProviders(<UploadVideoCard />);

    const file = new File([new Uint8Array([0, 0, 0, 0x14])], 'clip.mov', {
      type: 'video/quicktime',
    });
    await userEvent.upload(screen.getByTestId('video-file'), file);

    expect(
      await screen.findByText('Your video was sent. It will be ready in a few minutes.'),
    ).toBeTruthy();
    const calls = fetchMock.mock.calls as [string, RequestInit][];
    const storageCall = calls.find(([url]) => url === 'http://localhost:9000/template');
    expect(storageCall?.[1].credentials).toBe('omit');
    expect(JSON.parse(String(calls.at(-1)?.[1].body))).toEqual({ uploadId });
  });

  it('refuses an unsupported file before sending anything', async () => {
    await renderWithProviders(<UploadVideoCard />);

    const file = new File(['webm'], 'clip.webm', { type: 'video/webm' });
    await userEvent.upload(screen.getByTestId('video-file'), file, { applyAccept: false });

    expect(await screen.findByText('Choose an MP4 or MOV video.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
