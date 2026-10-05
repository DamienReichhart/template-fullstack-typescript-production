import { beforeEach, describe, expect, it } from 'bun:test';
import { waitFor } from '@testing-library/react';

import { location, renderWithProviders, router } from '@/shared/testing/render-with-providers';

import { authKeys } from '../../api/auth.keys';
import { GuestGuard } from './guest-guard';

const signedIn = {
  id: '0190a3b4-0000-7000-8000-000000000000',
  email: 'ada@example.com',
  name: 'Ada',
  role: 'USER' as const,
  emailVerified: false,
  locale: 'en',
  createdAt: '2026-01-01T00:00:00.000Z',
};

async function renderAt(pathname: string) {
  location.pathname = pathname;
  await renderWithProviders(<GuestGuard>page</GuestGuard>, {
    seed: (queryClient) => queryClient.setQueryData(authKeys.currentUser(), signedIn),
  });
}

describe('GuestGuard', () => {
  beforeEach(() => router.replace.mockClear());

  it('sends signed-in users from guest-only pages to the dashboard', async () => {
    await renderAt('/en/login');
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/en/dashboard'));
  });

  it('leaves signed-in users on the email verification and password reset pages', async () => {
    for (const pathname of ['/en/verify-email', '/en/reset-password']) {
      await renderAt(pathname);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(router.replace).not.toHaveBeenCalled();
  });
});
