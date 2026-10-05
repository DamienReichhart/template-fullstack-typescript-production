'use client';

import { isApiError } from '@template/api-client';
import type { PingResponse } from '@template/contracts/system';
import { Alert, AlertDescription } from '@template/ui/primitives/alert';
import { Badge } from '@template/ui/primitives/badge';
import { useTranslations } from 'next-intl';

import { ServiceStatusList } from './service-status-list';

export function PingResult({ data, error }: { data?: PingResponse; error: unknown }) {
  const t = useTranslations('system.connectionTest');
  const tErrors = useTranslations('errors');

  if (error) {
    const code = isApiError(error) && tErrors.has(error.code as never) ? error.code : 'UNKNOWN';
    return (
      <Alert variant="destructive">
        <AlertDescription>{tErrors(code as never)}</AlertDescription>
      </Alert>
    );
  }
  if (!data) return <p className="text-sm text-muted-foreground">{t('idle')}</p>;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant={data.status === 'ok' ? 'success' : 'destructive'}>
          {t(`status.${data.status}`)}
        </Badge>
        <span>{t('version', { version: data.version })}</span>
        <span className="text-muted-foreground">
          {t('environment', { environment: data.environment })}
        </span>
        <span className="text-muted-foreground">
          {t('uptime', { seconds: data.uptimeSeconds })}
        </span>
      </div>
      <ServiceStatusList services={data.services} />
    </div>
  );
}
