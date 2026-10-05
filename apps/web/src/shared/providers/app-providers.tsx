'use client';

import type { ReactNode } from 'react';

import { QueryProvider } from './query-provider';
import { ToasterProvider } from './toaster-provider';

/** Every client-side provider of the app, in one place. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <ToasterProvider />
    </QueryProvider>
  );
}
