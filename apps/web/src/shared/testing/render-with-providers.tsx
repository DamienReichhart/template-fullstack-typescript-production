import { mock } from 'bun:test';
import { loadMessages, type Locale } from '@template/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import * as actualNavigation from 'next/navigation';
import type { ReactElement } from 'react';

export const router = {
  push: mock(() => undefined),
  replace: mock(() => undefined),
  refresh: mock(() => undefined),
};

/** The URL the mocked router reports, locale included. Set it before rendering. */
export const location = { pathname: '/en' };

void mock.module('next/navigation', () => ({
  ...actualNavigation,
  useRouter: () => router,
  usePathname: () => location.pathname,
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'en' }),
}));

interface RenderOptions {
  locale?: Locale;
  /** Seeds the query cache before the first render, e.g. with a signed-in user. */
  seed?: (queryClient: QueryClient) => void;
}

/** Renders a component with the real messages of `locale` and a fresh query client. */
export async function renderWithProviders(
  ui: ReactElement,
  { locale = 'en', seed }: RenderOptions = {},
) {
  const messages = await loadMessages(locale);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity }, mutations: { retry: false } },
  });
  seed?.(queryClient);
  return {
    queryClient,
    ...render(
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </NextIntlClientProvider>,
    ),
  };
}
