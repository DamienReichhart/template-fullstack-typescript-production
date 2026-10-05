import { Button } from '@template/ui/primitives/button';
import { useTranslations } from 'next-intl';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const t = useTranslations('common');
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center"
    >
      <h1 className="text-xl font-semibold">{title ?? t('states.error.title')}</h1>
      <p className="text-sm text-muted-foreground">
        {description ?? t('states.error.description')}
      </p>
      {onRetry ? (
        <Button variant="outline" onClick={onRetry}>
          {t('actions.retry')}
        </Button>
      ) : null}
    </div>
  );
}
