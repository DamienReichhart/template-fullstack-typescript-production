'use client';

import type { VideoResponse } from '@template/contracts/media';
import { Spinner } from '@template/ui/components/spinner';
import { Badge } from '@template/ui/primitives/badge';
import { Card, CardContent } from '@template/ui/primitives/card';
import { useFormatter, useTranslations } from 'next-intl';

const BADGE_VARIANT = {
  PROCESSING: 'secondary',
  READY: 'success',
  FAILED: 'destructive',
} as const;

/** One video: its player once converted, its progress or why it failed otherwise. */
export function VideoItem({ video }: { video: VideoResponse }) {
  const t = useTranslations('videos');
  const format = useFormatter();
  const date = format.dateTime(new Date(video.createdAt), {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Card>
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">{t('sentOn', { date })}</span>
          <Badge variant={BADGE_VARIANT[video.status]}>
            {video.status === 'PROCESSING' ? <Spinner /> : null}
            {t(`status.${video.status}`)}
          </Badge>
        </div>
        {video.status === 'READY' && video.url ? (
          <video
            className="w-full rounded-md bg-black"
            src={video.url}
            controls
            playsInline
            preload="metadata"
            aria-label={t('player', { date })}
            style={
              video.width && video.height
                ? { aspectRatio: `${video.width} / ${video.height}`, maxHeight: '70vh' }
                : undefined
            }
          />
        ) : null}
        {video.status === 'FAILED' && video.failureReason ? (
          <p className="text-sm text-destructive">{t(`failure.${video.failureReason}`)}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
