'use client';

import { isApiError } from '@template/api-client';
import { Spinner } from '@template/ui/components/spinner';
import { Alert, AlertDescription } from '@template/ui/primitives/alert';
import { Button } from '@template/ui/primitives/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@template/ui/primitives/card';
import { Separator } from '@template/ui/primitives/separator';
import { Activity, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useAuthenticatedPing } from '../hooks/use-authenticated-ping';
import { usePing } from '../hooks/use-ping';
import { PingResult } from './ping-result';

/** The "test connection" panel: a public ping and an authenticated one. */
export function ConnectionTestCard() {
  const t = useTranslations('system.connectionTest');
  const tErrors = useTranslations('errors');
  const ping = usePing();
  const authenticated = useAuthenticatedPing();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t('title')}</h2>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <section className="grid gap-3">
          <Button className="w-fit" onClick={() => void ping.refetch()} disabled={ping.isFetching}>
            {ping.isFetching ? <Spinner /> : <Activity />}
            {t('ping')}
          </Button>
          <PingResult data={ping.data} error={ping.error} />
        </section>

        <Separator />

        <section className="grid gap-3">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => void authenticated.refetch()}
            disabled={authenticated.isFetching}
          >
            {authenticated.isFetching ? <Spinner /> : <ShieldCheck />}
            {t('authenticatedPing')}
          </Button>
          {authenticated.error ? (
            <Alert variant="destructive">
              <AlertDescription>
                {isApiError(authenticated.error) &&
                authenticated.error.code === 'EMAIL_NOT_VERIFIED'
                  ? t('requiresVerifiedEmail')
                  : tErrors(
                      (isApiError(authenticated.error) &&
                      tErrors.has(authenticated.error.code as never)
                        ? authenticated.error.code
                        : 'UNKNOWN') as never,
                    )}
              </AlertDescription>
            </Alert>
          ) : authenticated.data ? (
            <p className="text-sm">
              {t('authenticatedAs', {
                email: authenticated.data.user.email,
                role: authenticated.data.user.role,
              })}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('idle')}</p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
