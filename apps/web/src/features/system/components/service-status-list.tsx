'use client';

import type { PingResponse } from '@template/contracts/system';
import { StatusDot } from '@template/ui/components/status-dot';
import { useTranslations } from 'next-intl';

export function ServiceStatusList({ services }: { services: PingResponse['services'] }) {
  const t = useTranslations('system.connectionTest');
  return (
    <ul className="grid gap-2">
      {(Object.keys(services) as (keyof PingResponse['services'])[]).map((name) => {
        const service = services[name];
        return (
          <li
            key={name}
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <StatusDot
                tone={service.status}
                label={`${t(`services.${name}`)}: ${t(`status.${service.status}`)}`}
              />
              {t(`services.${name}`)}
            </span>
            <span className="text-muted-foreground">
              {service.latencyMs === undefined
                ? t(`status.${service.status}`)
                : t('latency', { ms: service.latencyMs })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
