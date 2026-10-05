import type { ReactNode } from 'react';

import { MarketingHeader } from '@/shared/components/layout/marketing-header';
import { SiteFooter } from '@/shared/components/layout/site-footer';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
