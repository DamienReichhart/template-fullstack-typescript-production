import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { LocaleSwitcher } from '../navigation/locale-switcher';
import { NavLink } from '../navigation/nav-link';

/** Header of signed-in pages. Session controls are passed in by the route layout. */
export function AppHeader({ actions }: { actions?: ReactNode }) {
  const t = useTranslations('common');
  return (
    <header className="border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={AppRoutes.dashboard} className="font-semibold">
            {t('appName')}
          </Link>
          <nav aria-label={t('navigation.mainLabel')} className="flex items-center gap-4">
            <NavLink href={AppRoutes.dashboard}>{t('navigation.dashboard')}</NavLink>
            <NavLink href={AppRoutes.videos}>{t('navigation.videos')}</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {actions}
        </div>
      </div>
    </header>
  );
}
