import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { renderWithProviders, router } from '@/shared/testing/render-with-providers';

import { LoginForm } from './login-form';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

let fetchMock: ReturnType<typeof mock>;

beforeEach(() => {
  document.cookie = 'tpl_csrf=test-csrf';
  fetchMock = mock(async () => json({}, 200));
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  router.replace.mockClear();
});

afterEach(cleanup);

describe('LoginForm', () => {
  it('shows translated validation messages without calling the API', async () => {
    await renderWithProviders(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy();
    expect(await screen.findByText('Password is required.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows the translated API error for wrong credentials', async () => {
    fetchMock.mockImplementation(async () =>
      json(
        { type: 'about:blank', title: 'Unauthorized', status: 401, code: 'INVALID_CREDENTIALS' },
        401,
      ),
    );
    await renderWithProviders(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email or password is incorrect.')).toBeTruthy();
  });

  it('signs in with the CSRF header and redirects to the dashboard', async () => {
    fetchMock.mockImplementation(async () =>
      json(
        {
          id: '0199b0a0-0000-7000-8000-000000000001',
          email: 'ada@example.com',
          name: 'Ada',
          role: 'USER',
          emailVerified: true,
          avatarUrl: null,
          locale: 'en',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        200,
      ),
    );
    await renderWithProviders(<LoginForm />);

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'correct horse battery');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(router.replace).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.test/api/v1/auth/login');
    expect(new Headers(init.headers).get('x-csrf-token')).toBe('test-csrf');
  });
});
