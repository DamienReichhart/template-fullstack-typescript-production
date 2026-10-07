'use client';

import { isApiError } from '@template/api-client';
import { AVATAR_CONTENT_TYPES } from '@template/contracts/identity';
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
import { ImageUp, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { useCurrentUser } from '@/features/auth';

import { useChangeAvatar } from '../hooks/use-change-avatar';
import { useRemoveAvatar } from '../hooks/use-remove-avatar';
import { AvatarFileError } from '../lib/check-avatar-file';
import { UserAvatar } from './user-avatar';

function useErrorMessage(error: unknown): string | null {
  const tErrors = useTranslations('errors');
  const tValidation = useTranslations('validation');
  if (!error) return null;
  if (error instanceof AvatarFileError) {
    return tValidation(error.problem.replace(/^validation\./, '') as never);
  }
  const code = isApiError(error) && tErrors.has(error.code as never) ? error.code : 'UNKNOWN';
  return tErrors(code as never);
}

/** Choose, replace or remove the signed-in user's avatar. */
export function AvatarCard() {
  const t = useTranslations('avatar');
  const input = useRef<HTMLInputElement>(null);
  const { user } = useCurrentUser();
  const change = useChangeAvatar();
  const remove = useRemoveAvatar();
  const error = useErrorMessage(change.error ?? remove.error);
  const busy = change.isPending || remove.isPending;

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{t('title')}</h2>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size={72} />
          <div className="flex flex-wrap gap-2">
            <input
              ref={input}
              type="file"
              accept={AVATAR_CONTENT_TYPES.join(',')}
              // The button below is the control; the input only opens the file picker.
              className="hidden"
              tabIndex={-1}
              aria-hidden
              data-testid="avatar-file"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) {
                  remove.reset();
                  change.mutate(file);
                }
              }}
            />
            <Button disabled={busy} onClick={() => input.current?.click()}>
              {change.isPending ? <Spinner /> : <ImageUp />}
              {user.avatarUrl ? t('change') : t('choose')}
            </Button>
            {user.avatarUrl ? (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  change.reset();
                  remove.mutate();
                }}
              >
                {remove.isPending ? <Spinner /> : <Trash2 />}
                {t('remove')}
              </Button>
            ) : null}
          </div>
        </div>
        <p className="sr-only" aria-live="polite">
          {change.isPending ? t('uploading') : change.isSuccess ? t('changed') : ''}
          {remove.isSuccess ? t('removed') : ''}
        </p>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
