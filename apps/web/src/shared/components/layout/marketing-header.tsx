import { Button } from '@template/ui/primitives/button';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { LocaleSwitcher } from '../navigation/locale-switcher';

export function MarketingHeader() {
  const t = useTranslations('common');
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={AppRoutes.home} className="font-semibold">
          {t('appName')}
        </Link>
        <nav aria-label={t('navigation.mainLabel')} className="flex items-center gap-3">
          <LocaleSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link href={AppRoutes.login}>{t('navigation.login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={AppRoutes.register}>{t('navigation.register')}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
