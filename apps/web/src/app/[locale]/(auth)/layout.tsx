import type { ReactNode } from 'react';

import { GuestGuard } from '@/features/auth';
import { MarketingHeader } from '@/shared/components/layout/marketing-header';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex flex-1 items-start justify-center px-4 py-16">
        <GuestGuard>{children}</GuestGuard>
      </main>
    </div>
  );
}
