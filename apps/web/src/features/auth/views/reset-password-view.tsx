import { Alert, AlertDescription } from '@template/ui/primitives/alert';
import { useTranslations } from 'next-intl';

import { ResetPasswordForm } from '../components/forms/reset-password-form';
import { AuthCard } from '../components/layout/auth-card';

export function ResetPasswordView({ token }: { token: string | null }) {
  const t = useTranslations('auth.resetPassword');
  return (
    <AuthCard title={t('title')} description={t('description')}>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Alert variant="destructive">
          <AlertDescription>{t('missingToken')}</AlertDescription>
        </Alert>
      )}
    </AuthCard>
  );
}
