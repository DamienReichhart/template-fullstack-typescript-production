import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { LoginForm } from '../components/forms/login-form';
import { AuthCard } from '../components/layout/auth-card';

export function LoginView() {
  const t = useTranslations('auth.login');
  return (
    <AuthCard
      title={t('title')}
      description={t('description')}
      footer={
        <>
          {t('noAccount')}&nbsp;
          <Link href={AppRoutes.register} className="font-medium text-foreground hover:underline">
            {t('register')}
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
