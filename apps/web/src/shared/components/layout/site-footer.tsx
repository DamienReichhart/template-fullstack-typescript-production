import { useTranslations } from 'next-intl';

export function SiteFooter() {
  const t = useTranslations('common.footer');
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted-foreground">
        {t('copyright', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
