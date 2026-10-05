import { Spinner } from '@template/ui/components/spinner';
import { useTranslations } from 'next-intl';

export function LoadingState() {
  const t = useTranslations('common.states');
  return (
    <div
      role="status"
      className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground"
    >
      <Spinner />
      <span>{t('loading')}</span>
    </div>
  );
}
