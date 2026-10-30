'use client';

import { isApiError } from '@template/api-client';
import { VIDEO_CONTENT_TYPES } from '@template/contracts/media';
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
import { Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

import { useUploadVideo } from '../hooks/use-upload-video';
import { VideoFileError } from '../lib/check-video-file';

function useErrorMessage(error: unknown): string | null {
  const tErrors = useTranslations('errors');
  const tValidation = useTranslations('validation');
  if (!error) return null;
  if (error instanceof VideoFileError) {
    return tValidation(error.problem.replace(/^validation\./, '') as never);
  }
  const code = isApiError(error) && tErrors.has(error.code as never) ? error.code : 'UNKNOWN';
  return tErrors(code as never);
}

/** Send a video: it goes straight to storage, then converts in the background. */
export function UploadVideoCard() {
  const t = useTranslations('videos');
  const input = useRef<HTMLInputElement>(null);
  const upload = useUploadVideo();
  const error = useErrorMessage(upload.error);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1>{t('title')}</h1>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <input
            ref={input}
            type="file"
            accept={VIDEO_CONTENT_TYPES.join(',')}
            // The button below is the control; the input only opens the file picker.
            className="hidden"
            tabIndex={-1}
            aria-hidden
            data-testid="video-file"
            disabled={upload.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) upload.mutate(file);
            }}
          />
          <Button disabled={upload.isPending} onClick={() => input.current?.click()}>
            {upload.isPending ? <Spinner /> : <Upload />}
            {upload.isPending ? t('uploading') : t('choose')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {upload.isSuccess ? t('uploaded') : ''}
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
