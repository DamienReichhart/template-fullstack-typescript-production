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

void mock.module('next/navigation', () => ({
  ...actualNavigation,
  useRouter: () => router,
  usePathname: () => '/en',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'en' }),
}));

/** Renders a component with the real messages of `locale` and a fresh query client. */
export async function renderWithProviders(ui: ReactElement, locale: Locale = 'en') {
  const messages = await loadMessages(locale);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return {
    queryClient,
    ...render(
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
      </NextIntlClientProvider>,
    ),
  };
}
