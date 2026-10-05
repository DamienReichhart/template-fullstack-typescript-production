import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { RegisterForm } from '../components/forms/register-form';
import { AuthCard } from '../components/layout/auth-card';

export function RegisterView() {
  const t = useTranslations('auth.register');
  return (
    <AuthCard
      title={t('title')}
      description={t('description')}
      footer={
        <>
          {t('hasAccount')}&nbsp;
          <Link href={AppRoutes.login} className="font-medium text-foreground hover:underline">
            {t('login')}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
