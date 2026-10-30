'use client';

import { Alert, AlertDescription } from '@template/ui/primitives/alert';
import { Button } from '@template/ui/primitives/button';
import { Skeleton } from '@template/ui/primitives/skeleton';
import { useTranslations } from 'next-intl';

import { useVideos } from '../hooks/use-videos';
import { VideoItem } from './video-item';

/** The signed-in user's videos, newest first, refreshed while one converts. */
export function VideoList() {
  const t = useTranslations('videos');
  const tCommon = useTranslations('common');
  const tErrors = useTranslations('errors');
  const { data, isPending, isError, refetch } = useVideos();

  if (isPending) return <Skeleton className="h-40 w-full" />;
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between gap-2">
          {tErrors('UNKNOWN')}
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            {tCommon('actions.retry')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  if (data.videos.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }
  return (
    <ul className="grid gap-4" aria-label={t('listLabel')}>
      {data.videos.map((video) => (
        <li key={video.id}>
          <VideoItem video={video} />
        </li>
      ))}
    </ul>
  );
}
