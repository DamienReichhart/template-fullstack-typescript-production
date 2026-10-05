import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { ForgotPasswordForm } from '../components/forms/forgot-password-form';
import { AuthCard } from '../components/layout/auth-card';

export function ForgotPasswordView() {
  const t = useTranslations('auth.forgotPassword');
  return (
    <AuthCard
      title={t('title')}
      description={t('description')}
      footer={
        <Link href={AppRoutes.login} className="hover:underline">
          {t('backToLogin')}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
