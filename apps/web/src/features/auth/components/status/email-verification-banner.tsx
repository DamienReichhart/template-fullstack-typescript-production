'use client';

import { Alert, AlertDescription, AlertTitle } from '@template/ui/primitives/alert';
import { Button } from '@template/ui/primitives/button';
import { MailWarning, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useUiStore } from '@/shared/stores/ui.store';

import { useCurrentUser } from '../../hooks/use-current-user';
import { useResendVerification } from '../../hooks/use-resend-verification';

/** Reminds signed-in users with an unverified email, with a resend button. */
export function EmailVerificationBanner() {
  const t = useTranslations('auth.verificationBanner');
  const tCommon = useTranslations('common.actions');
  const { user } = useCurrentUser();
  const resend = useResendVerification();
  const dismissed = useUiStore((state) => state.verificationBannerDismissed);
  const dismiss = useUiStore((state) => state.dismissVerificationBanner);

  if (!user || user.emailVerified || dismissed) return null;

  return (
    <Alert variant="warning">
      <MailWarning />
      <AlertTitle>{t('message', { email: user.email })}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center gap-2">
        {resend.isSuccess ? (
          <span>{t('sent')}</span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={resend.isPending}
            onClick={() => resend.mutate(user.email)}
          >
            {t('resend')}
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          aria-label={tCommon('dismiss')}
          className="ml-auto"
          onClick={dismiss}
        >
          <X />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
