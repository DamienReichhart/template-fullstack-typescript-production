import type { ReactNode } from 'react';

import { AuthGuard, LogoutButton } from '@/features/auth';
import { AppHeader } from '@/shared/components/layout/app-header';

export default function SignedInLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader actions={<LogoutButton />} />
      <main className="flex-1">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  );
}
