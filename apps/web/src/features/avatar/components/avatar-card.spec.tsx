import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import type { QueryClient } from '@tanstack/react-query';

import { renderWithProviders } from '@/shared/testing/render-with-providers';

import { AvatarCard } from './avatar-card';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const user = {
  id: '0199b0a0-0000-7000-8000-000000000001',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  role: 'USER',
  emailVerified: true,
  locale: 'en',
  avatarUrl: null as string | null,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const uploadId = '0199b0a0-0000-4000-8000-0000000000aa';
const avatarUrl = 'http://localhost:9000/template/identity/avatars/u/a?X-Amz-Signature=s';

let fetchMock: ReturnType<typeof mock>;

beforeEach(() => {
  fetchMock = mock(async (url: string, init?: RequestInit) => {
    if (url.endsWith('/me/avatar/uploads')) {
      return json(
        {
          uploadId,
          url: 'http://localhost:9000/template',
          fields: { key: `staging/identity/avatars/u/${uploadId}`, 'Content-Type': 'image/png' },
          expiresAt: '2026-01-01T00:05:00.000Z',
        },
        201,
      );
    }
    if (url === 'http://localhost:9000/template') return new Response(null, { status: 204 });
    if (url.endsWith('/me/avatar') && init?.method === 'PUT') return json({ ...user, avatarUrl });
    return json({ type: 'about:blank', title: 'Not Found', status: 404, code: 'NOT_FOUND' }, 404);
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(cleanup);

const seedUser = (avatar: string | null = null) => ({
  seed: (queryClient: QueryClient) =>
    queryClient.setQueryData(['auth', 'current-user'], { ...user, avatarUrl: avatar }),
});

describe('AvatarCard', () => {
  it('sends the picture to storage, then shows the new avatar', async () => {
    await renderWithProviders(<AvatarCard />, seedUser());
    expect(screen.getByRole('img', { name: 'Picture of Ada Lovelace' }).textContent).toBe('AL');

    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'me.png', {
      type: 'image/png',
    });
    await userEvent.upload(screen.getByTestId('avatar-file'), file);

    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'Picture of Ada Lovelace' }).getAttribute('src')).toBe(
        avatarUrl,
      ),
    );
    const calls = fetchMock.mock.calls as [string, RequestInit][];
    const storageCall = calls.find(([url]) => url === 'http://localhost:9000/template');
    expect(storageCall?.[1].credentials).toBe('omit');
    expect(JSON.parse(String(calls.at(-1)?.[1].body))).toEqual({ uploadId });
  });

  it('refuses an unsupported file before sending anything', async () => {
    await renderWithProviders(<AvatarCard />, seedUser());

    const file = new File(['<svg/>'], 'me.svg', { type: 'image/svg+xml' });
    await userEvent.upload(screen.getByTestId('avatar-file'), file, {
      applyAccept: false,
    });

    expect(await screen.findByText('Choose a PNG, JPEG or WebP picture.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('offers to remove an existing avatar', async () => {
    await renderWithProviders(<AvatarCard />, seedUser(avatarUrl));
    expect(screen.getByRole('button', { name: 'Remove' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Change picture' })).toBeTruthy();
  });
});
