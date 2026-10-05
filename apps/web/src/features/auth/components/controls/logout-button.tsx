'use client';

import { Button } from '@template/ui/primitives/button';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useLogout } from '../../hooks/use-logout';

export function LogoutButton() {
  const t = useTranslations('auth.logout');
  const logout = useLogout();
  return (
    <Button variant="ghost" size="sm" disabled={logout.isPending} onClick={() => logout.mutate()}>
      <LogOut />
      {t('submit')}
    </Button>
  );
}
