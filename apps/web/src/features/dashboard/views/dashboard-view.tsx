import { EmailVerificationBanner } from '@/features/auth';
import { AvatarCard } from '@/features/avatar';
import { ConnectionTestCard } from '@/features/system';

import { WelcomeHeader } from '../components/welcome-header';

export function DashboardView() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <WelcomeHeader />
      <EmailVerificationBanner />
      <AvatarCard />
      <ConnectionTestCard />
    </div>
  );
}
