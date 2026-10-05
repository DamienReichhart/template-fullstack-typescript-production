'use client';

import { Skeleton } from '@template/ui/primitives/skeleton';
import { useTranslations } from 'next-intl';

import { useCurrentUser } from '@/features/auth';

export function WelcomeHeader() {
  const t = useTranslations('dashboard');
  const { user } = useCurrentUser();
  if (!user) return <Skeleton className="h-14 w-72" />;
  return (
    <header className="grid gap-1">
      <h1 className="text-2xl font-semibold">{t('welcome', { name: user.name })}</h1>
      <p className="text-sm text-muted-foreground">{t('subtitle', { email: user.email })}</p>
    </header>
  );
}
