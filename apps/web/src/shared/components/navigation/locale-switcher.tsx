'use client';

import { locales, type Locale } from '@template/i18n';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';

export function LocaleSwitcher() {
  const t = useTranslations('common.localeSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="sr-only">{t('label')}</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(event) =>
          startTransition(() => router.replace(pathname, { locale: event.target.value as Locale }))
        }
        className="rounded-md border border-input bg-transparent px-2 py-1 text-sm"
      >
        {locales.map((candidate) => (
          <option key={candidate} value={candidate}>
            {t(`locales.${candidate}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
