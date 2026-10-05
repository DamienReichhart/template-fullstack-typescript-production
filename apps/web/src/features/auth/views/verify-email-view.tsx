import { useTranslations } from 'next-intl';

import { AuthCard } from '../components/layout/auth-card';
import { VerifyEmailStatus } from '../components/status/verify-email-status';

export function VerifyEmailView({ token }: { token: string | null }) {
  const t = useTranslations('auth.verifyEmail');
  return (
    <AuthCard title={t('title')}>
      <VerifyEmailStatus token={token} />
    </AuthCard>
  );
}
