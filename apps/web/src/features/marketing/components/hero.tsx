import { Badge } from '@template/ui/primitives/badge';
import { Button } from '@template/ui/primitives/button';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

export function Hero() {
  const t = useTranslations('marketing.hero');
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
      <Badge variant="secondary">{t('eyebrow')}</Badge>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('title')}</h1>
      <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href={AppRoutes.register}>{t('primaryCta')}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={AppRoutes.login}>{t('secondaryCta')}</Link>
        </Button>
      </div>
    </section>
  );
}
