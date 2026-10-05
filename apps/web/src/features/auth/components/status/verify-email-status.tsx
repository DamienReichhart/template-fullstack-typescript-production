'use client';

import { Spinner } from '@template/ui/components/spinner';
import { Alert, AlertDescription } from '@template/ui/primitives/alert';
import { Button } from '@template/ui/primitives/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';

import { useVerifyEmail } from '../../hooks/use-verify-email';

/** Consumes the verification token from the emailed link, exactly once. */
export function VerifyEmailStatus({ token }: { token: string | null }) {
  const t = useTranslations('auth.verifyEmail');
  const verifyEmail = useVerifyEmail();
  const started = useRef(false);

  useEffect(() => {
    if (token && !started.current) {
      started.current = true;
      verifyEmail.mutate(token);
    }
  }, [token, verifyEmail]);

  if (!token) {
    return (
      <Alert variant="destructive">
        <XCircle />
        <AlertDescription>{t('missingToken')}</AlertDescription>
      </Alert>
    );
  }
  if (verifyEmail.isError) {
    return (
      <Alert variant="destructive">
        <XCircle />
        <AlertDescription>{t('failed')}</AlertDescription>
      </Alert>
    );
  }
  if (verifyEmail.isSuccess) {
    return (
      <div className="grid gap-4">
        <Alert variant="success">
          <CheckCircle2 />
          <AlertDescription>{t('success')}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={AppRoutes.dashboard}>{t('continue')}</Link>
        </Button>
      </div>
    );
  }
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      {t('verifying')}
    </p>
  );
}
