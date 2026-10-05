import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { renderWithProviders } from '@/shared/testing/render-with-providers';

import { ConnectionTestCard } from './connection-test-card';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

let fetchMock: ReturnType<typeof mock>;

beforeEach(() => {
  fetchMock = mock(async (url: string) =>
    url.endsWith('/ping/authenticated')
      ? json(
          { type: 'about:blank', title: 'Forbidden', status: 403, code: 'EMAIL_NOT_VERIFIED' },
          403,
        )
      : json({
          status: 'ok',
          version: '0.1.0',
          environment: 'test',
          uptimeSeconds: 42,
          timestamp: '2026-01-01T00:00:00.000Z',
          services: { database: { status: 'up', latencyMs: 3 }, redis: { status: 'down' } },
        }),
  );
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(cleanup);

describe('ConnectionTestCard', () => {
  it('calls the API only when asked, then shows version and service health', async () => {
    await renderWithProviders(<ConnectionTestCard />);
    expect(fetchMock).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Test connection' }));

    expect(await screen.findByText('Version 0.1.0')).toBeTruthy();
    expect(screen.getByText('3 ms')).toBeTruthy();
    expect(screen.getByText('Redis: Down')).toBeTruthy();
  });

  it('explains why the authenticated test is refused', async () => {
    await renderWithProviders(<ConnectionTestCard />);

    await userEvent.click(screen.getByRole('button', { name: 'Test authenticated connection' }));

    expect(
      await screen.findByText('The authenticated test requires a verified email.'),
    ).toBeTruthy();
  });
});
