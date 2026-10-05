import { Button } from '@template/ui/primitives/button';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

export default function NotFound() {
  const t = useTranslations('common');
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
      <h1 className="text-2xl font-semibold">{t('states.notFound.title')}</h1>
      <p className="text-sm text-muted-foreground">{t('states.notFound.description')}</p>
      <Button asChild variant="outline">
        <Link href={AppRoutes.home}>{t('actions.backToHome')}</Link>
      </Button>
    </main>
  );
}
